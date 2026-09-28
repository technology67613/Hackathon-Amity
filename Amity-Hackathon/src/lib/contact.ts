export interface ParsedContact {
  phones: string[]
  emails: string[]
}

export function parseContact(raw: string): ParsedContact {
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean)
  const phones: string[] = []
  const emails: string[] = []
  for (const p of parts) {
    if (p.includes('@')) emails.push(p)
    else phones.push(p)
  }
  return { phones, emails }
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) {
    return phone.slice(0, phone.indexOf(digits[0]) + 3) + '••• •••' + digits.slice(-3)
  }
  return '•••••••••••'
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '•••@•••.•••'
  return local[0] + '•••@' + domain
}

export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/\s/g, '')
}

export function mailHref(email: string, itemName: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(`Campus Lost & Found: ${itemName}`)}`
}
