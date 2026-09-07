import { UserRole } from '@/types';

/**
 * Détermine si le rôle correspond à un Élève (par défaut si non défini)
 */
export const isStudent = (role?: UserRole | null): boolean => {
  return role === 'student' || !role;
};

/**
 * Détermine si le rôle correspond à un Formateur
 */
export const isInstructor = (role?: UserRole | null): boolean => {
  return role === 'instructor';
};

/**
 * Détermine si le rôle correspond à un Administrateur (anticipé pour extensibilité)
 */
export const isAdmin = (role?: UserRole | null): boolean => {
  return role === 'admin';
};

/**
 * Libellé textuel formaté pour l'interface utilisateur
 */
export const getRoleLabel = (role?: UserRole | null): string => {
  if (role === 'instructor') return 'Formateur';
  if (role === 'admin') return 'Administrateur';
  return 'Élève';
};
