'use client';

export interface ConvertResult {
  glbUrl: string;
  name: string;
  source: 'direct' | 'cloudconvert' | 'blob';
  error?: string;
}

export async function convertModel(file: File, name?: string): Promise<ConvertResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const modelName = name || file.name.replace(/\.[^.]+$/, '');

  // GLB/GLTF: try server upload first, fall back to local blob URL for the session
  if (ext === 'glb' || ext === 'gltf') {
    try {
      const result = await callConvertAPI(file, modelName);
      return result;
    } catch {
      // Fallback: local blob URL (works in session only)
      const url = URL.createObjectURL(file);
      return { glbUrl: url, name: modelName, source: 'blob' };
    }
  }

  // SKP / OBJ / FBX / DAE: must go through server
  return callConvertAPI(file, modelName);
}

async function callConvertAPI(file: File, name: string): Promise<ConvertResult> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('name', name);

  const res = await fetch('/api/convert-skp', { method: 'POST', body: fd });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || 'Conversion failed');
  }

  return { glbUrl: json.glbUrl, name: json.name, source: json.source };
}
