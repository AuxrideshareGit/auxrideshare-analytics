'use client';

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(undefined);

export const useAuthContext = () => {
    const context = use(AuthContext);
    if (!context) {
        throw new Error('useAuthContext can only be used within AuthProvider');
    }
    return context;
};

const AUTH_TOKEN_KEY = '__AUX_AUTH_TOKEN__';
const AUTH_USER_KEY = '__AUX_AUTH_USER__';

// ─── Cookie helpers ────────────────────────────────────────────────────────────
const setCookie = (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const removeCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// ─── localStorage helpers ──────────────────────────────────────────────────────
const getStoredToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(AUTH_USER_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

// ─── JWT helpers ───────────────────────────────────────────────────────────────
/**
 * Decode a JWT payload without any library.
 * Returns the payload object or null if the token is malformed.
 */
const decodeJwtPayload = (token) => {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(base64);
        return JSON.parse(json);
    } catch {
        return null;
    }
};

/**
 * Returns milliseconds until the JWT expires, or null if undecidable.
 * Returns a negative number if already expired.
 */
const msUntilExpiry = (token) => {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return null;
    return payload.exp * 1000 - Date.now();
};

// ─── Provider ─────────────────────────────────────────────────────────────────
const AuthProvider = ({ children }) => {
    const router = useRouter();
    const [token, setToken] = useState(() => getStoredToken());
    const [user, setUser] = useState(() => getStoredUser());
    const expiryTimerRef = useRef(null);

    const isAuthenticated = Boolean(token);

    // ── Clear the auto-logout timer ──────────────────────────────────────────
    const clearExpiryTimer = useCallback(() => {
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
            expiryTimerRef.current = null;
        }
    }, []);

    // ── Schedule auto-logout when token expires ──────────────────────────────
    const scheduleAutoLogout = useCallback((tokenValue, logoutFn) => {
        clearExpiryTimer();
        const ms = msUntilExpiry(tokenValue);

        if (ms === null) {
            // Token has no `exp` claim — nothing to schedule
            return;
        }

        if (ms <= 0) {
            // Token already expired on load — logout immediately
            logoutFn();
            return;
        }

        // setTimeout max is ~24.8 days; cap at that to avoid overflow
        const delay = Math.min(ms, 2_147_483_647);
        expiryTimerRef.current = setTimeout(() => {
            logoutFn();
        }, delay);
    }, [clearExpiryTimer]);

    // ── Session management ───────────────────────────────────────────────────
    const clearSession = useCallback(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        removeCookie(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
        clearExpiryTimer();
    }, [clearExpiryTimer]);

    const logout = useCallback(() => {
        clearSession();
        router.push('/login');
    }, [clearSession, router]);

    const saveSession = useCallback((tokenValue, userData) => {
        localStorage.setItem(AUTH_TOKEN_KEY, tokenValue);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        setCookie(AUTH_TOKEN_KEY, tokenValue);
        setToken(tokenValue);
        setUser(userData);
        scheduleAutoLogout(tokenValue, logout);
    }, [scheduleAutoLogout, logout]);

    // ── On mount: check if a stored token is already expired ────────────────
    useEffect(() => {
        const storedToken = getStoredToken();
        if (!storedToken) return;

        const ms = msUntilExpiry(storedToken);
        if (ms !== null && ms <= 0) {
            // Expired while the user was away — clear immediately
            logout();
            return;
        }

        // Still valid — arm the timer
        scheduleAutoLogout(storedToken, logout);

        return () => clearExpiryTimer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Expose a stable logout trigger for the API layer ────────────────────
    // We attach it to window so apiFetch can call it on 401 without circular deps
    useEffect(() => {
        window.__auxForceLogout = logout;
        return () => { delete window.__auxForceLogout; };
    }, [logout]);

    return (
        <AuthContext
            value={useMemo(
                () => ({
                    token,
                    user,
                    isAuthenticated,
                    saveSession,
                    clearSession,
                    logout,
                }),
                [token, user, isAuthenticated, saveSession, clearSession, logout]
            )}
        >
            {children}
        </AuthContext>
    );
};

export default AuthProvider;
