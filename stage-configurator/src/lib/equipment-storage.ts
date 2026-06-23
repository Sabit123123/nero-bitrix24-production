import { createClient } from '@supabase/supabase-js';
import { CustomEquipment } from '@/types';

export type { CustomEquipment };

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('your-project')) return null;
  return createClient(url, key);
}

export async function saveCustomEquipment(item: CustomEquipment): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    // localStorage fallback
    const list = getLocalCustomEquipment();
    const idx = list.findIndex(e => e.id === item.id);
    if (idx >= 0) list[idx] = item; else list.push(item);
    localStorage.setItem('nd_custom_equipment', JSON.stringify(list));
    return;
  }

  const { error } = await sb.from('equipment').upsert({
    id: item.id,
    cat: item.cat,
    name: item.name,
    emoji: item.emoji,
    width_m: item.w,
    depth_m: item.d,
    height_m: item.h,
    weight_kg: item.weight,
    brand: item.brand,
    model_url: item.modelUrl,
    preview_url: item.previewUrl ?? null,
    active: true,
  });

  if (error) {
    // Fall back to localStorage so the user does not lose the import
    console.warn('Supabase saveCustomEquipment error, falling back to local:', error.message);
    const list = getLocalCustomEquipment();
    const idx = list.findIndex(e => e.id === item.id);
    if (idx >= 0) list[idx] = item; else list.push(item);
    localStorage.setItem('nd_custom_equipment', JSON.stringify(list));
  }
}

export async function listCustomEquipment(): Promise<CustomEquipment[]> {
  const sb = getSupabase();
  if (!sb) return getLocalCustomEquipment();

  const { data, error } = await sb
    .from('equipment')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase listCustomEquipment error, falling back to local:', error.message);
    return getLocalCustomEquipment();
  }

  return (data ?? []).map(r => ({
    id: r.id,
    cat: r.cat,
    name: r.name,
    emoji: r.emoji ?? '📦',
    w: r.width_m,
    d: r.depth_m,
    h: r.height_m,
    weight: r.weight_kg,
    brand: r.brand ?? '',
    color: '#333333',
    modelUrl: r.model_url,
    previewUrl: r.preview_url ?? undefined,
    isCustom: true as const,
  }));
}

export async function deleteCustomEquipment(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) await sb.from('equipment').update({ active: false }).eq('id', id);
  const list = getLocalCustomEquipment().filter(e => e.id !== id);
  localStorage.setItem('nd_custom_equipment', JSON.stringify(list));
}

function getLocalCustomEquipment(): CustomEquipment[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('nd_custom_equipment') || '[]'); } catch { return []; }
}
