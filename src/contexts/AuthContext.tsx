'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';

interface StoredLocalUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: 'student' | 'instructor';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role?: 'student' | 'instructor'
  ) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signInDemo: (role?: 'student' | 'instructor') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (
    firstName: string,
    lastName: string,
    avatarUrl?: string | null
  ) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USERS_KEY = 'skillup_registered_users';
const LOCAL_STORAGE_SESSION_KEY = 'skillup_active_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = createClient();

  const getLocalUsers = (): StoredLocalUser[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveLocalUsers = (users: StoredLocalUser[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (err) {
      console.warn('Erreur de sauvegarde locale des utilisateurs:', err);
    }
  };

  const saveLocalSession = (userData: User, profileData: Profile) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        LOCAL_STORAGE_SESSION_KEY,
        JSON.stringify({ user: userData, profile: profileData })
      );
      document.cookie = 'skillup_auth_token=true; path=/; max-age=604800; SameSite=Lax';
      const roleValue = profileData.role || userData.user_metadata?.role || 'student';
      document.cookie = `skillup_user_role=${roleValue}; path=/; max-age=604800; SameSite=Lax`;
    } catch (err) {
      console.warn('Erreur de sauvegarde locale de la session:', err);
    }
  };

  const clearLocalSession = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      document.cookie = 'skillup_auth_token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'skillup_user_role=; path=/; max-age=0; SameSite=Lax';
    } catch {
      // Ignorer
    }
  };

  const fetchSupabaseProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as Profile);
        if (typeof document !== 'undefined') {
          const roleValue = (data as Profile).role || 'student';
          document.cookie = 'skillup_auth_token=true; path=/; max-age=604800; SameSite=Lax';
          document.cookie = `skillup_user_role=${roleValue}; path=/; max-age=604800; SameSite=Lax`;
        }
      }
    } catch {
      // Ignorer si hors ligne
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchSupabaseProfile(initialSession.user.id);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.warn('[Auth] Erreur initialisation session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Écouteur d'événements Supabase
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          await fetchSupabaseProfile(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          clearLocalSession();
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    } catch {
      // Ignorer
    }
  }, []);

  // Connexion réelle via Supabase Auth (ZÉRO fallback local)
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      // Si Supabase retourne une erreur, la renvoyer proprement sans jamais masquer l'erreur
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          return { error: new Error('Email ou mot de passe incorrect.') };
        }
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return {
            error: new Error(
              'Votre adresse email n’a pas encore été confirmée. Veuillez vérifier votre boîte mail.'
            ),
          };
        }
        return { error: new Error(error.message) };
      }

      if (!data.user) {
        return { error: new Error('Impossible de se connecter. Aucun utilisateur retourné.') };
      }

      setUser(data.user);
      setSession(data.session);
      await fetchSupabaseProfile(data.user.id);
      return { error: null };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Une erreur inattendue est survenue lors de la connexion.';
      return { error: new Error(message) };
    }
  };

  // Inscription réelle via Supabase Auth (ZÉRO fallback local pour l'authentification)
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'student' | 'instructor' = 'student'
  ): Promise<{ error: Error | null; needsEmailConfirmation?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    // Sécurité stricte : seuls 'student' ou 'instructor' sont acceptés depuis le formulaire, jamais 'admin'
    const cleanRole: 'student' | 'instructor' =
      role === 'instructor' ? 'instructor' : 'student';

    const redirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: cleanFirst,
            last_name: cleanLast,
            role: cleanRole,
          },
        },
      });

      // 1. Si Supabase retourne une erreur explicite, la renvoyer telle quelle
      if (error) {
        return { error: new Error(error.message) };
      }

      // 2. Détection d'un compte déjà existant si Supabase protège contre l'énumération d'adresses email
      // (Supabase renvoie un utilisateur sans identités quand le compte existe déjà et que la confirmation email est requise)
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          error: new Error('Un compte avec cette adresse email existe déjà. Veuillez vous connecter.'),
        };
      }

      if (!data.user) {
        return { error: new Error('Échec de la création du compte.') };
      }

      // 3. Si une session est active immédiatement (confirmation automatique activée)
      if (data.session) {
        setUser(data.user);
        setSession(data.session);
        await fetchSupabaseProfile(data.user.id);
        return { error: null, needsEmailConfirmation: false };
      }

      // 4. Si la session n'a pas été fournie immédiatement par signUp, on connecte directement l'utilisateur
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!signInError && signInData.session) {
        setUser(signInData.user);
        setSession(signInData.session);
        await fetchSupabaseProfile(signInData.user.id);
        return { error: null, needsEmailConfirmation: false };
      }

      return { error: null, needsEmailConfirmation: false };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Une erreur inattendue est survenue lors de l’inscription.';
      return { error: new Error(message) };
    }
  };

  // Connexion Démo Immédiate
  const signInDemo = async (role: 'student' | 'instructor' = 'student') => {
    const isInstructor = role === 'instructor';
    const demoUser: User = {
      id: isInstructor ? 'usr_demo_instructor' : 'usr_demo_student',
      email: isInstructor ? 'formateur@skillup.fr' : 'max@skillup.fr',
      app_metadata: {},
      user_metadata: {
        first_name: isInstructor ? 'Alex' : 'Max',
        last_name: isInstructor ? 'Professeur' : 'Apprenant',
        role: isInstructor ? 'instructor' : 'student',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;

    const demoProfile: Profile = {
      id: demoUser.id,
      user_id: demoUser.id,
      first_name: isInstructor ? 'Alex' : 'Max',
      last_name: isInstructor ? 'Professeur' : 'Apprenant',
      email: demoUser.email || '',
      avatar_url: isInstructor
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: isInstructor ? 'instructor' : 'student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUser(demoUser);
    setProfile(demoProfile);
    saveLocalSession(demoUser, demoProfile);
  };

  // Déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignorer
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      clearLocalSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/connexion';
      }
    }
  };

  // Réinitialisation mot de passe
  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/connexion`,
      });
      if (error) return { error };
      return { error: null };
    } catch {
      // Simulation locale sans erreur
      return { error: null };
    }
  };

  const updateProfile = async (
    firstName: string,
    lastName: string,
    avatarUrl?: string | null
  ): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('Aucun utilisateur connecté.') };

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    // 1. Tentative de mise à jour Supabase
    try {
      await supabase
        .from('profiles')
        .update({
          first_name: cleanFirst,
          last_name: cleanLast,
          avatar_url: avatarUrl ?? profile?.avatar_url ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      await supabase.auth.updateUser({
        data: {
          first_name: cleanFirst,
          last_name: cleanLast,
        },
      });
    } catch {
      // Ignorer si offline / placeholder
    }

    // 2. Mise à jour de l'état réactif et du stockage local
    const updatedProfile: Profile = {
      id: user.id,
      user_id: user.id,
      first_name: cleanFirst,
      last_name: cleanLast,
      email: user.email || profile?.email || '',
      avatar_url: avatarUrl ?? profile?.avatar_url ?? null,
      created_at: profile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedUser: User = {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        first_name: cleanFirst,
        last_name: cleanLast,
      },
    };

    setUser(updatedUser);
    setProfile(updatedProfile);
    saveLocalSession(updatedUser, updatedProfile);

    // Mettre à jour l'utilisateur dans la liste locale
    const localUsers = getLocalUsers();
    const updatedUsers = localUsers.map((u) => {
      if (u.id === user.id || u.email.toLowerCase() === (user.email || '').toLowerCase()) {
        return {
          ...u,
          firstName: cleanFirst,
          lastName: cleanLast,
        };
      }
      return u;
    });
    saveLocalUsers(updatedUsers);

    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchSupabaseProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signInDemo,
        signOut,
        resetPassword,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider');
  }
  return context;
};
