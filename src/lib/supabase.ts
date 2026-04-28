import { createClient } from '@supabase/supabase-js'

export const PROJECT_STORAGE_BUCKET = 'project_files'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const getPublicFileUrl = (filePath: string | null | undefined) => {
  if (!supabase || !filePath) {
    return null
  }

  const { data } = supabase.storage
    .from(PROJECT_STORAGE_BUCKET)
    .getPublicUrl(filePath)

  return data.publicUrl
}
