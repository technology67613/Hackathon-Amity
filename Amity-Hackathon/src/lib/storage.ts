const MINE_KEY = 'clf:mine'
const SAVED_KEY = 'clf:saved'
const ATTEMPTS_PREFIX = 'clf:attempts:'

function readList(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as string[]
  } catch {
    return []
  }
}

function writeList(key: string, list: string[]): void {
  localStorage.setItem(key, JSON.stringify(list))
}

export function addToMine(id: string): void {
  const list = readList(MINE_KEY)
  if (!list.includes(id)) writeList(MINE_KEY, [id, ...list])
}

export function getMine(): string[] {
  return readList(MINE_KEY)
}

export function addToSaved(id: string): void {
  const list = readList(SAVED_KEY)
  if (!list.includes(id)) writeList(SAVED_KEY, [id, ...list])
}

export function removeFromSaved(id: string): void {
  writeList(SAVED_KEY, readList(SAVED_KEY).filter(i => i !== id))
}

export function getSaved(): string[] {
  return readList(SAVED_KEY)
}

export function isSaved(id: string): boolean {
  return getSaved().includes(id)
}

export function getAttempts(id: string): number {
  return parseInt(sessionStorage.getItem(ATTEMPTS_PREFIX + id) ?? '0', 10)
}

export function incrementAttempts(id: string): number {
  const n = getAttempts(id) + 1
  sessionStorage.setItem(ATTEMPTS_PREFIX + id, String(n))
  return n
}

export function resetAttempts(id: string): void {
  sessionStorage.removeItem(ATTEMPTS_PREFIX + id)
}
