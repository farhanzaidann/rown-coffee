// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_CONFIG } from '@/config/supabase';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.key,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {} // Leave empty to avoid errors during build
      },
    }
  );
};