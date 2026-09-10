import { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'SkillUp - Apprenez vite, montez en compétences comme un pro',
  description:
    'Découvrez la plateforme de formations certifiantes mobile-first. Vidéos interactives, quiz en temps réel, certificats vérifiables et catalogue qualifié.',
};

export default function LandingRoutePage() {
  return <LandingPage />;
}
