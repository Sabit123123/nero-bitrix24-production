import { NextRequest, NextResponse } from 'next/server';
import CloudConvert from 'cloudconvert';
import { createClient } from '@supabase/supabase-js';

const SUPPORTED = ['skp', 'obj', 'fbx', 'dae'];

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = (formData.get('name') as string) || file?.name?.replace(/\.[^.]+$/, '') || 'model';

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

    // GLB/GLTF — try Supabase, fall back with error (client handles blob URL fallback)
    if (ext === 'glb' || ext === 'gltf') {
      const url = await tryStoreInSupabase(file, name);
      if (!url) return NextResponse.json({ error: 'No Supabase configured for storage' }, { status: 503 });
      return NextResponse.json({ glbUrl: url, name, source: 'direct' });
    }

    if (!SUPPORTED.includes(ext)) {
      return NextResponse.json({ error: `Unsupported format: .${ext}` }, { status: 400 });
    }

    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'SKP conversion requires CLOUDCONVERT_API_KEY. Set it in environment variables.',
        hint: 'Get a free API key at cloudconvert.com (25 free conversions/day)',
      }, { status: 503 });
    }

    const glbUrl = await convertWithCloudConvert(file, ext, name, apiKey);
    return NextResponse.json({ glbUrl, name, source: 'cloudconvert' });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Conversion failed';
    console.error('convert-skp error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function convertWithCloudConvert(file: File, fromFormat: string, name: string, apiKey: string): Promise<string> {
  // Try production first; if auth fails (sandbox key), retry in sandbox mode
  for (const sandbox of [false, true]) {
    try {
      return await runCloudConvertJob(file, fromFormat, name, apiKey, sandbox);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      const isForbidden = msg.includes('403') || msg.includes('Forbidden') || msg.includes('Unauthorized') || msg.includes('401');
      if (!sandbox && isForbidden) {
        console.warn('CloudConvert production mode failed with auth error, retrying in sandbox mode');
        continue;
      }
      throw err;
    }
  }
  throw new Error('CloudConvert: both production and sandbox modes failed');
}

async function runCloudConvertJob(file: File, fromFormat: string, name: string, apiKey: string, sandbox: boolean): Promise<string> {
  const cc = new CloudConvert(apiKey, sandbox);

  const job = await cc.jobs.create({
    tag: `nd-${Date.now()}`,
    tasks: {
      'upload': {
        operation: 'import/upload',
      },
      'convert': {
        operation: 'convert',
        input: ['upload'],
        input_format: fromFormat,
        output_format: 'glb',
        ...(fromFormat === 'skp' ? {
          engine: 'sketchup',
          engine_version: '2023',
        } : {}),
      },
      'export': {
        operation: 'export/url',
        input: ['convert'],
        inline: false,
        archive_multiple_files: false,
      },
    },
  });

  const uploadTask = job.tasks.find(t => t.name === 'upload');
  if (!uploadTask) throw new Error('No upload task in CloudConvert job');

  await cc.tasks.upload(uploadTask, new Blob([await file.arrayBuffer()]), file.name);

  const finished = await cc.jobs.wait(job.id);

  const exportTask = finished.tasks.find(t => t.name === 'export' && t.status === 'finished');
  const downloadUrl = exportTask?.result?.files?.[0]?.url;
  if (!downloadUrl) throw new Error('CloudConvert: no output URL');

  // Try to persist in Supabase; if not configured, return CloudConvert URL directly (~24h valid)
  const storedUrl = await tryStoreGlbFromUrl(downloadUrl, name);
  return storedUrl ?? downloadUrl;
}

async function tryStoreGlbFromUrl(downloadUrl: string, name: string): Promise<string | null> {
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!sbUrl || !sbKey || sbUrl.includes('your-project')) return null;

  try {
    const glbResponse = await fetch(downloadUrl);
    if (!glbResponse.ok) return null;
    const glbBlob = await glbResponse.blob();
    const glbFile = new File([glbBlob], `${name}.glb`, { type: 'model/gltf-binary' });
    return await tryStoreInSupabase(glbFile, name);
  } catch {
    return null;
  }
}

async function tryStoreInSupabase(file: File | Blob, name: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your-project')) return null;

  try {
    const sb = createClient(url, key);
    const path = `models/${Date.now()}-${name.replace(/[^a-z0-9-]/gi, '_')}.glb`;

    const arrayBuffer = await file.arrayBuffer();
    const { error } = await sb.storage.from('models').upload(path, arrayBuffer, {
      contentType: 'model/gltf-binary',
      upsert: false,
    });

    if (error) return null;

    const { data: { publicUrl } } = sb.storage.from('models').getPublicUrl(path);
    return publicUrl;
  } catch {
    return null;
  }
}
