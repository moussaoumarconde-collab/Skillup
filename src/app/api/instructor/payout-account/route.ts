import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { saveInstructorPayoutAccount } from '@/lib/wallet';
import { PayoutMode } from '@/types';

const ALLOWED_MODES: PayoutMode[] = [
  'mtn_open',
  'moov',
  'togocel',
  'moov_tg',
  'orange_ci',
  'mtn_ci',
  'wave_ci',
];

/**
 * POST /api/instructor/payout-account
 *
 * Enregistre ou met à jour les coordonnées Mobile Money de reversement du formateur.
 * Table dédiée : instructor_payout_accounts.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId) {
      const hasLocalToken = request.cookies.get('skillup_auth_token')?.value;
      if (!hasLocalToken) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      }
      userId = request.cookies.get('skillup_user_id')?.value || 'local_instructor_id';
    }

    const body = await request.json().catch(() => ({}));
    const { payout_mode, phone_number, account_name, country } = body;

    if (!payout_mode || !ALLOWED_MODES.includes(payout_mode)) {
      return NextResponse.json(
        {
          error: `Mode de reversement invalide. Modes acceptés : ${ALLOWED_MODES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (!phone_number || typeof phone_number !== 'string' || phone_number.trim().length < 8) {
      return NextResponse.json(
        { error: 'Numéro de téléphone Mobile Money invalide (minimum 8 chiffres).' },
        { status: 400 }
      );
    }

    const result = await saveInstructorPayoutAccount(userId, {
      payout_mode,
      phone_number: phone_number.trim(),
      account_name: typeof account_name === 'string' ? account_name.trim() : undefined,
      country: country || 'BJ',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Coordonnées de reversement Mobile Money enregistrées avec succès.',
    });
  } catch (error) {
    console.error('Erreur /api/instructor/payout-account:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erreur interne lors de la sauvegarde du compte.',
      },
      { status: 500 }
    );
  }
}
