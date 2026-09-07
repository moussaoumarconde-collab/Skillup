import { UserRole, InstructorSubscription } from '@/types';
import { isInstructor, isAdmin, isStudent } from './roles';
import { isSubscriptionActive } from '@/lib/subscriptions';

/**
 * 1. Droits de création de contenu :
 * Un élève ne peut JAMAIS créer de contenu.
 * Seul un formateur (ou un futur administrateur) peut créer une formation.
 */
export const canCreateCourse = (role?: UserRole | null): boolean => {
  return isInstructor(role) || isAdmin(role);
};

/**
 * 2. Droits de modification de contenu (Règle de Propriété stricte) :
 * Un formateur ne peut modifier QUE ses propres contenus (ownerInstructorId === currentUserId).
 * Il ne peut JAMAIS modifier la formation d'un autre formateur.
 * Un élève ne peut JAMAIS modifier de formation.
 */
export const canEditCourse = (
  role: UserRole | null | undefined,
  ownerInstructorId: string,
  currentUserId: string
): boolean => {
  if (isAdmin(role)) return true;
  if (!isInstructor(role)) return false;
  return Boolean(ownerInstructorId && currentUserId && ownerInstructorId === currentUserId);
};

/**
 * 3. Droits de suppression de contenu :
 * Règle de propriété stricte : suppression réservée au créateur ou à l'administrateur.
 */
export const canDeleteCourse = (
  role: UserRole | null | undefined,
  ownerInstructorId: string,
  currentUserId: string
): boolean => {
  if (isAdmin(role)) return true;
  if (!isInstructor(role)) return false;
  return Boolean(ownerInstructorId && currentUserId && ownerInstructorId === currentUserId);
};

/**
 * 4. Droits d'accès à l'espace de gestion formateur (/formateur) :
 * Interdit formellement aux élèves.
 */
export const canAccessInstructorSpace = (role?: UserRole | null): boolean => {
  return isInstructor(role) || isAdmin(role);
};

/**
 * 5. Droits de consultation de cours :
 * - Si le cours est public : accessible à tous (visiteurs, élèves, formateurs).
 * - Si le cours est privé ou payant : l'utilisateur doit avoir un accès vérifié
 *   OU être le formateur propriétaire du cours.
 */
export const canViewCourse = (
  isPublic: boolean,
  hasAccess: boolean,
  ownerInstructorId?: string,
  currentUserId?: string
): boolean => {
  if (isPublic) return true;
  if (hasAccess) return true;
  if (ownerInstructorId && currentUserId && ownerInstructorId === currentUserId) return true;
  return false;
};

/**
 * 6. Détermine si le formateur possède un abonnement actif en cours
 */
export const hasActiveInstructorSubscription = (
  subscription: InstructorSubscription | null | undefined
): boolean => {
  return isSubscriptionActive(subscription);
};

/**
 * 7. Condition de publication d'une formation :
 * Cas obligatoires :
 * - student + false    -> false
 * - student + true     -> false (un élève ne publie JAMAIS de formation)
 * - instructor + false -> false (sans abonnement actif, publication refusée)
 * - instructor + true  -> true  (avec abonnement actif, publication autorisée)
 * - admin + anything   -> true
 */
export const canPublishCourse = (
  role: UserRole | null | undefined,
  hasActiveSubscription: boolean
): boolean => {
  if (isAdmin(role)) return true;
  if (!isInstructor(role)) return false;
  return Boolean(hasActiveSubscription);
};
