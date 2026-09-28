import type { Category, Priority } from '../types'

const PRIORITY_MAP: Record<Category, Priority> = {
  Electronics: 'high',
  Documents: 'high',
  Accessories: 'medium',
  Bags: 'medium',
  Books: 'low',
  Other: 'low',
}

export function priorityOf(category: Category): Priority {
  return PRIORITY_MAP[category] ?? 'low'
}
