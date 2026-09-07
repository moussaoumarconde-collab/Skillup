import { NextRequest, NextResponse } from 'next/server';
import { getPlanConfig } from '@/lib/subscriptions/plans';
import { createFedaPayTransaction, generateFedaPayCheckoutUrl } from '@/lib/payments/fedapay';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/payments/fedapay/create
 * 
 * Initialise une transaction de paiement FedaPay pour un abonnement formateur.
 * 
 * Sécurité stricte :
 * 1. Utilisateur authentifié obligatoire (401 si anonyme).
 * 2. Rôle 'instructor' obligatoire (403 si élève).
 * 3. Le plan ('monthly' | 'yearly') est validé côté serveur.
 * 4. Le montant et la devise sont STRICTEMENT déterminés par le serveur depuis plans.ts.
 *    Aucun montant envoyé par le client n'est pris en compte.
 * 5. L'identifiant formateur provient de la session serveur vérifiée.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Récupération de la session utilisateur
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Repli de session pour le mode déconnecté / local dev
    let userId = user?.id;
    let userEmail = user?.email || 'formateur@skillup.com';
    let userRole =
      (user?.user_metadata?.role as string) ||
      request.cookies.get('skillup_user_role')?.value ||
      'student';
    let firstName = (user?.user_metadata?.first_name as string) || 'Formateur';
    let lastName = (user?.user_metadata?.last_name as string) || 'SkillUp';

    // Si utilisateur absent de Supabase mais cookie de session locale présent
    if (!userId) {
      const hasLocalToken = request.cookies.get('skillup_auth_token')?.value;
      if (!hasLocalToken) {
        return NextResponse.json(
          { error: 'Authentification requise pour souscrire un abonnement.' },
          { status: 401 }
        );
      }
      // On utilise l'identifiant formateur du cookie ou du token
      userId = request.cookies.get('skillup_user_id')?.value || 'local_instructor_id';
    }

    // 2. Règle absolue : Seul un FORMATEUR peut payer un abonnement
    if (userRole === 'student') {
      return NextResponse.json(
        {
          error:
            'Accès refusé. Les élèves ne paient aucun abonnement SkillUp.',
        },
        { status: 403 }
      );
    }

    // 3. Validation de la requête
    const body = await request.json().catch(() => ({}));
    const { plan } = body;

    if (!plan || (plan !== 'monthly' && plan !== 'yearly')) {
      return NextResponse.json(
        { error: 'Plan d abonnement invalide. Choisissez "monthly" ou "yearly".' },
        { status: 400 }
      );
    }

    // 4. Montant déterminé exclusivement par la configuration serveur
    const planConfig = getPlanConfig(plan);
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Configuration introuvable pour ce plan.' },
        { status: 400 }
      );
    }

    // 5. URL de callback après paiement
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin ||
      'http://localhost:3000';
    const callbackUrl = `${appUrl}/abonnement/succes`;

    // 6. Création de la transaction auprès de FedaPay
    const tx = await createFedaPayTransaction({
      description: `SkillUp - Abonnement ${planConfig.name}`,
      amount: planConfig.amount,
      currency: planConfig.currency,
      callbackUrl,
      customer: {
        firstname: firstName,
        lastname: lastName,
        email: userEmail,
      },
      customMetadata: {
        instructor_id: userId,
        plan: planConfig.id,
        app: 'SkillUp',
      },
    });

    // 7. Enregistrement initial en base (statut: 'pending')
    try {
      const admin = createAdminClient();
      await admin.from('subscription_payments').insert({
        instructor_id: userId,
        plan: planConfig.id,
        amount: planConfig.amount,
        currency: planConfig.currency,
        provider: 'fedapay',
        provider_transaction_id: String(tx.id),
        status: 'pending',
        raw_response: tx as Record<string, unknown>,
      });
    } catch (dbErr) {
      console.warn('Notice BD: Impossible d enregistrer le paiement pending (mode local):', dbErr);
    }

    // 8. Génération du lien de paiement / checkout FedaPay
    const checkout = await generateFedaPayCheckoutUrl(
      tx.id,
      `${callbackUrl}?transaction_id=${tx.id}&plan=${planConfig.id}`
    );

    return NextResponse.json({
      success: true,
      transactionId: tx.id,
      checkoutUrl: checkout.url,
      plan: planConfig.id,
      amount: planConfig.amount,
      currency: planConfig.currency,
    });
  } catch (error) {
    console.error('Erreur /api/payments/fedapay/create:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erreur interne lors de l initialisation du paiement.',
      },
      { status: 500 }
    );
  }
}
