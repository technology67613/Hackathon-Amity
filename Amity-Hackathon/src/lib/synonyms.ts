// Synonym map: canonical → list of aliases
export const SYNONYMS: Record<string, string[]> = {
  earphones: ['earphone', 'earbuds', 'earbud', 'airpods', 'airpod', 'headphones', 'headphone', 'headset'],
  phone: ['mobile', 'iphone', 'smartphone', 'cellphone', 'handphone'],
  bag: ['backpack', 'bagpack', 'satchel', 'purse', 'handbag'],
  bottle: ['flask', 'tumbler', 'sipper', 'waterbottle'],
  keys: ['key', 'keychain', 'keyfob'],
  wallet: ['purse', 'billfold', 'pouch'],
  id: ['idcard', 'identity', 'identification', 'card'],
  laptop: ['notebook', 'macbook', 'chromebook'],
}

// Build reverse map: alias → canonical
const reverseMap = new Map<string, string>()
for (const [canonical, aliases] of Object.entries(SYNONYMS)) {
  reverseMap.set(canonical, canonical)
  for (const alias of aliases) reverseMap.set(alias, canonical)
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'with', 'in', 'of', 'and', 'near', 'on', 'at',
  'is', 'has', 'was', 'found', 'lost', 'small', 'one',
])

function stemWord(w: string): string {
  return w.endsWith('s') && w.length > 3 ? w.slice(0, -1) : w
}

function normalizeWord(w: string): string {
  const stemmed = stemWord(w)
  return reverseMap.get(stemmed) ?? reverseMap.get(w) ?? stemmed
}

export function tokenize(text: string): Set<string> {
  const tokens = new Set<string>()
  for (const raw of text.toLowerCase().split(/[^a-z]+/)) {
    if (!raw || STOP_WORDS.has(raw)) continue
    tokens.add(normalizeWord(raw))
  }
  return tokens
}

export function expandQuery(q: string): string[] {
  return [...tokenize(q)]
}
