import { DotsThreeIcon, GridFourIcon, ListIcon, PlusIcon, TrashIcon, CaretRightIcon } from "@phosphor-icons/react";
import React, { useEffect, useRef, useState, useId } from "react";
import { useFileExplorerStore } from "../../../store/useFileStore";
import type { FolderItem } from "../../../services/folderService";
import { fileService, type FileItem } from "../../../services/fileService";

type GradientStop = {
    offset: string;
    color: string;
    opacity?: number;
};

type Gradient =
    | { id?: string; type?: "linear"; stops: GradientStop[]; x1?: string; y1?: string; x2?: string; y2?: string }
    | { id?: string; type: "radial"; stops: GradientStop[] };

type Fill = string | Gradient | null;

export const FolderGradient: React.FC<{
    upper?: Fill;
    lower?: Fill;
    size?: number | string;
    className?: string;
}> = ({ upper = "#ffffff", lower = "#333333", size = 23, className }) => {
    const reactId = useId();
    const topId = `folder-top-${reactId}`;
    const bottomId = `folder-bottom-${reactId}`;

    const isGradient = (f: Fill): f is Gradient => typeof f === "object" && f !== null;

    const renderGradientDef = (id: string, g: Gradient) => {
        if (g.type === "radial") {
            return (
                <radialGradient id={id}>
                    {g.stops.map((stop, i) => (
                        <stop key={i} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity ?? 1} />
                    ))}
                </radialGradient>
            );
        }

        const x1 = (g as any).x1 ?? "0%";
        const y1 = (g as any).y1 ?? "0%";
        const x2 = (g as any).x2 ?? "100%";
        const y2 = (g as any).y2 ?? "100%";

        return (
            <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
                {g.stops.map((stop, i) => (
                    <stop key={i} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity ?? 1} />
                ))}
            </linearGradient>
        );
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 175"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden
            role="img"
        >
            <defs>
                {isGradient(upper) && renderGradientDef(topId, upper)}
                {isGradient(lower) && renderGradientDef(bottomId, lower)}
            </defs>
            <path
                d="M0 30C0 13.4315 13.4315 0 30 0H57H88.46C99.2953 0 109.289 5.84274 114.603 15.2851L115.632 17.1131C117.404 20.2605 120.735 22.2081 124.347 22.2081H170C186.569 22.2081 200 35.6396 200 52.2081V86.1675V145C200 161.569 186.569 175 170 175H30C13.4315 175 0 161.569 0 145V30Z"
                fill={isGradient(upper) ? `url(#${topId})` : (upper as string)}
            />
            <rect
                y="45"
                width="200"
                height="130"
                rx="30"
                fill={isGradient(lower) ? `url(#${bottomId})` : (lower as string)}
            />
        </svg>
    );
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} b`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kb`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} mb`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} gb`;
}

function isImage(mimeType: string): boolean {
    return mimeType.startsWith("image/");
}

/**
 * Plain <img src="..."> can't send an Authorization header, and the download
 * route requires one. fileService.fetchFileBlob() handles auth + silent
 * refresh-retry on token expiry, so we just turn its blob into an object URL.
 */
const AuthenticatedThumbnail: React.FC<{ fileId: string }> = ({ fileId }) => {
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string | null = null;
        let cancelled = false;

        const load = async () => {
            const result = await fileService.fetchFileBlob(fileId);
            if (cancelled || !result.success) return;
            objectUrl = URL.createObjectURL(result.blob);
            setSrc(objectUrl);
        };

        load();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fileId]);

    if (!src) {
        return (
            <div className="w-full h-40 sm:h-44 mb-2 rounded-3xl bg-gray-100 items-center justify-center flex text-gray-400 animate-pulse" />
        );
    }

    return (
        <img
            src={src}
            className="w-full h-40 sm:h-44 mb-2 rounded-3xl bg-gray-100 items-center justify-center flex text-gray-400 object-cover"
        />
    );
};

