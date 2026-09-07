import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { retryPayout } from '@/lib/wallet';

/**
 * POST /api/instructor/wallet/retry
 *
 * Déclenche une nouvelle tentative sécurisée pour un reversement FedaPay ayant échoué.
 * Règle : Si FedaPay Payouts échoue à nouveau, l'erreur est consignée et les fonds
 * restent intacts dans le solde en attente (pending_balance).
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
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Identifiant de transaction manquant.' },
        { status: 400 }
      );
    }

    const result = await retryPayout(userId, transactionId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Échec de la tentative de reversement.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Nouvelle tentative de reversement initiée avec succès auprès de FedaPay.',
    });
  } catch (error) {
    console.error('Erreur /api/instructor/wallet/retry:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erreur interne lors de la nouvelle tentative.',
      },
      { status: 500 }
    );
  }
}
