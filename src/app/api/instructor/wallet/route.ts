import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getInstructorFinancialOverview } from '@/lib/wallet';

/**
 * GET /api/instructor/wallet
 *
 * Récupère le tableau de bord financier du formateur :
 * - Solde en attente (pending_balance)
 * - Gains totaux (total_earned)
 * - Solde disponible (available_balance)
 * - Coordonnées Mobile Money de reversement
 * - Historique des transactions (ventes et reversements)
 */
export async function GET(request: NextRequest) {
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

    const overview = await getInstructorFinancialOverview(userId);

    return NextResponse.json({
      success: true,
      wallet: overview.wallet || {
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0,
        currency: 'XOF',
      },
      payoutAccount: overview.payoutAccount,
      transactions: overview.transactions,
    });
  } catch (error) {
    console.error('Erreur /api/instructor/wallet:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erreur interne lors de la récupération du portefeuille.',
      },
      { status: 500 }
    );
  }
}
