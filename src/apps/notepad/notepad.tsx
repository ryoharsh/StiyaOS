import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  FileTextIcon,
  FloppyDiskIcon,
  FolderOpenIcon,
  CopySimpleIcon,
  ScissorsIcon,
  ClipboardTextIcon,
  ArrowCounterClockwiseIcon,
  ArrowClockwiseIcon,
  MagnifyingGlassIcon,
  GearIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  XIcon,
  CodeIcon,
  CheckIcon,
  WarningIcon,
  InfoIcon,
  PencilSimpleIcon,
  TrashSimpleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  KeyboardIcon,
  FileCssIcon,
  FileHtmlIcon,
  FileJsIcon,
  FilePyIcon,
  FileJsxIcon,
  FileTextIcon as FileTxt,
  MinusIcon,
  NotepadIcon,
  StarIcon,
  BellRingingIcon,
  ClockIcon,
  PaintBrushIcon,
} from '@phosphor-icons/react';

interface NoteFile {
  id: string;
  name: string;
  content: string;
  lastModified: Date;
  fileType: 'txt' | 'md' | 'json' | 'js' | 'css' | 'html' | 'py' | 'xml' | 'yaml' | 'sql';
  isUnsaved: boolean;
  isFavorite: boolean;
  wordCount: number;
  charCount: number;
}

interface FindReplaceState {
  findText: string;
  replaceText: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  currentMatch: number;
  totalMatches: number;
  matchPositions: Array<{ start: number; end: number }>;
}

interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  wordWrap: boolean;
  showLineNumbers: boolean;
  showMiniMap: boolean;
  tabSize: number;
  autoSave: boolean;
  autoSaveInterval: number;
  highlightActiveLine: boolean;
  showWhitespace: boolean;
}

