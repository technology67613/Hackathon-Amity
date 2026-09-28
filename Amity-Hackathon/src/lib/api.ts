import { supabase } from './supabase/client'
import type { Item, ReportInput } from '../types'

export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items_public')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Item[]
}

export async function reportItem(input: ReportInput & { id: string }): Promise<void> {
  const { error } = await supabase.rpc('report_item', {
    p_id: input.id,
    p_type: input.type,
    p_name: input.name,
    p_category: input.category,
    p_location: input.location,
    p_date: input.date,
    p_description: input.description,
    p_contact: input.contact,
    p_question: input.question,
    p_answer: input.answer,
  })
  if (error) throw error
}

export async function claimItem(id: string, answer: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('claim_item', { p_id: id, p_answer: answer })
  if (error) throw error
  return data as string | null
}

export async function markReturned(id: string): Promise<void> {
  const { error } = await supabase.rpc('mark_returned', { p_id: id })
  if (error) throw error
}
