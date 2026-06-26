import { useState, useRef, useEffect } from 'react';
import {
    Search,
    Grid,
    List,
    File,
    FileText,
    Image,
    Video,
    Music,
    Archive,
    Folder,
    MoreVertical,
    Plus,
    Settings,
} from 'lucide-react';
import { SvgIcons } from '../../utils/preloadedSvg.tsx';

export default function FileExplorer() {
    const containerRef = useRef(null); // main container ref used for clamping
    const [currentPath, setCurrentPath] = useState('Root');
    const [navigationHistory, setNavigationHistory] = useState(['Root']);
    const [activeMenu, setActiveMenu] = useState('All Files');

    const [files, setFiles] = useState([
        { id: 1, name: 'Quantum flow', type: 'folder', size: null, modified: '2 days ago', thumbnail: null, path: 'Root/Quantum flow', parent: 'Root' },
        { id: 2, name: 'My documents', type: 'folder', size: null, modified: '1 week ago', thumbnail: null, path: 'Root/My documents', parent: 'Root' },
        { id: 3, name: 'Photos', type: 'folder', size: null, modified: '2 weeks ago', thumbnail: null, path: 'Root/Photos', parent: 'Root' },
        { id: 4, name: 'som-dreams-1273', type: 'image', size: '2.4 MB', modified: '3 days ago', thumbnail: '/api/placeholder/150/150', path: 'Root/som-dreams-1273.jpg', parent: 'Root' },
        { id: 5, name: 'short-forms-2023', type: 'image', size: '1.8 MB', modified: '1 week ago', thumbnail: '/api/placeholder/150/150', path: 'Root/short-forms-2023.jpg', parent: 'Root' },
        { id: 6, name: 'ceremony-2023', type: 'image', size: '3.2 MB', modified: '2 weeks ago', thumbnail: '/api/placeholder/150/150', path: 'Root/ceremony-2023.jpg', parent: 'Root' },
        { id: 7, name: 'Walkthrough-03323', type: 'image', size: '1.5 MB', modified: '1 month ago', thumbnail: '/api/placeholder/150/150', path: 'Root/Walkthrough-03323.jpg', parent: 'Root' },
        { id: 8, name: 'bride_feel.mp3', type: 'audio', size: '4.2 MB', modified: '2 days ago', thumbnail: null, path: 'Root/bride_feel.mp3', parent: 'Root' },
        { id: 9, name: 'prabandham-excerpt', type: 'document', size: '245 KB', modified: '1 week ago', thumbnail: null, path: 'Root/prabandham-excerpt.docx', parent: 'Root' },
        { id: 10, name: 'dumplist-a-thinabout', type: 'document', size: '128 KB', modified: '3 days ago', thumbnail: null, path: 'Root/dumplist-a-thinabout.txt', parent: 'Root' },
        { id: 11, name: 'Wordfall-Worldviews', type: 'document', size: '89 KB', modified: '1 week ago', thumbnail: null, path: 'Root/Wordfall-Worldviews.docx', parent: 'Root' },
        { id: 12, name: 'Aadhaar.pdf', type: 'pdf', size: '512 KB', modified: '2 weeks ago', thumbnail: null, path: 'Root/Aadhaar.pdf', parent: 'Root' },
        { id: 13, name: 'sequence-in-2019', type: 'image', size: '2.1 MB', modified: '1 month ago', thumbnail: '/api/placeholder/150/150', path: 'Root/sequence-in-2019.jpg', parent: 'Root' },
        { id: 14, name: 'project-notes.txt', type: 'document', size: '45 KB', modified: '1 day ago', thumbnail: null, path: 'Root/Quantum flow/project-notes.txt', parent: 'Root/Quantum flow' },
        { id: 15, name: 'quantum-data.xlsx', type: 'document', size: '890 KB', modified: '2 days ago', thumbnail: null, path: 'Root/Quantum flow/quantum-data.xlsx', parent: 'Root/Quantum flow' },
        { id: 16, name: 'vacation-2023.jpg', type: 'image', size: '3.4 MB', modified: '1 week ago', thumbnail: '/api/placeholder/150/150', path: 'Root/Photos/vacation-2023.jpg', parent: 'Root/Photos' },
        { id: 17, name: 'family-portrait.jpg', type: 'image', size: '2.8 MB', modified: '2 weeks ago', thumbnail: '/api/placeholder/150/150', path: 'Root/Photos/family-portrait.jpg', parent: 'Root/Photos' }
    ]);

    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    // Context menu state
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, target: null });

    // Header action dropdown
    const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

    const getFileIcon = (type) => {
        switch (type) {
            case 'folder': return <Folder className="w-8 h-8 text-yellow-500" />;
            case 'image': return <Image className="w-8 h-8 text-green-500" />;
            case 'video': return <Video className="w-8 h-8 text-purple-500" />;
            case 'audio': return <Music className="w-8 h-8 text-pink-500" />;
            case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
            case 'document': return <FileText className="w-8 h-8 text-blue-500" />;
            case 'archive': return <Archive className="w-8 h-8 text-orange-500" />;
            default: return <File className="w-8 h-8 text-gray-500" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes && bytes !== 0) return '';
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const toggleSelect = (fileId) => {
        setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]));
    };

    const menuFromPath = (path) => {
        if (!path || path === 'Root') return 'All Files';
        return path.split('/').pop();
    };

    const navigateToPath = (targetPath) => {
        setCurrentPath(targetPath);
        if (targetPath === 'Root') {
            setNavigationHistory(['Root']);
            setActiveMenu('All Files');
        } else {
            const parts = targetPath.split('/');
            const accum = parts.map((_, i) => parts.slice(0, i + 1).join('/'));
            setNavigationHistory(accum);
            setActiveMenu(menuFromPath(targetPath));
        }
    };

    const navigateBack = () => {
        if (navigationHistory.length > 1) {
            const newHistory = navigationHistory.slice(0, -1);
            const previousPath = newHistory[newHistory.length - 1];
            setNavigationHistory(newHistory);
            setCurrentPath(previousPath);
            setActiveMenu(menuFromPath(previousPath));
        }
    };

    const openFileOrFolder = (file) => {
        if (file.type === 'folder') navigateToPath(file.path);
        else console.log('Open file:', file.path);
    };

    // Improved context menu placement that clamps to the main content container (so resizing works)
    const onContextMenu = (e, file) => {
        e.preventDefault();

        // close header menu if open
        if (headerMenuOpen) setHeaderMenuOpen(false);

        const MENU_WIDTH = 220;
        const MENU_HEIGHT = 240;

        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };

        // preferred placement: right of item
        let xCandidate = rect.right + 8;
        let yCandidate = rect.top;

        // clamp x within containerRect (leave 8px padding)
        const minX = containerRect.left + 8;
        const maxX = containerRect.right - MENU_WIDTH - 8;
        let x = Math.min(Math.max(xCandidate, minX), Math.max(minX, maxX));

        // if there isn't room on the right, place to the left of the item
        if (xCandidate > maxX) {
            x = Math.max(minX, rect.left - MENU_WIDTH - 8);
        }

        // clamp y within containerRect
        const minY = containerRect.top + 8;
        const maxY = containerRect.bottom - MENU_HEIGHT - 8;
        let y = Math.min(Math.max(yCandidate, minY), Math.max(minY, maxY));

        // fallback to viewport clamp if container is tiny
        x = Math.min(Math.max(x, 8), window.innerWidth - MENU_WIDTH - 8);
        y = Math.min(Math.max(y, 8), window.innerHeight - MENU_HEIGHT - 8);

        setContextMenu({ visible: true, x, y, target: file });
        if (!selectedFiles.includes(file.id)) setSelectedFiles([file.id]);
    };

    useEffect(() => {
        const onClick = () => setContextMenu((c) => (c.visible ? { ...c, visible: false } : c));
        window.addEventListener('click', onClick);
        return () => window.removeEventListener('click', onClick);
    }, []);

    const createNewFolder = (parent = currentPath) => {
        const name = window.prompt('New folder name');
        if (!name) return;
        const id = Date.now();
        const newFolder = { id, name, type: 'folder', size: null, modified: 'Just now', thumbnail: null, path: `${parent}/${name}`, parent };
        setFiles((prev) => [newFolder, ...prev]);
        navigateToPath(newFolder.path);
    };

    const createNewFile = (parent = currentPath) => {
        const name = window.prompt('New file name (include extension)');
        if (!name) return;
        const id = Date.now();
        const newFile = { id, name, type: 'document', size: '0 KB', modified: 'Just now', thumbnail: null, path: `${parent}/${name}`, parent };
        setFiles((prev) => [newFile, ...prev]);
    };

    const deleteSelected = () => {
        if (!selectedFiles.length) return;
        const idsToDelete = new Set(selectedFiles);
        setFiles((prev) => prev.filter((f) => !idsToDelete.has(f.id)));
        setSelectedFiles([]);
    };

    const renameSelected = () => {
        if (selectedFiles.length !== 1) return;
        const id = selectedFiles[0];
        const item = files.find((f) => f.id === id);
        if (!item) return;
        const newName = window.prompt('Rename to:', item.name);
        if (!newName) return;
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name: newName, path: `${item.parent}/${newName}` } : f)));
    };

    const openLocation = () => {
        if (!selectedFiles.length) return;
        const item = files.find((f) => f.id === selectedFiles[0]);
        if (item) navigateToPath(item.parent);
    };

    const handleContextAction = (action) => {
        const target = contextMenu.target;
        setContextMenu((c) => ({ ...c, visible: false }));
        switch (action) {
            case 'open': openFileOrFolder(target); break;
            case 'open-location': openLocation(); break;
            case 'rename': renameSelected(); break;
            case 'delete': deleteSelected(); break;
            case 'new-folder': createNewFolder(target.type === 'folder' ? target.path : target.parent); break;
            case 'new-file': createNewFile(target.type === 'folder' ? target.path : target.parent); break;
            default: break;
        }
    };

    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files || []);
        if (!uploadedFiles.length) return;
        uploadedFiles.forEach((file) => {
            const id = Date.now();
            const newFile = { id, name: file.name, type: 'document', size: formatFileSize(file.size), modified: 'Just now', thumbnail: null, path: `${currentPath}/${file.name}`, parent: currentPath };
            setFiles((prev) => [newFile, ...prev]);
        });
    };

    // Apply search to files in currentPath
    const filteredFiles = files.filter(
        (file) => file.parent === currentPath && file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full h-full bg-gray-50 flex" ref={containerRef}>
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-3 bg-white border border-gray-300 text-gray-900 p-3 rounded-full mt-3 mx-3 shadow font-bold uppercase">
                    <Plus className={'p-1 size-7 rounded-full text-white bg-gradient-to-r from-pink-500 to-orange-500'} />
                    <span>Upload</span>
                </button>

                <nav className="flex-1 p-4">
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600 mb-3">Quick Access</div>
                        {['All Files', 'Photos', 'Videos', 'Music', 'Stiya Computer'].map((label) => (
                            <button key={label} onClick={() => { setActiveMenu(label); navigateToPath(label === 'All Files' ? 'Root' : `Root/${label}`); }}
                                    className={`flex items-center space-x-3 w-full text-left px-4 py-2 rounded-xl ${activeMenu === label ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                                {label === 'All Files' && <Folder className="w-4 h-4" />}
                                {label === 'Photos' && <Image className="w-4 h-4" />}
                                {label === 'Videos' && <Video className="w-4 h-4" />}
                                {label === 'Music' && <Music className="w-4 h-4" />}
                                {label === 'Stiya Computer' && <Folder className="w-4 h-4" />}
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Free subscription</span>
                        <Settings className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <div className="text-xs text-gray-500">68% of 2 GB used</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 w-4 h-4" />
                        <input type="text" placeholder="Search files and folders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-gray-900 focus:border-transparent outline-none" />
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <button onClick={() => { setHeaderMenuOpen((s) => !s); setContextMenu({ ...contextMenu, visible: false }); }} className="p-2 rounded-full border border-gray-200 bg-white">
                                <Plus className="w-4 h-4" />
                            </button>
                            {headerMenuOpen && (
                                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white border border-gray-200 shadow-xl">
                                    <button onClick={() => { createNewFolder(); setHeaderMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">New folder</button>
                                    <button onClick={() => { createNewFile(); setHeaderMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">New file</button>
                                    <button onClick={() => { fileInputRef.current?.click(); setHeaderMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">Upload files</button>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button onClick={() => { setContextMenu((c) => ({ visible: !c.visible, x: 0, y: 0, target: files.find(f => f.id === selectedFiles[0]) || null })); setHeaderMenuOpen(false); }} className="p-2 rounded-full border border-gray-200 bg-white">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            {contextMenu.visible && contextMenu.x === 0 && (
                                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-gray-200 shadow-xl">
                                    <button onClick={() => { openLocation(); setContextMenu((c)=>({ ...c, visible:false })); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">Open location</button>
                                    <button onClick={() => { renameSelected(); setContextMenu((c)=>({ ...c, visible:false })); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">Rename</button>
                                    <button onClick={() => { deleteSelected(); setContextMenu((c)=>({ ...c, visible:false })); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white border-b border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <button onClick={() => { if (navigationHistory.length > 1) navigateBack(); }} className="p-2 text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full">{SvgIcons.getArrowLeft('#000')}</button>
                                <div className="text-sm text-gray-600">
                                    {currentPath.split('/').map((segment, index) => (
                                        <span key={index}>
                      {index > 0 && ' → '}
                                            <button onClick={() => navigateToPath(currentPath.split('/').slice(0, index + 1).join('/'))} className="hover:text-gray-900 hover:underline">{segment}</button>
                    </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}><Grid className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}><List className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-auto" onContextMenu={(e)=>e.preventDefault()}>

                    {/* Folders */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                            Folders
                            <div className="ml-2 w-4 h-4 bg-gray-200 rounded text-xs flex items-center justify-center text-gray-600">{filteredFiles.filter(f => f.type === 'folder').length}</div>
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredFiles.filter(f => f.type === 'folder').map((folder) => (
                                <div key={folder.id} className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${selectedFiles.includes(folder.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => toggleSelect(folder.id)} onDoubleClick={() => openFileOrFolder(folder)} onContextMenu={(e) => onContextMenu(e, folder)}>
                                    <Folder className="w-12 h-12 text-yellow-500 mb-2" />
                                    <div className="text-sm font-medium text-gray-900 truncate">{folder.name}</div>
                                    <div className="text-xs text-gray-500">{folder.modified}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Files */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-3">Files</h3>

                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {filteredFiles.filter(f => f.type !== 'folder').map((file) => (
                                    <div key={file.id} className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedFiles.includes(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => toggleSelect(file.id)} onDoubleClick={() => openFileOrFolder(file)} onContextMenu={(e) => onContextMenu(e, file)}>
                                        {file.thumbnail ? (
                                            <div className="w-full h-20 bg-gray-100 rounded mb-2 overflow-hidden"><img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" /></div>
                                        ) : (
                                            <div className="w-full h-20 flex justify-center items-center mb-2">{getFileIcon(file.type)}</div>
                                        )}
                                        <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                                        <div className="text-xs text-gray-500">{file.size}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredFiles.filter(f => f.type !== 'folder').map((file) => (
                                    <div key={file.id} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedFiles.includes(file.id) ? 'bg-blue-50' : ''}`} onClick={() => toggleSelect(file.id)} onDoubleClick={() => openFileOrFolder(file)} onContextMenu={(e) => onContextMenu(e, file)}>
                                        {file.thumbnail ? (
                                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden"><img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" /></div>
                                        ) : (
                                            getFileIcon(file.type)
                                        )}
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                                            <div className="text-xs text-gray-500">{file.modified}</div>
                                        </div>
                                        <div className="text-sm text-gray-500">{file.size}</div>
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Context menu render (placed next to item, clamped to container/viewport) */}
                    {contextMenu.visible && contextMenu.target && (
                        <div style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 60 }} className="rounded-xl bg-white border border-gray-200 shadow-xl w-52">
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => handleContextAction('open')}>Open</button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => handleContextAction('open-location')}>Open location</button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => handleContextAction('rename')}>Rename</button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => handleContextAction('delete')}>Delete</button>
                            <div className="border-t" />
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => handleContextAction('new-folder')}>New folder here</button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => handleContextAction('new-file')}>New file here</button>
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
                </div>
            </div>
        </div>
    );
}
