export type CourseLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';
export type CourseStatus = 'Gratuite' | 'Payante';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  isCompleted?: boolean;
  order: number;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  instructor: {
    name: string;
    avatar?: string;
    role?: string;
  };
  thumbnail: string;
  thumbnailBgColor?: string;
  duration: string;
  lessonsCount: number;
  modulesCount?: number;
  level: CourseLevel;
  status: CourseStatus;
  price?: number;
  isPopular?: boolean;
  likesCount?: string;
  downloadsCount?: number;
  rating?: number;
  category: string;
  featured?: boolean;
  modules?: Module[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: 'student' | 'instructor' | 'admin';
  stats: {
    overallProgress: number; // e.g. 68
    coursesInProgressCount: number; // e.g. 3
    completedLessonsCount: number; // e.g. 24
    completedCoursesCount: number;
    rankPercentile: string; // e.g. "Top 15%"
    quizAverageScore?: number;
  };
  lastLesson?: {
    courseId: string;
    courseTitle: string;
    moduleName: string;
    lessonName: string;
    progressPercentage: number;
    thumbnail: string;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  moduleName: string;
  questionsCount: number;
  estimatedDuration: string;
  status?: 'not_started' | 'completed' | 'in_progress';
  questions: QuizQuestion[];
}

export type UserRole = 'student' | 'instructor' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  avatar_url?: string | null;
  role?: UserRole;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionStatus = 'active' | 'expired' | 'canceled' | 'inactive';
export type SubscriptionPlan = 'monthly' | 'yearly';

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan;
  name: string;
  tagline: string;
  badge?: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  durationDays: number;
  features: string[];
  isPopular?: boolean;
}

export interface InstructorSubscription {
  id: string;
  instructor_id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  started_at?: string | null;
  expires_at?: string | null;
  canceled_at?: string | null;
  provider?: string | null;
  provider_subscription_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'canceled';

export interface SubscriptionPayment {
  id: string;
  instructor_id: string;
  subscription_id?: string | null;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  provider: 'fedapay' | string;
  provider_transaction_id?: string | null;
  status: PaymentStatus;
  raw_response?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// PHASE 9D : ACHAT DE FORMATIONS, ACCÈS & PORTEFEUILLE
// =============================================================================

export type CoursePurchaseStatus = 'pending' | 'successful' | 'failed' | 'canceled';

export interface CoursePurchase {
  id: string;
  student_id: string;
  course_id: string;
  instructor_id: string;
  amount: number;
  currency: string;
  provider: 'fedapay' | string;
  provider_transaction_id?: string | null;
  status: CoursePurchaseStatus;
  raw_response?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface CourseAccess {
  id: string;
  student_id: string;
  course_id: string;
  purchase_id?: string | null;
  granted_at?: string;
}

export interface InstructorWallet {
  id: string;
  instructor_id: string;
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

export type WalletTransactionType = 'credit_sale' | 'payout' | 'refund';
export type PayoutStatus = 'pending' | 'processing' | 'successful' | 'failed' | 'canceled';

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  instructor_id: string;
  type: WalletTransactionType;
  amount: number;
  currency: string;
  purchase_id?: string | null;
  payout_provider_id?: string | null;
  payout_status?: PayoutStatus | null;
  description?: string | null;
  created_at?: string;
}

export type PayoutMode = 'mtn_open' | 'moov' | 'togocel' | 'moov_tg' | 'orange_ci' | 'mtn_ci' | 'wave_ci';

export interface InstructorPayoutAccount {
  id: string;
  instructor_id: string;
  payout_mode: PayoutMode;
  phone_number: string;
  account_name?: string | null;
  country: string;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// PHASE 9E : GESTION DU CONTENU FORMATEUR
// =============================================================================
export * from './course';

