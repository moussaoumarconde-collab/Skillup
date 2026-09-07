import crypto from 'crypto';

/**
 * SKILLUP - MODULE OFFICIEL D'INTÉGRATION FEDAPAY (PHASE 9C)
 * 
 * Règles absolues :
 * - Toutes les opérations FedaPay s'exécutent EXCLUSIVEMENT côté serveur.
 * - Les clés secrètes ne sont jamais exposées au client.
 * - Supporte le mode Sandbox et le mode Production via FEDAPAY_ENVIRONMENT.
 * - Si aucune clé FedaPay réelle n'est renseignée dans .env.local, un mode bac à sable
 *   contrôlé permet de tester le flux complet de bout en bout en toute sécurité.
 */

export interface FedaPayCustomer {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber?: {
    number: string;
    country: string;
  };
}

export interface CreateTransactionParams {
  description: string;
  amount: number;
  currency?: string;
  callbackUrl: string;
  customer: FedaPayCustomer;
  customMetadata?: Record<string, unknown>;
}

export interface FedaPayTransactionResponse {
  id: number | string;
  reference?: string;
  amount: number;
  status: 'pending' | 'approved' | 'declined' | 'canceled' | 'transferred' | string;
  description?: string;
  custom_metadata?: Record<string, unknown>;
  created_at?: string;
  [key: string]: unknown;
}

export interface FedaPayTokenResponse {
  token: string;
  url: string;
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
 * Indique si FedaPay est configuré avec de vraies clés valides
 */
export const isFedaPayConfigured = (): boolean => {
  return getSecretKey() !== null;
};

/**
 * Crée une transaction sur l'API FedaPay
 */
export async function createFedaPayTransaction(
  params: CreateTransactionParams
): Promise<FedaPayTransactionResponse> {
  const secretKey = getSecretKey();

  // Mode Simulation contrôlé si clés réelles non configurées
  if (!secretKey) {
    console.warn(
      '[FedaPay Sandbox] Clé FEDAPAY_SECRET_KEY non configurée. Mode simulation contrôlé actif.'
    );
    const mockId = `mock_tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      id: mockId,
      reference: `REF-${mockId}`,
      amount: params.amount,
      status: 'pending',
      description: params.description,
      custom_metadata: params.customMetadata,
      created_at: new Date().toISOString(),
    };
  }

  const endpoint = `${getBaseUrl()}/transactions`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: params.description,
      amount: Math.round(params.amount),
      currency: { iso: params.currency || 'XOF' },
      callback_url: params.callbackUrl,
      customer: {
        firstname: params.customer.firstname || 'Formateur',
        lastname: params.customer.lastname || 'SkillUp',
        email: params.customer.email,
        phone_number: params.customer.phoneNumber,
      },
      custom_metadata: params.customMetadata || {},
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[FedaPay API Error] Echec création transaction:', errorText);
    throw new Error(`Erreur API FedaPay (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const tx = data['v1/transaction'] || data.transaction || data;
  return tx as FedaPayTransactionResponse;
}

/**
 * Génère le jeton de paiement et l'URL de checkout FedaPay
 */
export async function generateFedaPayCheckoutUrl(
  transactionId: number | string,
  fallbackCallbackUrl?: string
): Promise<FedaPayTokenResponse> {
  const secretKey = getSecretKey();

  // Mode Simulation contrôlé
  if (!secretKey || String(transactionId).startsWith('mock_tx_')) {
    const mockToken = `mock_token_${transactionId}`;
    const targetUrl =
      fallbackCallbackUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/abonnement/succes?transaction_id=${transactionId}&mock=true`;
    return {
      token: mockToken,
      url: targetUrl,
    };
  }

  const endpoint = `${getBaseUrl()}/transactions/${transactionId}/token`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[FedaPay API Error] Echec génération token:', errorText);
    throw new Error(`Erreur API FedaPay (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    token: data.token,
    url: data.url,
  };
}

/**
 * Récupère l'état officiel d'une transaction directement auprès de l'API FedaPay
 */
export async function retrieveFedaPayTransaction(
  transactionId: number | string
): Promise<FedaPayTransactionResponse | null> {
  const secretKey = getSecretKey();

  // Mode Simulation contrôlé
  if (!secretKey || String(transactionId).startsWith('mock_tx_')) {
    return {
      id: transactionId,
      reference: `REF-${transactionId}`,
      amount: 9900,
      status: 'approved',
      description: 'Transaction de test simulée',
      created_at: new Date().toISOString(),
    };
  }

  const endpoint = `${getBaseUrl()}/transactions/${transactionId}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    const errorText = await response.text();
    console.error('[FedaPay API Error] Echec récupération transaction:', errorText);
    throw new Error(`Erreur API FedaPay (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const tx = data['v1/transaction'] || data.transaction || data;
  return tx as FedaPayTransactionResponse;
}

/**
 * Vérifie l'authenticité d'un webhook FedaPay via la signature X-FEDAPAY-SIGNATURE
 */
export function verifyWebhookSignature(
  rawPayload: string,
  signatureHeader: string | null
): boolean {
  const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET?.trim();

  // Si pas de webhook secret configuré en mode sandbox/dev
  if (!webhookSecret) {
    return true;
  }

  if (!signatureHeader) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expectedSignature)
    );
  } catch (err) {
    console.error('Erreur lors de la vérification de signature webhook:', err);
    return false;
  }
}
