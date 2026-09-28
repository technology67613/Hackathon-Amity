import type { Item, Match } from '../types'
import { tokenize } from './synonyms'

export const THRESHOLD = 50

function overlapCoefficient(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const token of a) if (b.has(token)) intersection++
  return intersection / Math.min(a.size, b.size)
}

export function scorePair(lost: Item, found: Item): number {
  if (lost.type !== 'lost' || found.type !== 'found') return 0
  if (lost.returned || found.returned) return 0

  let score = 0

  // Same category: +30
  if (lost.category === found.category) score += 30

  // Text overlap (name + description): up to +40
  const tokA = tokenize(`${lost.name} ${lost.description ?? ''}`)
  const tokB = tokenize(`${found.name} ${found.description ?? ''}`)
  score += Math.round(overlapCoefficient(tokA, tokB) * 40)

  // Same location: +15
  if (lost.location.toLowerCase().trim() === found.location.toLowerCase().trim()) score += 15

  // Dates within 3 days: +15
  const dA = new Date(lost.date).getTime()
  const dB = new Date(found.date).getTime()
  if (Math.abs(dA - dB) <= 3 * 24 * 60 * 60 * 1000) score += 15

  return Math.min(score, 100)
}

export function getMatches(item: Item, all: Item[]): Match[] {
  const matches: Match[] = []
  for (const other of all) {
    if (other.id === item.id) continue
    if (other.returned) continue
    const lostItem = item.type === 'lost' ? item : other
    const foundItem = item.type === 'found' ? item : other
    if (lostItem.type !== 'lost' || foundItem.type !== 'found') continue
    const score = scorePair(lostItem, foundItem)
    if (score >= THRESHOLD) matches.push({ item: other, score })
  }
  return matches.sort((a, b) => b.score - a.score)
}

export function countMatchedItems(all: Item[]): number {
  const matchedIds = new Set<string>()
  const lostItems = all.filter(i => i.type === 'lost' && !i.returned)
  const foundItems = all.filter(i => i.type === 'found' && !i.returned)
  for (const lost of lostItems) {
    for (const found of foundItems) {
      if (scorePair(lost, found) >= THRESHOLD) {
        matchedIds.add(lost.id)
        matchedIds.add(found.id)
      }
    }
  }
  return matchedIds.size
}
