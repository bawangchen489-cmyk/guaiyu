import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 检查是否配置了有效的 Supabase 凭证
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'YOUR_SUPABASE_PROJECT_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  supabaseUrl.includes('supabase.co')
)

// 创建一个模拟的 Supabase 客户端（用于未配置时）
const createMockClient = (): SupabaseClient => {
  const mockError = { message: 'Supabase not configured', code: 'NOT_CONFIGURED' }
  const mockResponse = { data: null, error: mockError }

  return {
    from: () => ({
      select: () => Promise.resolve(mockResponse),
      insert: () => Promise.resolve(mockResponse),
      update: () => Promise.resolve(mockResponse),
      delete: () => Promise.resolve(mockResponse),
      eq: () => ({ single: () => Promise.resolve(mockResponse), select: () => Promise.resolve(mockResponse), delete: () => Promise.resolve(mockResponse) }),
      order: () => Promise.resolve(mockResponse),
      single: () => Promise.resolve(mockResponse),
    }),
    rpc: () => Promise.resolve(mockResponse),
    storage: {
      from: () => ({
        upload: () => Promise.resolve(mockResponse),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as unknown as SupabaseClient
}

// 只在配置有效时创建真实客户端
let supabase: SupabaseClient

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase connected')
} else {
  console.warn('⚠️ Supabase 未配置，使用本地模式。请在 .env.local 中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
  supabase = createMockClient()
}

export { supabase }
export default supabase