export const CenterContent: React.FC = () => {
    const {
        folders,
        files,
        loading,
        error,
        breadcrumb,
        selectedFile,
        uploading,
        fetchContents,
        openFolder,
        goToBreadcrumb,
        selectFile,
        createFolder,
        deleteFolder,
        uploadFile,
        deleteFile,
    } = useFileExplorerStore();

    const [creatingFolder, setCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchContents("root");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentFolderName = breadcrumb[breadcrumb.length - 1]?.name ?? "Home";

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            setCreatingFolder(false);
            return;
        }
        await createFolder(newFolderName.trim());
        setNewFolderName("");
        setCreatingFolder(false);
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await uploadFile(file);
        e.target.value = ""; // allow re-selecting same file
    };

    const handleDeleteFolder = async (e: React.MouseEvent, folder: FolderItem) => {
        e.stopPropagation();
        if (window.confirm(`Delete "${folder.name}" and everything inside it? This can't be undone.`)) {
            await deleteFolder(folder._id);
        }
    };

    const handleDeleteFile = async (e: React.MouseEvent, file: FileItem) => {
        e.stopPropagation();
        if (window.confirm(`Delete "${file.name}"?`)) {
            await deleteFile(file._id);
        }
    };

    return (
        <div className="flex-1 h-full rounded-4xl relative min-w-0">
            <div className="w-full h-full">
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                />

                <div className="absolute left-4 sm:left-6 top-6 pointer-events-none px-6 sm:px-16 flex items-center w-full flex-col sm:flex-row sm:items-center">
                    <FolderGradient
                        size={140}
                        upper={{
                            type: "linear",
                            stops: [
                                { offset: "0%", color: "#fff" },
                                { offset: "100%", color: "#f9f9f9" },
                            ],
                        }}
                        lower={{
                            type: "linear",
                            stops: [
                                { offset: "0%", color: "#F18263" },
                                { offset: "100%", color: "#F48063" },
                            ],
                        }}
                    />
                    <div className="ms-0 sm:ms-10 w-full flex items-center justify-between pointer-events-auto">
                        <div className="min-w-0">
                            {/* breadcrumb */}
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1 overflow-x-auto whitespace-nowrap">
                                {breadcrumb.map((crumb, i) => (
                                    <React.Fragment key={crumb.id}>
                                        {i > 0 && <CaretRightIcon size={12} />}
                                        <button
                                            onClick={() => goToBreadcrumb(i)}
                                            disabled={i === breadcrumb.length - 1}
                                            className={
                                                i === breadcrumb.length - 1
                                                    ? "text-gray-700 font-medium"
                                                    : "hover:underline"
                                            }
                                        >
                                            {crumb.name}
                                        </button>
                                    </React.Fragment>
                                ))}
                            </div>
                            <h1 className="text-gray-900 font-bold text-lg sm:text-xl truncate">{currentFolderName}</h1>
                            <p className="text-gray-600 text-sm">
                                {folders.length} folders and {files.length} files
                            </p>
                        </div>

                        <div className="flex gap-3 mt-3 sm:mt-0">
                            <button
                                disabled={!selectedFile}
                                onClick={(e) => selectedFile && handleDeleteFile(e, selectedFile)}
                                className="bg-white p-2.5 rounded-full items-center justify-center flex text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <TrashIcon size={18} />
                            </button>
                            <button
                                onClick={handleUploadClick}
                                disabled={uploading}
                                className="bg-white p-2.5 rounded-full items-center justify-center flex text-gray-700 disabled:opacity-50"
                            >
                                <PlusIcon size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative w-full h-full overflow-y-scroll hidesb">
                    {error && (
                        <div className="mt-36 sm:mt-32 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl p-4">
                            {error}
                        </div>
                    )}

                    <div className="bg-white/80 border border-gray-200 shadow-gray-300 shadow-2xl rounded-4xl p-6 sm:p-10 mt-36 sm:mt-32 backdrop-blur-sm min-w-0">
                        <div className="w-full flex justify-between items-center">
                            <h1 className="text-gray-900 font-semibold text-md">{folders.length} Folders</h1>
                            <button
                                onClick={() => setCreatingFolder(true)}
                                className="hover:bg-gray-100 text-gray-500 space-x-2 p-2 flex items-center rounded-xl px-4"
                            >
                                <PlusIcon size={20} />
                                <p className="text-sm text-gray-500">Create new folder</p>
                            </button>
                        </div>

                        <div className="w-full mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-center">
                            {creatingFolder && (
                                <div className="p-3 rounded-4xl max-w-[220px]">
                                    <FolderGradient size={140} upper={"oklch(87.2% 0.01 258.338)"} lower={"oklch(96.7% 0.003 264.542)"} />
                                    <input
                                        autoFocus
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                                        onBlur={handleCreateFolder}
                                        placeholder="Folder name"
                                        className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 outline-none"
                                    />
                                </div>
                            )}

                            {loading && folders.length === 0 && !creatingFolder && (
                                <p className="text-sm text-gray-400 col-span-full">Loading...</p>
                            )}

                            {!loading && folders.length === 0 && !creatingFolder && (
                                <p className="text-sm text-gray-400 col-span-full">No folders here yet.</p>
                            )}

                            {folders.map((folder) => (
                                <div
                                    key={folder._id}
                                    onClick={() => openFolder(folder)}
                                    className="hover:scale-96 duration-200 ease-in-out transition p-3 rounded-4xl max-w-[220px] cursor-pointer group"
                                >
                                    <FolderGradient size={140} upper={"oklch(87.2% 0.01 258.338)"} lower={"oklch(96.7% 0.003 264.542)"} />
                                    <div className="w-full items-center flex text-gray-500">
                                        <div className="flex-1 min-w-0">
                                            <h1 className="text-md text-gray-900 line-clamp-2 w-full">{folder.name}</h1>
                                            <p className="text-gray-500 text-xs">folder</p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteFolder(e, folder)}
                                            className="opacity-0 group-hover:opacity-100 transition hover:text-red-500"
                                        >
                                            <DotsThreeIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/80 border border-gray-200 shadow-gray-300 shadow-2xl rounded-4xl p-6 sm:p-10 mt-2 backdrop-blur-sm">
                        <div className="w-full flex justify-between items-center">
                            <h1 className="text-gray-900 font-semibold text-md">All Files</h1>
                            <div className="flex gap-4">
                                <div className="bg-orange-100 p-3 rounded-full items-center justify-center flex text-orange-500">
                                    <GridFourIcon size={20} />
                                </div>
                                <div className="bg-gray-100 p-3 rounded-full items-center justify-center flex text-gray-700">
                                    <ListIcon size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="w-full mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-center">
                            {loading && files.length === 0 && (
                                <p className="text-sm text-gray-400 col-span-full">Loading...</p>
                            )}

                            {!loading && files.length === 0 && (
                                <p className="text-sm text-gray-400 col-span-full">No files here yet.</p>
                            )}

                            {files.map((file) => (
                                <div
                                    key={file._id}
                                    onClick={() => selectFile(file)}
                                    className={`hover:scale-96 duration-200 ease-in-out transition p-3 rounded-4xl cursor-pointer group ${
                                        selectedFile?._id === file._id ? "ring-2 ring-orange-400" : ""
                                    }`}
                                >
                                    {isImage(file.mimeType) ? (
                                        <AuthenticatedThumbnail fileId={file._id} />
                                    ) : (
                                        <div className="w-full h-40 sm:h-44 mb-2 rounded-3xl bg-gray-100 items-center justify-center flex text-gray-400">
                                            <span className="text-xs uppercase">{file.mimeType.split("/")[1] || "file"}</span>
                                        </div>
                                    )}
                                    <div className="w-full items-center flex text-gray-500">
                                        <div className="flex-1 min-w-0">
                                            <h1 className="text-md text-gray-900 line-clamp-2 w-full">{file.name}</h1>
                                            <p className="text-gray-500 text-xs">{formatBytes(file.size)}</p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteFile(e, file)}
                                            className="opacity-0 group-hover:opacity-100 transition hover:text-red-500"
                                        >
                                            <DotsThreeIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};