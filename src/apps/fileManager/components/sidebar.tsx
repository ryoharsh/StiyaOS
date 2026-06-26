import { CaretRightIcon, FolderIcon, HardDriveIcon, MagnifyingGlassIcon, UploadIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useFileExplorerStore } from "../../../store/useFileStore";

export const FolderIconWhite = ({ upper = "#fff", lower = "#333", size = "23" }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={size} height={size} fill={upper} viewBox="0 0 24 24">
            <path d="M19,20H5c-1.657,0-3-1.343-3-3V5h17c1.657,0,3,1.343,3,3v9C22,18.657,20.657,20,19,20z" fill={lower}></path><path d="M11,5H2V4c0-1.105,0.895-2,2-2h4.558c0.861,0,1.625,0.551,1.897,1.368L11,5z"></path>
        </svg>
    );
}

export const LeftSidebar = () => {
    const { goToRoot, uploadFile, currentFolderId } = useFileExplorerStore();
    const [search, setSearch] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await uploadFile(file);
        e.target.value = "";
    };

    return (
        <div className="bg-white w-full sm:w-[260px] md:w-[320px] lg:w-[16vw] h-full shadow-gray-300 shadow-2xl rounded-4xl p-4 sm:p-6 overflow-y-scroll hidesb">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

            <div className="w-full flex items-center gap-5">
                <button
                    onClick={() => goToRoot()}
                    className="bg-orange-500 rounded-full p-3.5 text-white size-fit"
                >
                    <FolderIcon size={20} />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 w-full truncate hidden sm:block">Files</h1>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-200 rounded-full p-3.5 text-gray-900 size-fit hover:bg-gray-300"
                >
                    <UploadIcon size={20} />
                </button>
            </div>

            <div className="w-full mt-4 border border-gray-300 px-4 py-2 rounded-full flex gap-3 items-center">
                <MagnifyingGlassIcon size={24} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search files or folders."
                    className="py-1 outline-none w-full text-sm"
                />
            </div>

            {/* Recents — no backend endpoint for this yet, stays static for now */}
            <div className="border-y -mx-4 p-4 sm:p-6 mt-4 border-gray-300">
                <p className="uppercase font-medium text-sm text-gray-600 mb-3">Recents</p>
                <ul className="space-y-2">
                    <li className={`bg-gradient-to-br from-[#F18263] to-[#F48063] py-3 rounded-full mt-0 pl-4 pr-2 flex items-center gap-3`}>
                        <FolderIconWhite upper="oklch(87.2% 0.01 258.338)" lower="#fff" size="20" />
                        <p className="text-white font-medium text-sm flex-1 truncate">Videos</p>
                        <div className="bg-white/30 rounded-full text-white p-1.5 items-center justify-center flex"><CaretRightIcon size={20} /></div>
                    </li>
                    <li className={`py-3 rounded-full mt-0 pl-4 pr-2 flex items-center gap-3`}>
                        <FolderIconWhite upper="oklch(55.1% 0.027 264.364)" lower="oklch(87.2% 0.01 258.338)" size="20" />
                        <p className="text-gray-500 font-medium text-sm flex-1 truncate">Pictures</p>
                        <div className="bg-white/30 rounded-full text-gray-500 p-1.5 items-center justify-center flex"><CaretRightIcon size={20} /></div>
                    </li>
                    <li className={`py-3 rounded-full mt-0 pl-4 pr-2 flex items-center gap-3`}>
                        <FolderIconWhite upper="oklch(55.1% 0.027 264.364)" lower="oklch(87.2% 0.01 258.338)" size="20" />
                        <p className="text-gray-500 font-medium text-sm flex-1 truncate">Documents</p>
                        <div className="bg-white/30 rounded-full text-gray-500 p-1.5 items-center justify-center flex"><CaretRightIcon size={20} /></div>
                    </li>
                    <li className={`py-3 rounded-full mt-0 pl-4 pr-2 flex items-center gap-3`}>
                        <FolderIconWhite upper="oklch(55.1% 0.027 264.364)" lower="oklch(87.2% 0.01 258.338)" size="20" />
                        <p className="text-gray-500 font-medium text-sm flex-1 truncate">Music</p>
                        <div className="bg-white/30 rounded-full text-gray-500 p-1.5 items-center justify-center flex"><CaretRightIcon size={20} /></div>
                    </li>
                </ul>
            </div>

            <div className="border-t -mx-4 p-4 sm:p-6 mt-2 border-gray-300">
                <p className="uppercase font-medium text-sm text-gray-600 mb-3">Disks</p>
                <ul className="space-y-2">
                    <li className={`py-3 rounded-full mt-0 pl-4 pr-2 flex items-center gap-3`}>
                        <div className="text-gray-500"><HardDriveIcon size={20} /></div>
                        <p className="text-gray-500 font-medium text-sm flex-1 truncate">Stiya Computer</p>
                        <div className="bg-white/30 rounded-full text-gray-500 p-1.5 items-center justify-center flex"><CaretRightIcon size={20} /></div>
                    </li>
                    <li className={`py-3 rounded-full mt-0 pl-4 pr-2 flex items-center gap-3`}>
                        <div className="text-gray-500"><HardDriveIcon size={20} /></div>
                        <p className="text-gray-500 font-medium text-sm flex-1 truncate">Local Disk (F:)</p>
                        <div className="bg-white/30 rounded-full text-gray-500 p-1.5 items-center justify-center flex"><CaretRightIcon size={20} /></div>
                    </li>
                    <li className={`py-3 rounded-full mt-0 pl-4 pr-2 flex items-center gap-3`}>
                        <div className="text-gray-500"><HardDriveIcon size={20} /></div>
                        <p className="text-gray-500 font-medium text-sm flex-1 truncate">Local Disk (E:)</p>
                        <div className="bg-white/30 rounded-full text-gray-500 p-1.5 items-center justify-center flex"><CaretRightIcon size={20} /></div>
                    </li>
                </ul>
            </div>
        </div>
    );
}