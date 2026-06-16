const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Core fetch wrapper.
 * - Attaches Authorization header when a token is provided.
 * - On 401 → calls window.__auxForceLogout() (set by AuthProvider) to clear
 *   the session and redirect to /login automatically.
 */
export const apiFetch = async (endpoint, { token, ...options } = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    if (options.body && options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // ── Token expired / revoked → force logout immediately ──────────────────
    // Skip this for the login endpoint itself: a 401 there means wrong
    // credentials, not an expired session, so we let the normal error-parsing
    // block below surface the backend's own message instead.
    const isLoginEndpoint = endpoint.includes('/auth/login/');
    if (response.status === 401 && !isLoginEndpoint) {
        if (typeof window !== 'undefined' && typeof window.__auxForceLogout === 'function') {
            window.__auxForceLogout();
        }
        throw new Error('Session expired. Please log in again.');
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const message =
            (typeof data === 'object' && (data?.error || data?.detail || data?.message || data?.non_field_errors?.[0] || Object.values(data).flat().join(', '))) ||
            `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return data;
};

// ---------- Auth ----------

/**
 * POST /api/v1/admin/auth/login/
 * Returns { token, user } on success.
 */
export const loginApi = (username, password) =>
    apiFetch('/api/v1/admin/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });

// ---------- Stripe ----------

/**
 * GET /api/v1/admin/stripe/balance/
 * Returns { available_total, pending_total, total_balance, ... }
 */
export const getStripeBalance = (token) =>
    apiFetch('/api/v1/admin/stripe/balance/', { token });

/**
 * GET /api/v1/admin/stripe/transaction-sum/
 * Returns breakdown of Stripe and PayPal totals.
 */
export const getTransactionSum = (token, toDate) => {
    const query = toDate ? `?from_date=${toDate}&type=charge` : '';
    return apiFetch(`/api/v1/admin/stripe/transaction-sum/${query}`, { token });
};

/**
 * GET /api/v1/admin/boarding-summary/
 * Returns ride boarding amount and count.
 */
export const getBoardingSummary = (token, toDate) => {
    const query = toDate ? `?from_date=${toDate}` : '';
    return apiFetch(`/api/v1/admin/boarding-summary/${query}`, { token });
};

/**
 * GET /api/v1/admin/delayed-commission-summary/
 * Returns commission summary and hold amount summary (drivers to be paid).
 */
export const getDelayedCommissionSummary = (token, toDate) => {
    const query = toDate ? `?to_date=${toDate}` : '';
    return apiFetch(`/api/v1/admin/delayed-commission-summary/${query}`, { token });
};

/**
 * GET /api/v1/admin/stripe/commission-transfer-summary/
 * Returns descriptive payout data (actual drivers paid).
 */
export const getCommissionTransferSummary = (token, toDate) => {
    const query = toDate ? `?to_date=${toDate}` : '';
    return apiFetch(`/api/v1/admin/stripe/commission-transfer-summary/${query}`, { token });
};

/**
 * GET /api/v1/admin/driver-payout-batch-summary/
 * Returns per-driver breakdown: hold amount, to be paid today, actually paid via Stripe.
 */
export const getDriverPayoutBatchSummary = (token, toDate) => {
    const query = toDate ? `?to_date=${toDate}` : '';
    return apiFetch(`/api/v1/admin/driver-payout-batch-summary/${query}`, { token });
};
