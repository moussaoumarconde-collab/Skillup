import { SubscriptionPlan, SubscriptionPlanConfig } from '@/types';

/**
 * SKILLUP - CONFIGURATION OFFICIELLE DES PLANS D'ABONNEMENT FORMATEUR (PHASE 9C)
 * 
 * Règle métier absolue :
 * - Les élèves ne paient AUCUN abonnement.
 * - Les tarifs et caractéristiques ci-dessous sont centralisés ici et font autorité.
 * - Aucun prix ne doit être dispersé ou codé en dur dans les composants React.
 * - La devise officielle est le Franc CFA (XOF).
 */

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanConfig> = {
  monthly: {
    id: 'monthly',
    name: 'Plan Mensuel',
    tagline: 'Idéal pour démarrer et tester vos premières publications',
    badge: 'Sans engagement',
    amount: 9900, // 9 900 FCFA / mois
    currency: 'XOF',
    interval: 'month',
    durationDays: 30,
    features: [
      'Publication illimitée de formations en ligne',
      'Gestion complète des modules et leçons',
      'Création d’exercices et quiz interactifs',
      'Accès aux statistiques de performance',
      'Renouvellement mensuel flexible',
    ],
    isPopular: false,
  },
  yearly: {
    id: 'yearly',
    name: 'Plan Annuel',
    tagline: 'La formule optimale pour les formateurs réguliers (2 mois offerts)',
    badge: 'Économie annuelle',
    amount: 99000, // 99 000 FCFA / an (économie équivalente à 2 mois)
    currency: 'XOF',
    interval: 'year',
    durationDays: 365,
    features: [
      'Tous les avantages du Plan Mensuel',
      'Publication continue garantie sur 12 mois',
      'Économie immédiate de 2 mois d’abonnement',
      'Accès prioritaire aux nouvelles fonctionnalités',
      'Facturation annuelle simplifiée',
    ],
    isPopular: true,
  },
};

/**
 * Récupère la configuration d'un plan par son identifiant
 */
export const getPlanConfig = (planId: string): SubscriptionPlanConfig | null => {
  if (planId === 'monthly' || planId === 'yearly') {
    return SUBSCRIPTION_PLANS[planId as SubscriptionPlan];
  }
  return null;
};

/**
 * Formate un montant en devise locale (ex: 9 900 FCFA)
 */
export const formatPlanPrice = (amount: number, currency: string = 'XOF'): string => {
  const formatted = new Intl.NumberFormat('fr-FR').format(amount);
  return `${formatted} ${currency === 'XOF' ? 'FCFA' : currency}`;
};

/**
 * Calcule la date d'expiration d'un abonnement en fonction du plan
 */
export const calculateExpirationDate = (
  plan: SubscriptionPlan,
  startDate: Date = new Date()
): Date => {
  const config = SUBSCRIPTION_PLANS[plan];
  const expiration = new Date(startDate.getTime());
  expiration.setDate(expiration.getDate() + config.durationDays);
  return expiration;
};
