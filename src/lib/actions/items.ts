'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Item, ItemType } from '@/lib/types'

// Metascraper setup
import metascraper from 'metascraper'
import metascraperDescription from 'metascraper-description'
import metascraperImage from 'metascraper-image'
import metascraperTitle from 'metascraper-title'
import metascraperUrl from 'metascraper-url'

const scraper = metascraper([
  metascraperDescription(),
  metascraperImage(),
  metascraperTitle(),
  metascraperUrl()
])

export async function getInboxItems(): Promise<Item[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('status', 'inbox')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching inbox items:', error)
    return []
  }

  return data as Item[]
}

export async function createItem(formData: FormData) {
  const supabase = await createClient()
  const url = formData.get('url') as string
  
  if (!url) return

  // Scrape metadata
  let title = url
  let description = null
  let image_url = null

  try {
    const response = await fetch(url)
    const html = await response.text()
    const metadata = await scraper({ html, url })
    
    if (metadata.title) title = metadata.title
    if (metadata.description) description = metadata.description
    if (metadata.image) image_url = metadata.image
  } catch (e) {
    console.error('Failed to scrape metadata:', e)
    // Fallback to URL as title if scraping fails
  }
  
  // Infer type roughly from extension or domain
  let type: ItemType = 'article'
  if (url.includes('youtube.com') || url.includes('vimeo')) type = 'video'
  if (url.match(/\.(jpg|jpeg|png|gif)$/i)) type = 'image'
  if (url.includes('twitter.com') || url.includes('x.com')) type = 'thread'

  const { error } = await supabase.from('items').insert({
    url,
    title,
    description,
    image_url,
    type,
    status: 'inbox',
    user_id: (await supabase.auth.getUser()).data.user?.id
  })

  if (error) {
    console.error('Error creating item:', error)
    throw new Error('Failed to create item')
  }

  revalidatePath('/inbox')
}

export async function updateItemStatus(id: string, status: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('items')
      .update({ status })
      .eq('id', id)
  
    if (error) {
      console.error('Error updating item status:', error)
      throw new Error('Failed to update item status')
    }
  
    revalidatePath('/inbox')
    revalidatePath('/queue')
    revalidatePath('/library')
  }
