import { createClient } from '@supabase/supabase-js';

function requiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `[Supabase] Missing ${name}. Add it to .env.local (or your runtime env).`,
    );
  }
  return value;
}

// Prefer Vite-exposed envs, but also support non-VITE envs via vite.define.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? (process.env.SUPABASE_URL as string | undefined);

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  (process.env.SUPABASE_ANON_KEY as string | undefined);

export const supabase = createClient(
  requiredEnv('VITE_SUPABASE_URL (or SUPABASE_URL)', supabaseUrl),
  requiredEnv('VITE_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)', supabaseAnonKey),
);

