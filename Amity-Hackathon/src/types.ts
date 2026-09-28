export type ItemType = 'lost' | 'found'
export type Category = 'Electronics' | 'Documents' | 'Accessories' | 'Books' | 'Bags' | 'Other'
export type Priority = 'high' | 'medium' | 'low'

export interface Item {
  id: string
  type: ItemType
  name: string
  category: Category
  location: string
  date: string
  description: string
  question: string
  returned: boolean
  created_at: string
}

export interface Match {
  item: Item
  score: number
}

export interface ReportInput {
  type: ItemType
  name: string
  category: Category
  location: string
  date: string
  description: string
  contact: string
  question: string
  answer: string
}
