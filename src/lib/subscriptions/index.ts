import { InstructorSubscription, SubscriptionPlan } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { calculateExpirationDate } from './plans';

/**
 * Détermine si un abonnement formateur est réellement actif.
 * Règle de sécurité :
 * - Le statut doit être 'active'.
 * - La date d'expiration (expires_at) doit exister et être strictement postérieure à l'instant présent.
 * - Si expires_at < maintenant, l'abonnement est considéré inactif (même si status = 'active' en base).
 */
export const isSubscriptionActive = (
  subscription: InstructorSubscription | null | undefined
): boolean => {
  if (!subscription) return false;
  if (subscription.status !== 'active') return false;
  if (!subscription.expires_at) return false;

  const expirationTimestamp = new Date(subscription.expires_at).getTime();
  if (isNaN(expirationTimestamp)) return false;

  return expirationTimestamp > Date.now();
};

/**
 * Récupère l'abonnement le plus récent d'un formateur
 */
export const getInstructorSubscription = async (
  instructorId: string
): Promise<InstructorSubscription | null> => {
  if (!instructorId) return null;

  // 1. Tentative de lecture Supabase
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('instructor_subscriptions')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data as InstructorSubscription;
    }
  } catch {
    // Mode déconnecté / local
  }

  // 2. Repli de stockage local pour le développement
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`skillup_sub_${instructorId}`);
      if (stored) {
        return JSON.parse(stored) as InstructorSubscription;
      }
    } catch {
      // Ignorer
    }
  }

  return null;
};

/**
 * Sauvegarde ou active un abonnement (supporte Supabase et repli local)
 */
export const saveInstructorSubscriptionLocal = (
  subscription: InstructorSubscription
): void => {
  if (typeof window !== 'undefined' && subscription?.instructor_id) {
    try {
      localStorage.setItem(
        `skillup_sub_${subscription.instructor_id}`,
        JSON.stringify(subscription)
      );
    } catch (err) {
      console.warn('Erreur sauvegarde locale abonnement:', err);
    }
  }
};

/**
 * Formatage d'une date en format lisible français (ex: 15 octobre 2026)
 */
export const formatSubscriptionDate = (dateString?: string | null): string => {
  if (!dateString) return 'Non définie';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

