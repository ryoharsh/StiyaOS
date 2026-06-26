import type {
    ApiResult,
    LoginResponse,
    BackupStatusResponse,
    CreatePinResponse,
} from '../types';
import request from './service';

// --- Endpoints Service Functions Mapping ---

interface LoginParams {
    email: string;
    password: string;
}

/**
 * POST /auth/login
 * Body: { email, password }
 */
export async function loginUser({ email, password }: LoginParams): Promise<ApiResult<LoginResponse>> {
    return request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
    });
}

interface SignupParams {
    email: string;
    password: string;
    name: string;
}

/**
 * POST /auth/signup
 * Body: { username, name, email, password }
 */
export function signupUser({ email, password, name }: SignupParams): Promise<ApiResult<LoginResponse>> {
    // 🔍 FIX 3: Derived username conversion keeping the backend mandatory requirement schema complete
    const derivedUsername = email.split('@')[0] + Math.floor(100 + Math.random() * 900);
    
    return request<LoginResponse>('/auth/register', {
        method: 'POST',
        body: { 
            username: derivedUsername, 
            name, 
            email, 
            password 
        },
    });
}

interface CreatePinParams {
    userId: string;
    pin: string;
    token: string;
}

/**
 * POST /auth/pin
 * Headers: Authorization: Bearer token
 */
export function createPin({ userId, pin, token }: CreatePinParams): Promise<ApiResult<CreatePinResponse>> {
    return request<CreatePinResponse>('/auth/pin', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: { userId, pin },
    });
}

interface CheckBackupStatusParams {
    userId: string;
    token: string;
}

/**
 * GET /auth/backup-status?userId=...
 */
export function checkBackupStatus({ userId, token }: CheckBackupStatusParams): Promise<ApiResult<BackupStatusResponse>> {
    return request<BackupStatusResponse>(`/auth/backup-status?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

/**
 * POST /auth/forgot-password
 * Triggers automated system reset recovery token emails
 */
export async function sendForgotOtp(email: string): Promise<ApiResult<any>> {
    return request<any>('/auth/forgot', {
        method: 'POST',
        body: { email },
    });
}

/**
 * POST /auth/verify-forgot-otp
 * Verifies if user matched security token attributes
 */
export async function verifyForgotOtp(email: string, otp: string): Promise<ApiResult<any>> {
    // Note: If you don't have a split route, verify mapping defaults to password modifier handler below
    return request<any>('/auth/verifyOtp', {
        method: 'POST',
        body: { email, otp },
    });
}

/**
 * POST /auth/reset-password
 * Executes absolute modification override lifecycle
 */
export async function resetPassword(email: string, otp: string, password: string): Promise<ApiResult<any>> {
    return request<any>('/auth/changePassword', {
        method: 'POST',
        body: { 
            email, 
            otp, 
            newPassword: password // Syncs payload key directly to controller req.body requirements
        },
    });
}

export async function logoutUser(): Promise<ApiResult<any>> {
    return request<any>('/auth/logout', {
        method: 'POST'
    });
}

/**
 * DELETE /auth/delete-account
 * Deletes user profile information from the database permanently
 * Requires Authorization Bearer token header parameter wrapper
 */
export async function deleteAccount(token: string): Promise<ApiResult<any>> {
    return request<any>('/auth/delete', {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
}