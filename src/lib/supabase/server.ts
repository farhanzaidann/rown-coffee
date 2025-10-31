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
        getAll() {
          // Get all cookies as an array of objects with name and value
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
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