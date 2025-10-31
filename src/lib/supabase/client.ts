// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_CONFIG } from '@/config/supabase';

export const createClient = () => {
  return createBrowserClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.key
  );
};