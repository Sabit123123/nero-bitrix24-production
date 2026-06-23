import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project } from '@/types';

// Lazy singleton
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('your-project')) return null;
  _client = createClient(url, key);
  return _client;
}

export const isCloudAvailable = () => !!getClient();

// ─── Projects ────────────────────────────────────────────────

export async function listProjects(): Promise<Project[]> {
  const sb = getClient();
  if (!sb) return listProjectsLocal();

  const { data, error } = await sb
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn('Supabase listProjects error, falling back to local:', error.message);
    return listProjectsLocal();
  }
  return (data ?? []).map(rowToProject);
}

export async function saveProject(project: Project): Promise<{ id: string; storage: 'cloud' | 'local' }> {
  const sb = getClient();
  if (!sb) return saveProjectLocal(project);

  const row = projectToRow(project);
  const { data, error } = await sb
    .from('projects')
    .upsert(row, { onConflict: project.id ? 'id' : 'name' })
    .select('id')
    .single();

  if (error) {
    console.warn('Supabase saveProject error, falling back to local:', error.message);
    return saveProjectLocal(project);
  }
  return { id: data.id, storage: 'cloud' };
}

export async function deleteProject(id: string): Promise<void> {
  const sb = getClient();
  if (sb) {
    await sb.from('projects').delete().eq('id', id);
  }
  const local = JSON.parse(localStorage.getItem('nd_projects') || '[]') as Project[];
  localStorage.setItem('nd_projects', JSON.stringify(local.filter(p => p.id !== id)));
}

export async function uploadThumbnail(projectId: string, dataUrl: string): Promise<string | null> {
  const sb = getClient();
  if (!sb) return null;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `${projectId}/thumb.jpg`;
    const { error } = await sb.storage.from('renders').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
    if (error) return null;
    const { data } = sb.storage.from('renders').getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}

// ─── Serialization ──────────────────────────────────────────

function projectToRow(p: Project) {
  return {
    ...(p.id ? { id: p.id } : {}),
    name: p.name,
    client: p.client,
    venue: p.venue,
    notes: p.notes,
    date: p.date,
    room_w: p.roomW,
    room_d: p.roomD,
    wall_h: p.wallH,
    objects: p.objects,
    thumbnail: p.thumbnail ?? null,
  };
}

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    client: (row.client as string) || '',
    venue: (row.venue as string) || '',
    notes: (row.notes as string) || '',
    date: row.date as string,
    roomW: row.room_w as number,
    roomD: row.room_d as number,
    wallH: row.wall_h as number,
    objects: (row.objects as Project['objects']) || [],
    thumbnail: (row.thumbnail as string) || undefined,
  };
}

// ─── Local storage fallbacks ─────────────────────────────────

function listProjectsLocal(): Project[] {
  try {
    return JSON.parse(localStorage.getItem('nd_projects') || '[]');
  } catch {
    return [];
  }
}

function saveProjectLocal(project: Project): { id: string; storage: 'local' } {
  const saves = listProjectsLocal();
  const id = project.id || crypto.randomUUID();
  const updated = { ...project, id };
  const idx = saves.findIndex(s => s.id === id || s.name === project.name);
  if (idx >= 0) saves[idx] = updated; else saves.push(updated);
  localStorage.setItem('nd_projects', JSON.stringify(saves));
  return { id, storage: 'local' };
}
