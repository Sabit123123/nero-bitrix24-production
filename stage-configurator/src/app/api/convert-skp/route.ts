import { NextRequest, NextResponse } from 'next/server';
import CloudConvert from 'cloudconvert';
import { createClient } from '@supabase/supabase-js';

const SUPPORTED = ['skp', 'obj', 'fbx', 'dae'];

export const maxDuration = 60; // Vercel: extend timeout for conversion

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = (formData.get('name') as string) || file?.name?.replace(/\.[^.]+$/, '') || 'model';

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

    // GLB/GLTF — no conversion needed
    if (ext === 'glb' || ext === 'gltf') {
      const url = await storeInSupabase(file, name);
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
  const cc = new CloudConvert(apiKey, false); // false = production mode

  // 1. Create job
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
        // SKP-specific options for better geometry extraction
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

  // 2. Upload the file
  const uploadTask = job.tasks.find(t => t.name === 'upload');
  if (!uploadTask) throw new Error('No upload task in CloudConvert job');

  await cc.tasks.upload(uploadTask, new Blob([await file.arrayBuffer()]), file.name);

  // 3. Wait for completion (poll)
  const finished = await cc.jobs.wait(job.id);

  // 4. Get download URL
  const exportTask = finished.tasks.find(t => t.name === 'export' && t.status === 'finished');
  const downloadUrl = exportTask?.result?.files?.[0]?.url;
  if (!downloadUrl) throw new Error('CloudConvert: no output URL');

  // 5. Download GLB and store in Supabase Storage
  const glbResponse = await fetch(downloadUrl);
  if (!glbResponse.ok) throw new Error('Failed to download converted GLB');
  const glbBlob = await glbResponse.blob();
  const glbFile = new File([glbBlob], `${name}.glb`, { type: 'model/gltf-binary' });

  return storeInSupabase(glbFile, name);
}

async function storeInSupabase(file: File | Blob, name: string): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your-project')) {
    // No Supabase — we can't persist server-side without storage.
    throw new Error('Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to store models');
  }

  const sb = createClient(url, key);
  const path = `models/${Date.now()}-${name.replace(/[^a-z0-9-]/gi, '_')}.glb`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await sb.storage.from('models').upload(path, arrayBuffer, {
    contentType: 'model/gltf-binary',
    upsert: false,
  });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: { publicUrl } } = sb.storage.from('models').getPublicUrl(path);
  return publicUrl;
}
