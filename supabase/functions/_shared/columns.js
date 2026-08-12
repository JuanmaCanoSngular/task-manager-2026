/** Semillas y consultas de columnas para Edge Functions (sin ESM de interfaces). */

export const DEFAULT_COLUMN_DEFS = [
  { name: 'Pendiente', color: '#64748b', slug: 'backlog', isInbox: true, position: 0 },
  { name: 'En progreso', color: '#eab308', slug: 'in-progress', isInbox: false, position: 1 },
  { name: 'Bloqueos', color: '#ef4444', slug: 'in-review', isInbox: false, position: 2 },
  { name: 'Completada', color: '#4ade80', slug: 'completed', isInbox: false, position: 3 },
];

export async function seedDefaultColumns(supabase, boardId, userId) {
  const rows = DEFAULT_COLUMN_DEFS.map((def) => ({
    board_id: boardId,
    user_id: userId,
    name: def.name,
    color: def.color,
    position: def.position,
    slug: def.slug,
    is_inbox: def.isInbox,
  }));

  const { data, error } = await supabase.from('board_columns').insert(rows).select('id, slug, is_inbox');
  if (error) throw error;
  return data ?? [];
}

export async function getInboxColumnId(supabase, boardId) {
  const { data } = await supabase
    .from('board_columns')
    .select('id')
    .eq('board_id', boardId)
    .eq('is_inbox', true)
    .maybeSingle();
  return data?.id ?? null;
}

export async function getBlockersColumnId(supabase, boardId) {
  const { data } = await supabase
    .from('board_columns')
    .select('id')
    .eq('board_id', boardId)
    .eq('slug', 'in-review')
    .maybeSingle();
  return data?.id ?? null;
}

export function columnIdBySlug(columns, slug) {
  return columns?.find((c) => c.slug === slug)?.id ?? null;
}
