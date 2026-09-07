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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error(
      '[createAdminClient] Configuration Supabase incomplète : NEXT_PUBLIC_SUPABASE_URL manquante.'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      '[createAdminClient] Sécurité critique : SUPABASE_SERVICE_ROLE_KEY manquante ou vide côté serveur. Aucun fallback anon autorisé.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
