import axios from 'axios';
import type { ApiResult } from '../types';
import { useSetupStore } from '../store/useSetupStore';

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: any; // Clean un-stringified literal objects, or FormData
    _isRetry?: boolean; // internal flag, don't set manually
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Calls GET /auth/me with the httpOnly refreshToken cookie attached.
 * De-duped: if multiple requests 401 at once, only one refresh call fires.
 */
function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = axios
        .get(`${BASE_URL}/auth/me`, { withCredentials: true })
        .then((res) => {
            const newToken = res.data?.data?.accessToken ?? res.data?.accessToken ?? null;
            if (newToken) {
                useSetupStore.getState().setWizardData({
                    auth: {
                        ...(useSetupStore.getState().wizardData.auth as any),
                        token: newToken,
                    },
                });
            }
            return newToken;
        })
        .catch(() => null)
        .finally(() => {
            refreshPromise = null;
        });

    return refreshPromise;
}

function forceLogout() {
    useSetupStore.getState().resetWizardData();
    if (typeof window !== 'undefined') {
        window.location.href = '/signin';
    }
}

/**
 * Global Base API Client Utility
 * Integrates error extraction natively mapped to ApiResponse structures
 */
export default async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    try {
        const { headers, method = 'POST', body, _isRetry } = options;

        // 🔍 FIX 1: Un-stringify check safeguard. Axios strictly handles serialization.
        let parsedPayload = body;
        if (typeof body === 'string') {
            try {
                parsedPayload = JSON.parse(body);
            } catch {
                parsedPayload = body;
            }
        }

        const isFormData = typeof FormData !== 'undefined' && parsedPayload instanceof FormData;

        // 🔐 Pull bearer token from the setup wizard's persisted auth state
        const token = useSetupStore.getState().wizardData.auth?.token;

        const finalHeaders: Record<string, string> = {
            Accept: 'application/json',
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }), // let axios set multipart boundary itself
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers, // caller-supplied headers win if there's a conflict
        };

        const config = {
            method: method.toLowerCase(),
            url: `${BASE_URL}${path}`, // 🔌 Base routing pattern synced directly to "/auth"
            headers: finalHeaders,
            data: method !== 'GET' ? parsedPayload : undefined,
        };

        const res = await axios(config);

        // 🔍 FIX 2: Resolves data tracking matching the ApiResponse layout backend object
        const backendData = res.data;

        return {
            success: true,
            data: (backendData.data || backendData) as T,
            error: null
        };

    } catch (err: any) {
        const status = axios.isAxiosError(err) ? err.response?.status : null;

        // Access token expired/invalid — try ONE silent refresh, then retry the original call.
        if (status === 401 && !options._isRetry) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                return request<T>(path, { ...options, _isRetry: true });
            }
            // Refresh failed too — refresh token itself is dead. Force logout.
            forceLogout();
            return { success: false, data: null, error: 'Session expired. Please sign in again.' };
        }

        let message = 'Network error — could not reach server.';

        if (axios.isAxiosError(err)) {
            // Extracts API custom messages encapsulated inside ApiError instances
            message = err.response?.data?.message || err.message || message;
        } else if (err instanceof Error) {
            message = err.message;
        }

        return {
            success: false,
            data: null,
            error: message
        };
    }
}