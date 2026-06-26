import { create } from "zustand";
import { fileService, type FileItem } from "../services/fileService";
import { folderService, type FolderItem } from "../services/folderService";

interface BreadcrumbEntry {
  id: string; // "root" or folder _id
  name: string;
}

interface FileExplorerState {
  // navigation
  currentFolderId: string; // "root" or a folder _id
  breadcrumb: BreadcrumbEntry[];

  // data
  folders: FolderItem[];
  files: FileItem[];
  loading: boolean;
  error: string | null;

  // selection (drives RightSidebar)
  selectedFile: FileItem | null;

  // upload
  uploading: boolean;

  // actions
  fetchContents: (folderId?: string) => Promise<void>;
  openFolder: (folder: FolderItem) => Promise<void>;
  goToBreadcrumb: (index: number) => Promise<void>;
  goToRoot: () => Promise<void>;

  selectFile: (file: FileItem | null) => void;

  createFolder: (name: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;

  uploadFile: (file: File) => Promise<void>;
  downloadFile: (id: string, filename: string) => Promise<void>;
  renameFile: (id: string, name: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
}

export const useFileExplorerStore = create<FileExplorerState>((set, get) => ({
  currentFolderId: "root",
  breadcrumb: [{ id: "root", name: "Home" }],

  folders: [],
  files: [],
  loading: false,
  error: null,

  selectedFile: null,

  uploading: false,

  fetchContents: async (folderId) => {
    const id = folderId ?? get().currentFolderId;
    set({ loading: true, error: null });

    const res = await folderService.getFolderContents(id);

    if (!res.success) {
      set({ loading: false, error: res.error });
      return;
    }

    set({
      folders: res.data!.folders,
      files: res.data!.files,
      currentFolderId: id,
      loading: false,
    });
  },

  openFolder: async (folder) => {
    set((state) => ({
      breadcrumb: [...state.breadcrumb, { id: folder._id, name: folder.name }],
      selectedFile: null,
    }));
    await get().fetchContents(folder._id);
  },

  goToBreadcrumb: async (index) => {
    const target = get().breadcrumb[index];
    if (!target) return;

    set((state) => ({
      breadcrumb: state.breadcrumb.slice(0, index + 1),
      selectedFile: null,
    }));
    await get().fetchContents(target.id);
  },

  goToRoot: async () => {
    set({ breadcrumb: [{ id: "root", name: "Home" }], selectedFile: null });
    await get().fetchContents("root");
  },

  selectFile: (file) => set({ selectedFile: file }),

  createFolder: async (name) => {
    const { currentFolderId } = get();
    const parent = currentFolderId === "root" ? null : currentFolderId;
    const res = await folderService.createFolder({ name, parent });

    if (!res.success) {
      set({ error: res.error });
      return;
    }
    await get().fetchContents();
  },

  renameFolder: async (id, name) => {
    const res = await folderService.renameFolder({ id, name });
    if (!res.success) {
      set({ error: res.error });
      return;
    }
    await get().fetchContents();
  },

  deleteFolder: async (id) => {
    const res = await folderService.deleteFolder(id);
    if (!res.success) {
      set({ error: res.error });
      return;
    }
    await get().fetchContents();
  },

  uploadFile: async (file) => {
    const { currentFolderId } = get();
    const folder = currentFolderId === "root" ? null : currentFolderId;

    set({ uploading: true, error: null });
    const res = await fileService.uploadFile({ file, folder });
    set({ uploading: false });

    if (!res.success) {
      set({ error: res.error });
      return;
    }
    await get().fetchContents();
  },

  downloadFile: async (id, filename) => {
    const res = await fileService.downloadFile(id, filename);
    if (!res.success) {
      set({ error: res.error });
    }
  },

  renameFile: async (id, name) => {
    const res = await fileService.renameFile({ id, name });
    if (!res.success) {
      set({ error: res.error });
      return;
    }
    await get().fetchContents();

    // keep RightSidebar in sync if the renamed file is currently selected
    const { selectedFile } = get();
    if (selectedFile?._id === id) {
      set({ selectedFile: { ...selectedFile, name } });
    }
  },

  deleteFile: async (id) => {
    const res = await fileService.deleteFile(id);
    if (!res.success) {
      set({ error: res.error });
      return;
    }
    const { selectedFile } = get();
    if (selectedFile?._id === id) {
      set({ selectedFile: null });
    }
    await get().fetchContents();
  },
}));