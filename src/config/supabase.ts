// config/supabase.ts
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  apiKey: process.env.NEXT_PUBLIC_SUPABASE_API_KEY!,
};