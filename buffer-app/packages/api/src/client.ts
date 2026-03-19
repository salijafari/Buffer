/**
 * Buffer — Typed API Client
 * /packages/api/src/client.ts
 *
 * Rules:
 * - Never call fetch() directly in components or stores — use this client.
 * - Every call returns { data: T | null, error: ApiError | null }
 * - Never throws — always returns an error object.
 * - Optimistic updates applied in stores; this client reconciles.
 * - Retry: 3 attempts, exponential backoff 1s/2s/4s on network errors.
 * - No retry on 4xx responses.
 * - Tokens: httpOnly cookies on web (credentials: 'include').
 *   Mobile: JWT injected per-request from Keychain via getTokenFn.
 */

// ─── Error types ─────────────────────────────────────────────────────────────

export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'PLAID_ERROR'
  | 'VOPAY_ERROR'
  | 'UNKNOWN';

export interface ApiError {
  code:       ApiErrorCode;
  message:    string;
  status?:    number;
  /** Field-level errors from the API for form validation */
  fields?:    Record<string, string>;
}

export interface ApiResponse<T> {
  data:  T | null;
  error: ApiError | null;
}

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface User {
  id:            string;
  email:         string;
  firstName:     string;
  lastName:      string;
  phone:         string;
  province:      string;
  dateOfBirth:   string;
  kycStatus:     'pending' | 'approved' | 'manual_review';
  productPath:   'creditLine' | 'creditBuilder' | null;
  memberSince:   string;
  trialEndsAt:   string | null;
  billingStatus: 'pending_verification' | 'trial' | 'active' | 'cancelled';
}

export interface CreditCard {
  id:              string;
  institutionName: string;
  cardName:        string;
  last4:           string;
  balance:         number;
  creditLimit:     number;
  apr:             number | null;
  minimumPayment:  number;
  nextDueDate:     string;
  updatedAt:       string;
  isVoPayEligible: boolean;
}

export interface BufferCreditLine {
  id:              string;
  creditLimit:     number;
  availableCredit: number;
  currentBalance:  number;
  apr:             number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  utilization:     number;
}

export interface CreditBuilderStatus {
  tradelineLimit:   number;
  status:           'active' | 'inactive';
  lastReportedDate: string | null;
  nextReportingDate:string | null;
  paymentHistory:   Array<{ month: string; status: 'on_time' | 'missed'; amount: number }>;
  reportedTo:       ('transunion' | 'equifax')[];
}

export interface CreditScore {
  score:          number;
  delta:          number;
  source:         'transunion';
  scoreName:      'CreditVision';
  updatedAt:      string;
  history:        Array<{ month: string; score: number }>;
}

export interface Transaction {
  id:           string;
  date:         string;
  merchant:     string;
  amount:       number;
  category:     string;
  accountId:    string;
  isPending:    boolean;
}

export interface PlaidAccount {
  id:              string;
  institutionName: string;
  last4:           string;
  type:            'checking' | 'savings';
  status:          'active' | 'reconnect_needed';
  updatedAt:       string;
}

export interface ProactiveCard {
  id:       string;
  type:     'insight' | 'alert' | 'achievement' | 'score_change';
  headline: string;
  body:     string;
  priority: 'high' | 'normal';
  createdAt:string;
}

export interface ChatMessage {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  createdAt: string;
}

export interface BudgetCategory {
  name:      string;
  budgeted:  number;
  spent:     number;
  projected: number;
}

export interface RewardsBalance {
  points:      number;
  tier:        'standard' | 'premium';
  nextMilestone: number;
  history:     Array<{ date: string; points: number; reason: string }>;
}

// ─── Client config ────────────────────────────────────────────────────────────

export interface ClientConfig {
  baseUrl:      string;
  /** Mobile only: function that returns the JWT from Keychain */
  getTokenFn?:  () => Promise<string | null>;
  /** Timeout in ms (default 10000) */
  timeout?:     number;
}

const RETRY_DELAYS = [1000, 2000, 4000] as const;

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function mapStatusToCode(status: number): ApiErrorCode {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 422) return 'VALIDATION_ERROR';
  if (status >= 500)  return 'SERVER_ERROR';
  return 'UNKNOWN';
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

