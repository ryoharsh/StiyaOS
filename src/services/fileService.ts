import request from './service';
import type { ApiResult } from '../types';
import { useSetupStore } from '../store/useSetupStore';
import axios from 'axios';

// ---- Types matching your Mongoose schemas ----
 
export interface FileItem {
    _id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    diskPath: string;
    folder: string | null;
    owner: string;
    createdAt: string;
    updatedAt: string;
}
 
export interface UploadFileParams {
    file: File;
    folder?: string | null;
}
 
export interface RenameFileParams {
    id: string;
    name: string;
}
 
// ---- Service ----
 
const FILES_BASE = '/api/files';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
 
/**
 * Same silent-refresh approach as request.ts, duplicated here because
 * download/thumbnail use raw fetch (not axios) and need to attach a fresh
 * token + retry once if the access token has expired.
 */
async function getValidTokenOrRefresh(): Promise<string | null> {
    const token = useSetupStore.getState().wizardData.auth?.token;
    return token ?? null;
}
 
async function refreshAccessToken(): Promise<string | null> {
    try {
        const res = await axios.get(`${BASE_URL}/auth/me`, { withCredentials: true });
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
    } catch {
        return null;
    }
}
 
/**
 * Shared raw-fetch helper for binary file content (used by downloadFile and
 * by any inline preview/thumbnail). Handles the 401-refresh-retry dance once
 * here instead of duplicating it at each call site.
 */
async function fetchFileBlob(
    id: string,
    _isRetry = false
): Promise<{ success: true; blob: Blob } | { success: false; error: string }> {
    const token = await getValidTokenOrRefresh();
 
    const res = await fetch(`${BASE_URL}${FILES_BASE}/${id}/download`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
 
    if (res.status === 401 && !_isRetry) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            return fetchFileBlob(id, true);
        }
        return { success: false, error: 'Session expired. Please sign in again.' };
    }
 
    if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        return { success: false, error: errBody?.message || `Request failed (${res.status})` };
    }
 
    const blob = await res.blob();
    return { success: true, blob };
}
 
/**
 * Upload a file (multipart/form-data — request() now skips Content-Type
 * for FormData bodies so axios can set its own boundary)
 */
async function uploadFile({ file, folder }: UploadFileParams): Promise<ApiResult<FileItem>> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
 
    return request<FileItem>(`${FILES_BASE}/upload`, {
        method: 'POST',
        body: formData,
    });
}
 
/**
 * Download a file — triggers a browser save-as via blob, fetched through
 * fetchFileBlob() which handles auth + silent refresh-retry on expiry.
 */
async function downloadFile(id: string, filename?: string): Promise<ApiResult<null>> {
    const result = await fetchFileBlob(id);
 
    if (!result.success) {
        return { success: false, data: null, error: result.error };
    }
 
    const url = window.URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
 
    return { success: true, data: null, error: null };
}
 
function renameFile({ id, name }: RenameFileParams): Promise<ApiResult<FileItem>> {
    return request<FileItem>(`${FILES_BASE}/${id}`, {
        method: 'PATCH', // matches router.patch("/:id", renameFileController)
        body: { name },
    });
}
 
function deleteFile(id: string): Promise<ApiResult<null>> {
    return request<null>(`${FILES_BASE}/${id}`, {
        method: 'DELETE',
    });
}
 
export const fileService = {
    uploadFile,
    downloadFile,
    renameFile,
    deleteFile,
    fetchFileBlob,
};