const NotepadApp: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);

  const [files, setFiles] = useState<NoteFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [findReplace, setFindReplace] = useState<FindReplaceState>({
    findText: '',
    replaceText: '',
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
    currentMatch: 0,
    totalMatches: 0,
    matchPositions: []
  });
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    wordWrap: true,
    showLineNumbers: true,
    showMiniMap: false,
    tabSize: 2,
    autoSave: false,
    autoSaveInterval: 30,
    highlightActiveLine: true,
    showWhitespace: false
  });
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [activePanel, setActivePanel] = useState<'editor' | 'preview'>('editor');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  const activeFile = files.find(file => file.id === activeFileId);

  // Create new file
  const createNewFile = useCallback((fileType: NoteFile['fileType'] = 'txt') => {
    const extension = fileType === 'txt' ? 'txt' : fileType;
    const newFile: NoteFile = {
      id: Date.now().toString(),
      name: `Untitled-${files.length + 1}.${extension}`,
      content: '',
      lastModified: new Date(),
      fileType: fileType,
      isUnsaved: false,
      isFavorite: false,
      wordCount: 0,
      charCount: 0
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    showNotification('success', 'New file created');
  }, [files.length]);

  // Update file content with undo support
  const updateFileContent = useCallback((content: string) => {
    if (!activeFileId) return;

    const activeFile = files.find(f => f.id === activeFileId);
    if (!activeFile) return;

    // Only add to undo stack if content actually changed
    if (activeFile.content !== content) {
      setUndoStack(prev => [...prev.slice(-49), activeFile.content]); // Keep last 50 states
      setRedoStack([]);
    }

    setFiles(prev => prev.map(file =>
      file.id === activeFileId
        ? {
          ...file,
          content,
          isUnsaved: true,
          lastModified: new Date(),
          wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
          charCount: content.length
        }
        : file
    ));
  }, [activeFileId, files]);

  // File operations
  const openFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileOpen = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const fileExtension = file.name.split('.').pop()?.toLowerCase() as NoteFile['fileType'] || 'txt';

      const newFile: NoteFile = {
        id: Date.now().toString(),
        name: file.name,
        content: content,
        lastModified: new Date(file.lastModified),
        fileType: fileExtension,
        isUnsaved: false,
        isFavorite: false,
        wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
        charCount: content.length
      };

      setFiles(prev => [...prev, newFile]);
      setActiveFileId(newFile.id);
      showNotification('success', `Opened ${file.name}`);
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const saveFile = useCallback(() => {
    if (!activeFile) return;

    const mimeTypes: Record<string, string> = {
      'txt': 'text/plain',
      'md': 'text/markdown',
      'json': 'application/json',
      'js': 'text/javascript',
      'css': 'text/css',
      'html': 'text/html',
      'py': 'text/x-python',
      'xml': 'application/xml',
      'yaml': 'text/yaml',
      'sql': 'text/x-sql'
    };

    const blob = new Blob([activeFile.content], { type: mimeTypes[activeFile.fileType] || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setFiles(prev => prev.map(file =>
      file.id === activeFileId
        ? { ...file, isUnsaved: false }
        : file
    ));

    showNotification('success', 'File saved successfully');
  }, [activeFile, activeFileId]);

  const closeFile = useCallback((fileId: string) => {
    const fileToClose = files.find(f => f.id === fileId);
    if (fileToClose?.isUnsaved) {
      // In a full implementation, show a confirmation dialog
      if (!window.confirm('You have unsaved changes. Are you sure you want to close this file?')) {
        return;
      }
    }

    setFiles(prev => prev.filter(file => file.id !== fileId));
    if (activeFileId === fileId) {
      const remainingFiles = files.filter(file => file.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
    showNotification('info', 'File closed');
  }, [activeFileId, files]);

  // Text operations
  const undo = useCallback(() => {
    if (undoStack.length === 0 || !activeFile) return;

    const previousContent = undoStack[undoStack.length - 1];
    setRedoStack(prev => [activeFile.content, ...prev]);
    setUndoStack(prev => prev.slice(0, -1));

    setFiles(prev => prev.map(file =>
      file.id === activeFileId
        ? { ...file, content: previousContent, isUnsaved: true }
        : file
    ));
  }, [undoStack, activeFile, activeFileId]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextContent = redoStack[0];
    if (activeFile) {
      setUndoStack(prev => [...prev, activeFile.content]);
    }
    setRedoStack(prev => prev.slice(1));

    setFiles(prev => prev.map(file =>
      file.id === activeFileId
        ? { ...file, content: nextContent, isUnsaved: true }
        : file
    ));
  }, [redoStack, activeFile, activeFileId]);

  const copyText = useCallback(() => {
    if (textareaRef.current) {
      const selectedText = textareaRef.current.value.substring(
        textareaRef.current.selectionStart,
        textareaRef.current.selectionEnd
      );
      if (selectedText) {
        navigator.clipboard.writeText(selectedText);
        showNotification('success', 'Text copied to clipboard');
      }
    }
  }, []);

  const cutText = useCallback(() => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selectedText = textareaRef.current.value.substring(start, end);

      if (selectedText) {
        navigator.clipboard.writeText(selectedText);
        const newContent = textareaRef.current.value.substring(0, start) +
          textareaRef.current.value.substring(end);
        updateFileContent(newContent);
        showNotification('success', 'Text cut to clipboard');
      }
    }
  }, [updateFileContent]);

  const pasteText = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (textareaRef.current && activeFile) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const newContent = activeFile.content.substring(0, start) +
          text +
          activeFile.content.substring(end);
        updateFileContent(newContent);
        showNotification('success', 'Text pasted from clipboard');
      }
    } catch (err) {
      showNotification('error', 'Failed to paste from clipboard');
    }
  }, [activeFile, updateFileContent]);

  const selectAll = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.select();
      showNotification('info', 'All text selected');
    }
  }, []);

  // Find and replace functionality
  const performFind = useCallback(() => {
    if (!activeFile || !findReplace.findText) return;

    try {
      const flags = findReplace.caseSensitive ? 'g' : 'gi';
      let pattern: RegExp;

      if (findReplace.useRegex) {
        pattern = new RegExp(findReplace.findText, flags);
      } else if (findReplace.wholeWord) {
        pattern = new RegExp(`\\b${findReplace.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, flags);
      } else {
        pattern = new RegExp(findReplace.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      }

      const matches: Array<{ start: number; end: number }> = [];
      let match;
      while ((match = pattern.exec(activeFile.content)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length });
      }

      setFindReplace(prev => ({
        ...prev,
        totalMatches: matches.length,
        currentMatch: matches.length > 0 ? 1 : 0,
        matchPositions: matches
      }));

      if (matches.length > 0 && textareaRef.current) {
        textareaRef.current.setSelectionRange(matches[0].start, matches[0].end);
        textareaRef.current.focus();

        // Scroll to the match
        const textarea = textareaRef.current;
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const scrollTop = Math.max(0, (matches[0].start / activeFile.content.length) * textarea.scrollHeight - textarea.clientHeight / 2);
        textarea.scrollTop = scrollTop;
      }

      // Add to search history
      if (findReplace.findText && !searchHistory.includes(findReplace.findText)) {
        setSearchHistory(prev => [findReplace.findText, ...prev].slice(0, 10));
      }
    } catch (error) {
      showNotification('error', 'Invalid search pattern');
    }
  }, [activeFile, findReplace, searchHistory]);

  const navigateMatch = useCallback((direction: 'next' | 'prev') => {
    if (findReplace.matchPositions.length === 0) return;

    const newIndex = direction === 'next'
      ? (findReplace.currentMatch % findReplace.totalMatches) + 1
      : findReplace.currentMatch - 1 < 1 ? findReplace.totalMatches : findReplace.currentMatch - 1;

    setFindReplace(prev => ({ ...prev, currentMatch: newIndex }));

    const match = findReplace.matchPositions[newIndex - 1];
    if (match && textareaRef.current) {
      textareaRef.current.setSelectionRange(match.start, match.end);
      textareaRef.current.focus();
    }
  }, [findReplace]);

  const replaceCurrent = useCallback(() => {
    if (!activeFile || !findReplace.findText || findReplace.matchPositions.length === 0) return;

    const match = findReplace.matchPositions[findReplace.currentMatch - 1];
    if (!match) return;

    const newContent = activeFile.content.substring(0, match.start) +
      findReplace.replaceText +
      activeFile.content.substring(match.end);
    updateFileContent(newContent);

    performFind();
    showNotification('success', 'Replaced occurrence');
  }, [activeFile, findReplace, updateFileContent, performFind]);

  const replaceAll = useCallback(() => {
    if (!activeFile || !findReplace.findText) return;

    try {
      const flags = findReplace.caseSensitive ? 'g' : 'gi';
      let pattern: RegExp;

      if (findReplace.useRegex) {
        pattern = new RegExp(findReplace.findText, flags);
      } else if (findReplace.wholeWord) {
        pattern = new RegExp(`\\b${findReplace.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, flags);
      } else {
        pattern = new RegExp(findReplace.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      }

      const replacedCount = (activeFile.content.match(pattern) || []).length;
      const newContent = activeFile.content.replace(pattern, findReplace.replaceText);
      updateFileContent(newContent);

      setFindReplace(prev => ({ ...prev, totalMatches: 0, currentMatch: 0, matchPositions: [] }));
      showNotification('success', `Replaced ${replacedCount} occurrence(s)`);
    } catch (error) {
      showNotification('error', 'Invalid search pattern');
    }
  }, [activeFile, findReplace, updateFileContent]);

  // Cursor position tracking
  const handleCursorChange = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length;
      const currentColumn = lines[lines.length - 1].length + 1;
      setCursorPosition({ line: currentLine, column: currentColumn });
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!editorSettings.autoSave || !activeFile?.isUnsaved) return;

    const interval = setInterval(() => {
      if (activeFile?.isUnsaved) {
        saveFile();
      }
    }, editorSettings.autoSaveInterval * 1000);

    return () => clearInterval(interval);
  }, [editorSettings.autoSave, editorSettings.autoSaveInterval, activeFile, saveFile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'n') {
        e.preventDefault();
        createNewFile();
      } else if (ctrl && e.key === 'o') {
        e.preventDefault();
        openFile();
      } else if (ctrl && e.key === 's') {
        e.preventDefault();
        saveFile();
      } else if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((ctrl && e.key === 'y') || (ctrl && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      } else if (ctrl && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(prev => !prev);
      } else if (ctrl && e.key === 'h') {
        e.preventDefault();
        setShowFindReplace(true);
      } else if (ctrl && e.key === 'a') {
        e.preventDefault();
        selectAll();
      } else if (e.key === 'Escape') {
        setShowFindReplace(false);
        setShowSettings(false);
        setContextMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewFile, openFile, saveFile, undo, redo, selectAll]);

  // Initialize with a default file
  useEffect(() => {
    if (files.length === 0) {
      createNewFile();
    }
  }, [files.length, createNewFile]);

  // Update file stats when content changes
  useEffect(() => {
    if (activeFile) {
      setFiles(prev => prev.map(file =>
        file.id === activeFileId
          ? {
            ...file,
            wordCount: file.content.trim() ? file.content.trim().split(/\s+/).length : 0,
            charCount: file.content.length
          }
          : file
      ));
    }
  }, [activeFile?.content, activeFileId]);

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getFileIcon = (fileType: string, size: number = 20) => {
    const props = { size, weight: 'fill' as const };
    switch (fileType) {
      case 'md': return <FileTextIcon {...props} className="text-blue-400" />;
      case 'js': return <FileJsIcon {...props} className="text-yellow-400" />;
      case 'ts': return <CodeIcon {...props} className="text-blue-500" />;
      case 'css': return <FileCssIcon {...props} className="text-blue-300" />;
      case 'html': return <FileHtmlIcon {...props} className="text-orange-400" />;
      case 'json': return <FileJsxIcon {...props} className="text-yellow-500" />;
      case 'py': return <FilePyIcon {...props} className="text-blue-400" />;
      case 'xml': return <CodeIcon {...props} className="text-orange-500" />;
      case 'yaml': return <CodeIcon {...props} className="text-red-400" />;
      case 'sql': return <CodeIcon {...props} className="text-purple-400" />;
      default: return <FileTxt {...props} className="text-gray-400" />;
    }
  };

  const getSyntaxHighlight = () => {
    if (!activeFile) return '';

    const baseClass = "w-full h-full resize-none outline-none p-4 font-mono leading-relaxed transition-colors duration-200";
    const themeClass = theme === 'dark'
      ? 'bg-gray-900 text-gray-100 placeholder-gray-600 selection:bg-blue-500/30'
      : 'bg-white text-gray-900 placeholder-gray-400 selection:bg-blue-200';

    return `${baseClass} ${themeClass}`;
  };

  const getLineCount = () => {
    if (!activeFile) return 1;
    return activeFile.content.split('\n').length;
  };

  const getMiniMapContent = () => {
    if (!activeFile) return '';
    return activeFile.content.split('\n').map(() => '•').join('\n');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
          <div className={`flex items-center space-x-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm border ${notification.type === 'success'
              ? 'bg-green-500/95 text-white border-green-400'
              : notification.type === 'error'
                ? 'bg-red-500/95 text-white border-red-400'
                : notification.type === 'warning'
                  ? 'bg-yellow-500/95 text-white border-yellow-400'
                  : 'bg-blue-500/95 text-white border-blue-400'
            }`}>
            {notification.type === 'success' && <CheckIcon size={20} weight="bold" />}
            {notification.type === 'error' && <WarningIcon size={20} weight="bold" />}
            {notification.type === 'warning' && <BellRingingIcon size={20} weight="bold" />}
            {notification.type === 'info' && <InfoIcon size={20} weight="bold" />}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XIcon size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Menu Bar */}
      <header className={`border-b backdrop-blur-xl transition-colors duration-200 ${theme === 'dark'
          ? 'bg-gray-900/95 border-gray-700/50'
          : 'bg-white/95 border-gray-200/50'
        }`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: File Operations */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => createNewFile()}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              title="New File (Ctrl+N)"
            >
              <PlusIcon size={18} weight="bold" />
              <span className="text-sm font-medium hidden sm:inline">New</span>
            </button>

            <button
              onClick={openFile}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              title="Open File (Ctrl+O)"
            >
              <FolderOpenIcon size={18} weight="bold" />
              <span className="text-sm font-medium hidden sm:inline">Open</span>
            </button>

            <button
              onClick={saveFile}
              disabled={!activeFile}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              title="Save File (Ctrl+S)"
            >
              <FloppyDiskIcon size={18} weight="bold" />
              <span className="text-sm font-medium hidden sm:inline">Save</span>
            </button>

            <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />

            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              title="Undo (Ctrl+Z)"
            >
              <ArrowCounterClockwiseIcon size={18} weight="bold" />
            </button>

            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              title="Redo (Ctrl+Y)"
            >
              <ArrowClockwiseIcon size={18} weight="bold" />
            </button>
          </div>

          {/* Center: Edit Operations */}
          <div className="flex items-center space-x-1">
            <button
              onClick={copyText}
              className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              title="Copy (Ctrl+C)"
            >
              <CopySimpleIcon size={18} weight="bold" />
            </button>

            <button
              onClick={cutText}
              className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              title="Cut (Ctrl+X)"
            >
              <ScissorsIcon size={18} weight="bold" />
            </button>

            <button
              onClick={pasteText}
              className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              title="Paste (Ctrl+V)"
            >
              <ClipboardTextIcon size={18} weight="bold" />
            </button>

            <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />

            <button
              onClick={() => setShowFindReplace(!showFindReplace)}
              className={`p-2 rounded-lg transition-all duration-200 ${showFindReplace
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              title="Find & Replace (Ctrl+F)"
            >
              <MagnifyingGlassIcon size={18} weight="bold" />
            </button>
          </div>

          {/* Right: View Operations */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setEditorSettings(prev => ({ ...prev, fontSize: Math.max(8, prev.fontSize - 2) }))}
              className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              title="Decrease Font Size"
            >
              <MinusIcon size={18} weight="bold" />
            </button>

            <span className="text-sm min-w-[3rem] text-center font-medium tabular-nums">
              {editorSettings.fontSize}px
            </span>

            <button
              onClick={() => setEditorSettings(prev => ({ ...prev, fontSize: Math.min(32, prev.fontSize + 2) }))}
              className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              title="Increase Font Size"
            >
              <PlusIcon size={18} weight="bold" />
            </button>

            <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-400 hover:text-yellow-400'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
                }`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <SunIcon size={18} weight="bold" /> : <MoonIcon size={18} weight="bold" />}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-all duration-200 ${showSettings
                  ? theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              title="Settings"
            >
              <GearIcon size={18} weight="bold" />
            </button>

            <button
              onClick={() => setShowShortcuts(true)}
              className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                  ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              title="Keyboard Shortcuts"
            >
              <KeyboardIcon size={18} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* File Tabs */}
      {files.length > 0 && (
        <div className={`border-b overflow-x-auto scrollbar-thin ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50 border-gray-200/50'
          }`}>
          <div className="flex items-center">
            {files.map((file) => (
              <div
                key={file.id}
                className={`group flex items-center space-x-2 px-4 py-2.5 border-r cursor-pointer transition-all duration-200 min-w-[180px] ${activeFileId === file.id
                    ? theme === 'dark'
                      ? 'bg-gray-900 border-gray-600 text-white shadow-lg'
                      : 'bg-white border-gray-300 text-gray-900 shadow-sm'
                    : theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                      : 'bg-gray-100/50 border-gray-200/50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                onClick={() => setActiveFileId(file.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, fileId: file.id });
                }}
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file.fileType, 16)}
                </div>
                <span className="flex-1 truncate text-sm font-medium">
                  {file.name}
                </span>
                <div className="flex items-center space-x-1">
                  {file.isUnsaved && (
                    <span className="w-2 h-2 rounded-full bg-orange-500" title="Unsaved changes" />
                  )}
                  {file.isFavorite && (
                    <StarIcon size={12} weight="fill" className="text-yellow-500 flex-shrink-0" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(file.id);
                    }}
                    className={`p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      }`}
                  >
                    <XIcon size={14} weight="bold" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => createNewFile()}
              className={`p-2.5 rounded-lg transition-all duration-200 flex-shrink-0 ${theme === 'dark'
                  ? 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <PlusIcon size={18} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Find & Replace Panel */}
      {showFindReplace && (
        <div className={`border-b backdrop-blur-sm p-4 animate-in slide-in-from-top duration-200 ${theme === 'dark' ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'
          }`}>
          <div className="max-w-5xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MagnifyingGlassIcon size={20} className="text-blue-500" weight="bold" />
                <h3 className="font-semibold">Find & Replace</h3>
              </div>
              <button
                onClick={() => setShowFindReplace(false)}
                className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Find Section */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Find..."
                    value={findReplace.findText}
                    onChange={(e) => setFindReplace(prev => ({ ...prev, findText: e.target.value }))}
                    onFocus={() => setShowSearchHistory(true)}
                    onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') performFind();
                      else if (e.key === 'Escape') setShowSearchHistory(false);
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 ${theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                  />
                  <MagnifyingGlassIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                  {showSearchHistory && searchHistory.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-lg z-10 overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}>
                      {searchHistory.map((item, index) => (
                        <button
                          key={index}
                          onMouseDown={() => setFindReplace(prev => ({ ...prev, findText: item }))}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={findReplace.caseSensitive}
                      onChange={(e) => setFindReplace(prev => ({ ...prev, caseSensitive: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-sm">Aa</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={findReplace.wholeWord}
                      onChange={(e) => setFindReplace(prev => ({ ...prev, wholeWord: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-sm">Whole Word</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={findReplace.useRegex}
                      onChange={(e) => setFindReplace(prev => ({ ...prev, useRegex: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-sm">Regex</span>
                  </label>

                  {findReplace.totalMatches > 0 && (
                    <span className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      {findReplace.currentMatch} of {findReplace.totalMatches}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={performFind}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Find
                  </button>
                  <button
                    onClick={() => navigateMatch('prev')}
                    disabled={findReplace.totalMatches === 0}
                    className="p-2 bg-blue-600/10 text-blue-600 rounded-xl hover:bg-blue-600/20 transition-colors disabled:opacity-50"
                  >
                    <CaretLeftIcon size={20} weight="bold" />
                  </button>
                  <button
                    onClick={() => navigateMatch('next')}
                    disabled={findReplace.totalMatches === 0}
                    className="p-2 bg-blue-600/10 text-blue-600 rounded-xl hover:bg-blue-600/20 transition-colors disabled:opacity-50"
                  >
                    <CaretRightIcon size={20} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Replace Section */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Replace with..."
                  value={findReplace.replaceText}
                  onChange={(e) => setFindReplace(prev => ({ ...prev, replaceText: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && replaceCurrent()}
                  className={`w-full px-4 py-2.5 rounded-xl border-2 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 ${theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />

                <div className="flex space-x-2">
                  <button
                    onClick={replaceCurrent}
                    disabled={findReplace.totalMatches === 0}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    Replace
                  </button>
                  <button
                    onClick={replaceAll}
                    disabled={!findReplace.findText}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
                  >
                    Replace All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className={`border-b p-6 animate-in slide-in-from-top duration-200 ${theme === 'dark' ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white/95 border-gray-200/50'
          }`}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Editor Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <XIcon size={20} weight="bold" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Appearance */}
              <div className="space-y-4">
                <h4 className="flex items-center space-x-2 font-semibold">
                  <PaintBrushIcon size={20} weight="bold" className="text-purple-500" />
                  <span>Appearance</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Font Family</label>
                    <select
                      value={editorSettings.fontFamily}
                      onChange={(e) => setEditorSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-xl border-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all ${theme === 'dark'
                          ? 'bg-gray-700/50 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                    >
                      <option value="'JetBrains Mono', 'Fira Code', monospace">JetBrains Mono</option>
                      <option value="'Fira Code', monospace">Fira Code</option>
                      <option value="'Source Code Pro', monospace">Source Code Pro</option>
                      <option value="'Cascadia Code', monospace">Cascadia Code</option>
                      <option value="'Courier New', monospace">Courier New</option>
                      <option value="'Monaco', monospace">Monaco</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-3 rounded-xl border-2 transition-all ${theme === 'light'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <SunIcon size={24} className="mx-auto mb-1" weight="bold" />
                        <span className="text-sm">Light</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-3 rounded-xl border-2 transition-all ${theme === 'dark'
                            ? 'border-purple-500 bg-purple-900/20'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <MoonIcon size={24} className="mx-auto mb-1" weight="bold" />
                        <span className="text-sm">Dark</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="space-y-4">
                <h4 className="flex items-center space-x-2 font-semibold">
                  <PencilSimpleIcon size={20} weight="bold" className="text-blue-500" />
                  <span>Editor</span>
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorSettings.wordWrap}
                      onChange={(e) => setEditorSettings(prev => ({ ...prev, wordWrap: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-sm">Word Wrap</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorSettings.showLineNumbers}
                      onChange={(e) => setEditorSettings(prev => ({ ...prev, showLineNumbers: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-sm">Line Numbers</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorSettings.showMiniMap}
                      onChange={(e) => setEditorSettings(prev => ({ ...prev, showMiniMap: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-sm">Mini Map</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tab Size</label>
                    <select
                      value={editorSettings.tabSize}
                      onChange={(e) => setEditorSettings(prev => ({ ...prev, tabSize: Number(e.target.value) }))}
                      className={`w-full px-3 py-2 rounded-xl border-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${theme === 'dark'
                          ? 'bg-gray-700/50 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                    >
                      <option value="2">2 spaces</option>
                      <option value="4">4 spaces</option>
                      <option value="8">8 spaces</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Auto Save & More */}
              <div className="space-y-4">
                <h4 className="flex items-center space-x-2 font-semibold">
                  <ClockIcon size={20} weight="bold" className="text-green-500" />
                  <span>Automation</span>
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorSettings.autoSave}
                      onChange={(e) => setEditorSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                      className="w-4 h-4 rounded accent-green-500"
                    />
                    <span className="text-sm">Auto Save</span>
                  </label>

                  {editorSettings.autoSave && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Interval (seconds)</label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={editorSettings.autoSaveInterval}
                        onChange={(e) => setEditorSettings(prev => ({ ...prev, autoSaveInterval: Number(e.target.value) }))}
                        className={`w-full px-3 py-2 rounded-xl border-2 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all ${theme === 'dark'
                            ? 'bg-gray-700/50 border-gray-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                          }`}
                      />
                    </div>
                  )}

                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}>
                    <h5 className="font-medium mb-2">Document Stats</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Words:</span>
                        <span className="font-mono">{activeFile?.wordCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Characters:</span>
                        <span className="font-mono">{activeFile?.charCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Lines:</span>
                        <span className="font-mono">{getLineCount()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Line Numbers */}
        {editorSettings.showLineNumbers && activeFile && (
          <div className={`flex-shrink-0 border-r font-mono text-sm overflow-hidden ${theme === 'dark'
              ? 'bg-gray-900/50 border-gray-700/50 text-gray-500'
              : 'bg-gray-50 border-gray-200 text-gray-400'
            }`} style={{ fontSize: `${editorSettings.fontSize}px`, lineHeight: '1.5' }}>
            <div className="p-4 pr-2 text-right select-none" style={{ paddingLeft: '1rem' }}>
              {activeFile.content.split('\n').map((_, index) => (
                <div key={index} className={`${cursorPosition.line === index + 1 ? 'text-blue-500 font-bold' : ''}`}>
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor */}
        {activeFile ? (
          <textarea
            ref={textareaRef}
            value={activeFile.content}
            onChange={(e) => {
              updateFileContent(e.target.value);
              handleCursorChange();
            }}
            onKeyUp={handleCursorChange}
            onClick={handleCursorChange}
            className={getSyntaxHighlight()}
            style={{
              fontSize: `${editorSettings.fontSize}px`,
              fontFamily: editorSettings.fontFamily,
              whiteSpace: editorSettings.wordWrap ? 'pre-wrap' : 'pre',
              tabSize: editorSettings.tabSize,
              lineHeight: '1.5'
            }}
            placeholder="Start typing..."
            spellCheck={false}
            wrap={editorSettings.wordWrap ? 'soft' : 'off'}
          />
        ) : (
          <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-gray-500' : 'bg-white text-gray-400'
            }`}>
            <div className="text-center max-w-md px-6">
              <NotepadIcon size={64} className="mx-auto mb-6 opacity-50" weight="duotone" />
              <h3 className="text-2xl font-bold mb-2">Welcome to Notepad Pro</h3>
              <p className="mb-6 text-lg">Create a new file or open an existing one to start editing</p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => createNewFile()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg"
                >
                  <PlusIcon size={20} className="inline mr-2" weight="bold" />
                  New File
                </button>
                <button
                  onClick={openFile}
                  className={`px-6 py-3 border-2 rounded-xl transition-colors font-medium ${theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <FolderOpenIcon size={20} className="inline mr-2" weight="bold" />
                  Open File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mini Map */}
        {editorSettings.showMiniMap && activeFile && (
          <div className={`hidden lg:block w-20 flex-shrink-0 border-l overflow-hidden ${theme === 'dark' ? 'bg-gray-900/30 border-gray-700/50' : 'bg-gray-50 border-gray-200'
            }`}>
            <div className="p-2 text-xs opacity-50 whitespace-pre font-mono" style={{ fontSize: '2px', lineHeight: '3px' }}>
              {getMiniMapContent()}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <footer className={`border-t px-4 py-2 flex items-center justify-between text-sm backdrop-blur-xl ${theme === 'dark'
          ? 'bg-gray-900/95 border-gray-700/50 text-gray-400'
          : 'bg-white/95 border-gray-200/50 text-gray-600'
        }`}>
        <div className="flex items-center space-x-6">
          {activeFile && (
            <>
              <div className="flex items-center space-x-2">
                {getFileIcon(activeFile.fileType, 16)}
                <span className="font-medium">{activeFile.fileType.toUpperCase()}</span>
              </div>

              <div className="hidden sm:block">
                {activeFile.lastModified.toLocaleString()}
              </div>

              {activeFile.isUnsaved && (
                <div className="flex items-center space-x-1 text-orange-500">
                  <WarningIcon size={14} weight="bold" />
                  <span className="font-medium">Unsaved</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden sm:block">
            <span className="text-gray-500">Words:</span> {activeFile?.wordCount || 0}
          </div>
          <div className="hidden sm:block">
            <span className="text-gray-500">Chars:</span> {activeFile?.charCount || 0}
          </div>
          <div>
            <span className="text-gray-500">Ln:</span> {cursorPosition.line}, <span className="text-gray-500">Col:</span> {cursorPosition.column}
          </div>

          {undoStack.length > 0 && (
            <div className="hidden md:block">
              <span className="text-gray-500">Undo:</span> {undoStack.length}
            </div>
          )}
        </div>
      </footer>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`max-w-2xl w-full rounded-2xl shadow-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <KeyboardIcon size={24} weight="bold" className="text-blue-500" />
                <h3 className="text-xl font-bold">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <XIcon size={20} weight="bold" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { keys: 'Ctrl + N', description: 'New File' },
                  { keys: 'Ctrl + O', description: 'Open File' },
                  { keys: 'Ctrl + S', description: 'Save File' },
                  { keys: 'Ctrl + F', description: 'Find' },
                  { keys: 'Ctrl + H', description: 'Find & Replace' },
                  { keys: 'Ctrl + Z', description: 'Undo' },
                  { keys: 'Ctrl + Y', description: 'Redo' },
                  { keys: 'Ctrl + A', description: 'Select All' },
                  { keys: 'Ctrl + C', description: 'Copy' },
                  { keys: 'Ctrl + X', description: 'Cut' },
                  { keys: 'Ctrl + V', description: 'Paste' },
                  { keys: 'Escape', description: 'Close Panels' },
                ].map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-lg text-xs font-mono font-bold">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu for File Tabs */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-50 w-56 rounded-xl shadow-2xl border py-2 animate-in zoom-in-95 duration-150"
            style={{
              left: `${Math.min(contextMenu.x, window.innerWidth - 240)}px`,
              top: `${Math.min(contextMenu.y, window.innerHeight - 300)}px`,
              background: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
            }}
          >
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
              <FloppyDiskIcon size={18} />
              <span>Save</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
              <CopySimpleIcon size={18} />
              <span>Duplicate</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
              <PencilSimpleIcon size={18} />
              <span>Rename</span>
            </button>
            <div className="border-t my-1" />
            <button
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-500/20 text-red-500 transition-colors text-left"
              onClick={() => {
                closeFile(contextMenu.fileId);
                setContextMenu(null);
              }}
            >
              <TrashSimpleIcon size={18} />
              <span>Close</span>
            </button>
          </div>
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.js,.css,.html,.py,.xml,.yaml,.yml,.sql,.ts,.tsx,.jsx"
        onChange={handleFileOpen}
        className="hidden"
      />
    </div>
  );
};

export default NotepadApp;