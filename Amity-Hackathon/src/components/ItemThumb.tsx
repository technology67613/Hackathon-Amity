import { useState } from 'react'
import { Tag, Briefcase, Book, Zap, FileText, HelpCircle } from 'lucide-react'
import type { Item, Category } from '../types'
import { getItemImage } from '../lib/images'

const CATEGORY_ICONS: Record<Category, typeof Tag> = {
  Electronics: Zap,
  Documents: FileText,
  Accessories: Tag,
  Books: Book,
  Bags: Briefcase,
  Other: HelpCircle,
}

const CATEGORY_COLORS: Record<Category, string> = {
  Electronics: '#5B7BFA',
  Documents: '#16A34A',
  Accessories: '#F5B942',
  Books: '#E5484D',
  Bags: '#7C3AED',
  Other: '#8A9BB8',
}

interface ItemThumbProps {
  item: Item
  size?: number
}

export function ItemThumb({ item, size = 100 }: ItemThumbProps) {
  const [imgError, setImgError] = useState(false)
  const imgSrc = getItemImage(item)
  const Icon = CATEGORY_ICONS[item.category] ?? HelpCircle
  const color = CATEGORY_COLORS[item.category] ?? '#8A9BB8'

  if (imgSrc && !imgError) {
    return (
      <img
        src={imgSrc}
        alt={item.name}
        onError={() => setImgError(true)}
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }}
      />
    )
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 12,
      background: `linear-gradient(135deg, ${color}22, ${color}44)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={size * 0.38} color={color} strokeWidth={1.5} />
    </div>
  )
}
