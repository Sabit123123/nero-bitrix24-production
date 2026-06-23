'use client';

export interface ConvertResult {
  glbUrl: string;
  name: string;
  /** 'client-skp' = parsed in-browser (no server/API key needed) */
  source: 'direct' | 'cloudconvert' | 'blob' | 'client-skp';
  error?: string;
}

export async function convertModel(file: File, name?: string): Promise<ConvertResult> {
  const ext       = file.name.split('.').pop()?.toLowerCase() ?? '';
  const modelName = name || file.name.replace(/\.[^.]+$/, '');

  // SKP: parse directly in the browser — no CloudConvert, no API key
  if (ext === 'skp') {
    const { skpFileToGLBUrl } = await import('./skp-loader');
    const glbUrl = await skpFileToGLBUrl(file);
    return { glbUrl, name: modelName, source: 'client-skp' };
  }

  // GLB / GLTF: try Supabase upload; fall back to session blob URL
  if (ext === 'glb' || ext === 'gltf') {
    try {
      return await callConvertAPI(file, modelName);
    } catch {
      return { glbUrl: URL.createObjectURL(file), name: modelName, source: 'blob' };
    }
  }

  // OBJ / FBX / DAE: server-side CloudConvert
  return callConvertAPI(file, modelName);
}

async function callConvertAPI(file: File, name: string): Promise<ConvertResult> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('name', name);

  const res  = await fetch('/api/convert-skp', { method: 'POST', body: fd });
  const json = await res.json();

  if (!res.ok) throw new Error(json.error || 'Conversion failed');

  return { glbUrl: json.glbUrl, name: json.name, source: json.source };
}
