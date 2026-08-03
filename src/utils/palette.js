import { BLOCK_TYPES } from './blockStats'

export const TYPE_COLORS = {
  Image: 'var(--chart-1)',
  Link: 'var(--chart-2)',
  Text: 'var(--chart-3)',
  Attachment: 'var(--chart-4)',
  Embed: 'var(--chart-5)',
}

export const VISIBILITY_COLORS = {
  public: 'var(--color-public)',
  closed: 'var(--color-closed)',
  private: 'var(--color-private)',
}

/** Unknown block types get a neutral tone rather than borrowing a known colour. */
export function colorForType(type) {
  return TYPE_COLORS[type] ?? 'var(--color-faint)'
}

export function typeSegments(byType, typeOrder) {
  const order = typeOrder?.length ? typeOrder : BLOCK_TYPES
  return order.map((type) => ({
    key: type,
    label: type,
    count: byType?.[type] ?? 0,
    color: colorForType(type),
  }))
}
