// Supabase integration (optional - falls back to localStorage)
// Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local

let supabaseClient: unknown = null;

export async function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  const { createClient } = await import('@supabase/supabase-js');
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

export async function saveProjectToCloud(project: Record<string, unknown>) {
  const sb = await getSupabase();
  if (!sb) {
    // Fallback to localStorage
    const saves = JSON.parse(localStorage.getItem('nd_projects') || '[]');
    const idx = saves.findIndex((s: { name?: string }) => s.name === project.name);
    if (idx >= 0) saves[idx] = project; else saves.push(project);
    localStorage.setItem('nd_projects', JSON.stringify(saves));
    return { success: true, storage: 'local' };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any).from('projects').upsert(project).select().single();
  return { success: !error, data, error, storage: 'cloud' };
}
