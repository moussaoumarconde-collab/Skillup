import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecbcnzaghaveoiibwtkv.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmNuemFnaGF2ZW9paWJ3dGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTk1NzIsImV4cCI6MjEwNDI5NTU3Mn0.XF5WlRvnpwRS6K9I-R9wnZaEZ8-ahvPXzJVzr-hnNlM';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Invoqué depuis un Server Component : peut être ignoré
        }
      },
    },
  });
}
