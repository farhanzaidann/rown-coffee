// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_CONFIG } from '@/config/supabase';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.key,
    {
      cookies: {
        getAll() {
          // At build time, return empty array
          return [];
        },
        setAll(cookiesToSet) {
          try {
            // At build time, just return without setting
            return;
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};