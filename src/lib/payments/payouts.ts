/**
 * SKILLUP - MODULE FEDAPAY PAYOUTS (PHASE 9D)
 *
 * Gère les reversements automatiques vers le Mobile Money des formateurs
 * via l'API FedaPay POST /v1/payouts.
 *
 * Règles absolues :
 * - Toutes les opérations s'exécutent EXCLUSIVEMENT côté serveur.
 * - Ne JAMAIS simuler un transfert réussi si la clé ou le service n'est pas actif.
 * - Ne JAMAIS afficher "argent reçu" si non confirmé par FedaPay.
 * - En cas d'échec ou d'absence de configuration, lever une erreur claire pour que
 *   le montant reste en solde en attente (pending_balance) et que la raison soit loguée.
 * - Limites FedaPay : Max 1 000 000 XOF par transfert.
 */

export interface PayoutCustomer {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
}

export interface CreatePayoutParams {
  amount: number;
  currency?: string;
  mode: string; // ex: 'mtn_open', 'moov', 'orange_ci', 'wave_ci', etc.
  customer: PayoutCustomer;
  merchantReference?: string;
}

export interface FedaPayPayoutResponse {
  id: number | string;
  amount: number;
  status: string; // 'pending' | 'processing' | 'sent' | 'approved' | 'failed' | 'canceled'
  mode?: string;
  reference?: string;
  created_at?: string;
  [key: string]: unknown;
}

const getBaseUrl = (): string => {
  const env = (process.env.FEDAPAY_ENVIRONMENT || 'sandbox').trim().toLowerCase();
  return env === 'live' || env === 'production'
    ? 'https://api.fedapay.com/v1'
    : 'https://sandbox-api.fedapay.com/v1';
};

const getSecretKey = (): string | null => {
  const key = process.env.FEDAPAY_SECRET_KEY?.trim();
  if (!key || key.includes('placeholder') || key === 'your-secret-key-here') {
    return null;
  }
  return key;
};

/**
 * Crée un payout (reversement automatique) via l'API FedaPay POST /v1/payouts.
 *
 * RÈGLE CRITIQUE :
 * Si la clé n'est pas configurée ou si FedaPay Payouts n'est pas activé sur le compte marchand,
 * cette fonction LÈVE UNE ERREUR explicite.
 * Elle NE SIMULE JAMAIS un transfert réussi.
 */
export async function createFedaPayPayout(
  params: CreatePayoutParams
): Promise<FedaPayPayoutResponse> {
  const secretKey = getSecretKey();

  if (!secretKey) {
    throw new Error(
      'Reversement impossible : FEDAPAY_SECRET_KEY non configurée. FedaPay Payouts requiert une clé API valide.'
    );
  }

  // Vérification de la limite FedaPay (max 1 000 000 XOF par transfert)
  if (params.amount > 1000000) {
    throw new Error(
      `Montant du reversement (${params.amount} XOF) dépasse la limite FedaPay autorisée de 1 000 000 XOF par transfert.`
    );
  }

  const endpoint = `${getBaseUrl()}/payouts`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(params.amount),
      currency: { iso: params.currency || 'XOF' },
      mode: params.mode,
      customer: {
        firstname: params.customer.firstname,
        lastname: params.customer.lastname,
        email: params.customer.email,
        phone_number: params.customer.phoneNumber,
      },
      merchant_reference: params.merchantReference || undefined,
    }),
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    console.error('[FedaPay Payout Error] Échec API FedaPay Payout:', errorDetail);
    throw new Error(`Erreur API FedaPay Payout (${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  const payout = data['v1/payout'] || data.payout || data;
  return payout as FedaPayPayoutResponse;
}

/**
 * Récupère le statut réel d'un payout existant auprès de FedaPay.
 */
export async function retrieveFedaPayPayout(
  payoutId: number | string
): Promise<FedaPayPayoutResponse | null> {
  const secretKey = getSecretKey();

  if (!secretKey) {
    return null;
  }

  const endpoint = `${getBaseUrl()}/payouts/${payoutId}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    console.error('[FedaPay Payout Error] Échec consultation payout:', errorDetail);
    throw new Error(`Erreur API FedaPay Payout (${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  const payout = data['v1/payout'] || data.payout || data;
  return payout as FedaPayPayoutResponse;
}
