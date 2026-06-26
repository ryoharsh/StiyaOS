import request from './service';
import type { ApiResult } from '../types';
import type { FileItem } from './fileService';

// ---- Types matching your Mongoose schema ----

export interface FolderItem {
    _id: string;
    name: string;
    parent: string | null;
    owner: string;
    createdAt: string;
    updatedAt: string;
}

export interface FolderContents {
    folders: FolderItem[];
    files: FileItem[];
}

export interface CreateFolderParams {
    name: string;
    parent?: string | null;
}

export interface RenameFolderParams {
    id: string;
    name: string;
}

// ---- Service ----

const FOLDERS_BASE = '/api/folders';

function createFolder({ name, parent }: CreateFolderParams): Promise<ApiResult<FolderItem>> {
    return request<FolderItem>(FOLDERS_BASE, {
        method: 'POST',
        body: { name, parent: parent ?? null },
    });
}

/**
 * Pass "root" as id to fetch top-level contents (matches backend convention:
 * controller maps id === "root" -> parent: null)
 */
function getFolderContents(id: string = 'root'): Promise<ApiResult<FolderContents>> {
    return request<FolderContents>(`${FOLDERS_BASE}/${id}/contents`, {
        method: 'GET',
    });
}

function renameFolder({ id, name }: RenameFolderParams): Promise<ApiResult<FolderItem>> {
    return request<FolderItem>(`${FOLDERS_BASE}/${id}`, {
        method: 'PATCH', // matches router.patch("/:id", renameFolderController)
        body: { name },
    });
}

function deleteFolder(id: string): Promise<ApiResult<null>> {
    return request<null>(`${FOLDERS_BASE}/${id}`, {
        method: 'DELETE',
    });
}

export const folderService = {
    createFolder,
    getFolderContents,
    renameFolder,
    deleteFolder,
};