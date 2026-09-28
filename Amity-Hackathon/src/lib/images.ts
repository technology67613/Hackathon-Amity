import type { Item } from '../types'

const KEYWORD_MAP: Record<string, string> = {
  wallet: 'wallet',
  earphone: 'earphones',
  earphones: 'earphones',
  earbuds: 'earphones',
  airpods: 'earphones',
  backpack: 'backpack',
  bag: 'backpack',
  'id card': 'id-card',
  'student id': 'id-card',
  id: 'id-card',
  bottle: 'bottle',
  book: 'books',
  books: 'books',
  key: 'keys',
  keys: 'keys',
  phone: 'phone',
  mobile: 'phone',
  iphone: 'phone',
}

export function getItemImage(item: Item): string | null {
  const text = `${item.name} ${item.description ?? ''}`.toLowerCase()
  for (const [keyword, file] of Object.entries(KEYWORD_MAP)) {
    if (text.includes(keyword)) return `/items/${file}.png`
  }
  return null
}
