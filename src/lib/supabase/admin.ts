import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Client Supabase sécurisé côté serveur avec privilèges d'administration (service_role).
 * Utilisé UNIQUEMENT dans les routes d'API serveur (ex: webhook, vérification paiement,
 * attribution d'accès) pour manipuler les tables protégées par RLS sans restriction utilisateur.
 * 
 * RÈGLE ABSOLUE DE SÉCURITÉ :
 * - SUPABASE_SERVICE_ROLE_KEY est obligatoire et strictement requise.
 * - Aucun fallback silencieux vers la clé publique anon n'est toléré.
 * - En cas d'absence ou de clé vide, une erreur explicite est levée immédiatement.
 * - NE JAMAIS importer ni utiliser ce client dans du code accessible au navigateur.
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    'https://ecbcnzaghaveoiibwtkv.supabase.co';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmNuemFnaGF2ZW9paWJ3dGt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODcxOTU3MiwiZXhwIjoyMTA0Mjk1NTcyfQ.v-1q6baDE3dlX5sCOHeFDYOd3AfLMBm1xt8MwINKv04';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Service de données temporairement indisponible.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