export function createApiClient(config: ClientConfig) {
  const { baseUrl, getTokenFn, timeout = 10_000 } = config;

  async function request<T>(
    method:  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path:    string,
    body?:   unknown,
    retryCount = 0,
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), timeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      };

      // Mobile: inject Bearer token from Keychain
      if (getTokenFn) {
        const token = await getTokenFn();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body:        body != null ? JSON.stringify(body) : undefined,
        credentials: getTokenFn ? 'omit' : 'include', // web: httpOnly cookie
        signal:      controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        // 4xx — no retry
        let fields: Record<string, string> | undefined;
        let message = `Request failed: ${res.status}`;
        try {
          const json = await res.json() as { message?: string; errors?: Record<string, string> };
          if (json.message) message = json.message;
          if (json.errors)  fields  = json.errors;
        } catch { /* non-JSON body */ }

        return {
          data:  null,
          error: { code: mapStatusToCode(res.status), message, status: res.status, fields },
        };
      }

      // 204 No Content
      if (res.status === 204) {
        return { data: null, error: null };
      }

      const data = await res.json() as T;
      return { data, error: null };

    } catch (err: unknown) {
      clearTimeout(timer);

      const isAbort   = err instanceof Error && err.name === 'AbortError';
      const isNetwork = err instanceof TypeError;

      if (isAbort) {
        return { data: null, error: { code: 'TIMEOUT', message: 'Request timed out. Please try again.' } };
      }

      // Network error — retry with exponential backoff
      if (isNetwork && retryCount < RETRY_DELAYS.length) {
        await sleep(RETRY_DELAYS[retryCount]!);
        return request<T>(method, path, body, retryCount + 1);
      }

      return {
        data:  null,
        error: { code: 'NETWORK_ERROR', message: 'Network error. Please check your connection.' },
      };
    }
  }

  // ─── API methods ───────────────────────────────────────────────────────────

  return {
    // Auth
    auth: {
      signUp:          (body: { firstName: string; lastName: string; email: string; phone: string; password: string }) =>
                         request<{ userId: string }>('POST', '/auth/signup', body),
      signIn:          (body: { email: string; password: string }) =>
                         request<{ user: User }>('POST', '/auth/signin', body),
      signOut:         () => request<void>('POST', '/auth/signout'),
      refreshSession:  () => request<{ user: User }>('POST', '/auth/refresh'),
      forgotPassword:  (email: string) => request<void>('POST', '/auth/forgot-password', { email }),
      resetPassword:   (body: { token: string; password: string }) =>
                         request<void>('POST', '/auth/reset-password', body),
    },

    // KYC / Onboarding
    kyc: {
      submitIdentity:  (body: FormData) => request<{ status: string }>('POST', '/kyc/identity', body),
      checkProvince:   (province: string) => request<{ eligible: boolean; reason?: string }>('GET', `/kyc/province?code=${province}`),
      getStatus:       () => request<{ kycStatus: User['kycStatus'] }>('GET', '/kyc/status'),
    },

    // Plaid
    plaid: {
      createLinkToken: () => request<{ linkToken: string }>('POST', '/plaid/link-token'),
      exchangeToken:   (publicToken: string) => request<{ accountId: string }>('POST', '/plaid/exchange', { publicToken }),
      getAccounts:     () => request<PlaidAccount[]>('GET', '/plaid/accounts'),
      refreshBalances: () => request<void>('POST', '/plaid/refresh'),
      getCards:        () => request<CreditCard[]>('GET', '/plaid/cards'),
      getTransactions: (params?: { startDate?: string; endDate?: string; limit?: number }) =>
                         request<Transaction[]>('GET', `/plaid/transactions?${new URLSearchParams(params as Record<string,string>)}`),
    },

    // Credit Line
    creditLine: {
      get:             () => request<BufferCreditLine>('GET', '/credit-line'),
      transfer:        (body: { cardId: string; amount: number }[]) =>
                         request<{ transferId: string; status: string }>('POST', '/credit-line/transfer', body),
      setAutopay:      (body: { enabled: boolean; strategy: 'avalanche' | 'snowball' }) =>
                         request<void>('PATCH', '/credit-line/autopay', body),
    },

    // Credit Builder
    creditBuilder: {
      getStatus:       () => request<CreditBuilderStatus>('GET', '/credit-builder/status'),
      activate:        () => request<void>('POST', '/credit-builder/activate'),
    },

    // Credit Score
    credit: {
      getScore:        () => request<CreditScore>('GET', '/credit/score'),
      getReport:       () => request<unknown>('GET', '/credit/report'),
      submitDispute:   (body: { itemId: string; reason: string }) =>
                         request<{ disputeId: string }>('POST', '/credit/dispute', body),
    },

    // AI
    ai: {
      chat:            (body: { message: string; threadId?: string }) =>
                         request<{ reply: string; threadId: string }>('POST', '/ai/chat', body),
      getProactiveCards:() => request<ProactiveCard[]>('GET', '/ai/proactive'),
      dismissCard:     (id: string) => request<void>('DELETE', `/ai/proactive/${id}`),
    },

    // Budget
    budget: {
      getCategories:   () => request<BudgetCategory[]>('GET', '/budget/categories'),
      setBudget:       (category: string, amount: number) =>
                         request<void>('PATCH', `/budget/categories/${category}`, { amount }),
      getSubscriptions:() => request<unknown[]>('GET', '/budget/subscriptions'),
    },

    // Timeline
    timeline: {
      getEnrollmentSnapshot: () => request<{
        cardBalances: number[]; cardAPRs: number[];
        future1BalanceArray: number[]; enrolledAt: string;
      }>('GET', '/timeline/snapshot'),
    },

    // Account
    account: {
      getProfile:      () => request<User>('GET', '/account/profile'),
      updateProfile:   (body: Partial<User>) => request<User>('PATCH', '/account/profile', body),
      getBillingHistory:() => request<unknown[]>('GET', '/account/billing/history'),
      cancelMembership:() => request<{ endsAt: string }>('POST', '/account/membership/cancel'),
      deleteAccount:   () => request<void>('DELETE', '/account'),
    },

    // PAD
    pad: {
      setup:           (body: { bankAccountId: string; amount: number; dayOfMonth: number }) =>
                         request<{ mandateId: string }>('POST', '/pad/setup', body),
      getMandate:      () => request<{ mandateId: string; last4: string; amount: number; nextDate: string } | null>('GET', '/pad/mandate'),
      cancel:          () => request<void>('DELETE', '/pad/mandate'),
    },

    // Notifications
    notifications: {
      getSettings:     () => request<Record<string, boolean>>('GET', '/notifications/settings'),
      updateSettings:  (settings: Record<string, boolean>) =>
                         request<void>('PATCH', '/notifications/settings', settings),
      registerPushToken:(token: string, platform: 'ios' | 'android') =>
                         request<void>('POST', '/notifications/push-token', { token, platform }),
    },

    // Rewards
    rewards: {
      getBalance:      () => request<RewardsBalance>('GET', '/rewards/balance'),
      redeem:          (body: { rewardType: string; amount?: number }) =>
                         request<{ newBalance: number }>('POST', '/rewards/redeem', body),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
