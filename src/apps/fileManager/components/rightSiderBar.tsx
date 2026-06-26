import { CaretDownIcon, FileIcon, DotsThreeIcon, TrashIcon, DownloadIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useFileExplorerStore } from '../../../store/useFileStore';

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} b`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kb`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} mb`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} gb`;
}

export const RightSidebar = () => {
    const { selectedFile, renameFile, deleteFile, downloadFile, selectFile } = useFileExplorerStore();
    const [editing, setEditing] = useState(false);
    const [nameInput, setNameInput] = useState("");

    if (!selectedFile) {
        return (
            <div className="hidden xl:block bg-white w-full xl:w-[320px] 2xl:w-[20vw] h-full shadow-gray-300 shadow-2xl rounded-4xl overflow-hidden">
                <div className="w-full flex items-center gap-3 sm:gap-5 p-4 sm:p-6">
                    <FileIcon size={20} />
                    <h1 className="text-sm font-medium text-gray-900 flex-1 truncate">File Details</h1>
                </div>
                <div className="flex items-center justify-center h-[60vh] text-gray-400 text-sm px-6 text-center">
                    Select a file to see its details.
                </div>
            </div>
        );
    }

    const startEditing = () => {
        setNameInput(selectedFile.name);
        setEditing(true);
    };

    const commitRename = async () => {
        setEditing(false);
        if (nameInput.trim() && nameInput.trim() !== selectedFile.name) {
            await renameFile(selectedFile._id, nameInput.trim());
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Delete "${selectedFile.name}"?`)) {
            await deleteFile(selectedFile._id);
            selectFile(null);
        }
    };

    return (
        <div className="hidden xl:block bg-white w-full xl:w-[320px] 2xl:w-[20vw] h-full shadow-gray-300 shadow-2xl rounded-4xl overflow-hidden">
            <div className="w-full flex items-center gap-3 sm:gap-5 p-4 sm:p-6">
                <FileIcon size={20} />
                <h1 className="text-sm font-medium text-gray-900 flex-1 truncate">File Details</h1>
                <button
                    onClick={() => downloadFile(selectedFile._id, selectedFile.originalName)}
                    className="bg-gray-100 rounded-full p-2.5 text-gray-900 size-fit hover:bg-gray-200"
                >
                    <DownloadIcon size={18} />
                </button>
                <button
                    onClick={handleDelete}
                    className="bg-gray-100 rounded-full p-2.5 text-gray-900 size-fit hover:bg-red-100 hover:text-red-500"
                >
                    <TrashIcon size={18} />
                </button>
            </div>

            <div className="overflow-y-auto w-full h-[72vh] md:h-[89vh] p-4 sm:p-6">
                <div className="w-full mt-2 sm:mt-5 px-4 sm:px-6 py-3 sm:py-2.5 rounded-full flex flex-col items-center justify-center">
                    <div className="w-28 h-28 sm:w-45 sm:h-50 rounded-4xl bg-gray-100 items-center justify-center flex text-gray-400 overflow-hidden">
                        <FileIcon size={36} />
                    </div>

                    {editing ? (
                        <input
                            autoFocus
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && commitRename()}
                            onBlur={commitRename}
                            className="mt-4 sm:mt-6 text-center border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none w-full"
                        />
                    ) : (
                        <h2
                            onClick={startEditing}
                            className="text-gray-900 mt-4 sm:mt-6 font-medium truncate cursor-pointer hover:underline"
                            title="Click to rename"
                        >
                            {selectedFile.name}
                        </h2>
                    )}
                    <p className="text-gray-500 text-sm">{formatBytes(selectedFile.size)}</p>
                </div>

                <div className="w-full mt-6 sm:mt-10">
                    <div className="flex items-center gap-3">
                        <FileIcon />
                        <h1 className="text-sm font-medium text-gray-900 flex-1 truncate">Details</h1>
                        <CaretDownIcon size={20} />
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Type</span>
                            <span className="text-gray-900">{selectedFile.mimeType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Uploaded</span>
                            <span className="text-gray-900">
                                {new Date(selectedFile.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Modified</span>
                            <span className="text-gray-900">
                                {new Date(selectedFile.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}