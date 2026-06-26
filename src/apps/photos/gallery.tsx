import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  CameraIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
  ListBulletsIcon,
  HeartIcon,
  ShareNetworkIcon,
  TrashIcon,
  DownloadSimpleIcon,
  PlusIcon,
  XIcon,
  PencilSimpleIcon,
  ImagesIcon,
  CalendarBlankIcon,
  MapPinIcon,
  UploadSimpleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  FolderOpenIcon,
  InfoIcon,
  CheckIcon,
  WarningIcon,
  DotsThreeIcon,
  EyeIcon,
  SelectionAllIcon,
  SunIcon,
  MoonIcon,
  ClockCounterClockwiseIcon,
  FolderPlusIcon,
  UsersIcon,
  HeartStraightIcon,
  FolderSimpleIcon,
} from '@phosphor-icons/react';

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  name: string;
  date: Date;
  size: number;
  location?: string;
  tags: string[];
  isFavorite: boolean;
  album?: string;
  description?: string;
  resolution?: { width: number; height: number };
  format?: string;
  camera?: string;
  aperture?: string;
  exposure?: string;
  iso?: number;
}

interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhoto?: string;
  photoCount: number;
  createdDate: Date;
  lastModified: Date;
  color?: string;
  isShared?: boolean;
}

interface EditFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sepia: number;
  hue: number;
  opacity: number;
  vignette: number;
}

const PhotosApp: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentView, setCurrentView] = useState<'photos' | 'albums' | 'favorites' | 'recent'>('photos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editFilters, setEditFilters] = useState<EditFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    hue: 0,
    opacity: 100,
    vignette: 0
  });
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'favorites'>('date');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showNotifications, setShowNotifications] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; photoId: string } | null>(null);

  // Sample data initialization with more variety
  useEffect(() => {
    const sampleAlbums: Album[] = [
      {
        id: '1',
        name: 'Vacation 2024',
        description: 'Summer adventures around the world',
        photoCount: 15,
        createdDate: new Date('2024-06-15'),
        lastModified: new Date('2024-07-20'),
        coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
        color: 'blue',
        isShared: true
      },
      {
        id: '2',
        name: 'Family Memories',
        description: 'Precious moments with loved ones',
        photoCount: 28,
        createdDate: new Date('2024-03-10'),
        lastModified: new Date('2024-06-28'),
        coverPhoto: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=200&fit=crop',
        color: 'pink',
        isShared: false
      },
      {
        id: '3',
        name: 'Nature Photography',
        description: 'Capturing the beauty of nature',
        photoCount: 42,
        createdDate: new Date('2024-01-20'),
        lastModified: new Date('2024-07-15'),
        coverPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
        color: 'green',
        isShared: true
      },
      {
        id: '4',
        name: 'City Explorations',
        description: 'Urban adventures and street photography',
        photoCount: 20,
        createdDate: new Date('2024-05-01'),
        lastModified: new Date('2024-07-10'),
        coverPhoto: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=200&fit=crop',
        color: 'purple',
        isShared: false
      }
    ];

    const samplePhotos: Photo[] = [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        name: 'Mountain Sunset',
        date: new Date('2024-07-15'),
        size: 2048576,
        location: 'Rocky Mountains, CO',
        tags: ['nature', 'sunset', 'mountains'],
        isFavorite: true,
        album: 'Vacation 2024',
        description: 'Breathtaking sunset over the Rocky Mountains',
        resolution: { width: 1200, height: 800 },
        format: 'JPEG',
        camera: 'Sony A7III',
        aperture: 'f/2.8',
        exposure: '1/250',
        iso: 100
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
        name: 'Forest Path',
        date: new Date('2024-07-10'),
        size: 1536000,
        location: 'Yellowstone National Park',
        tags: ['nature', 'forest', 'hiking'],
        isFavorite: false,
        album: 'Nature Photography',
        description: 'Peaceful forest trail in Yellowstone',
        resolution: { width: 1200, height: 800 },
        format: 'JPEG',
        camera: 'Canon EOS R5',
        aperture: 'f/4.0',
        exposure: '1/125',
        iso: 200
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
        name: 'Happy Family',
        date: new Date('2024-06-20'),
        size: 1843200,
        location: 'Home',
        tags: ['family', 'portrait', 'happiness'],
        isFavorite: true,
        album: 'Family Memories',
        description: 'Beautiful family portrait session',
        resolution: { width: 1200, height: 800 },
        format: 'JPEG',
        camera: 'iPhone 14 Pro',
        aperture: 'f/1.78',
        exposure: '1/120',
        iso: 80
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
        name: 'Lake Reflection',
        date: new Date('2024-05-30'),
        size: 2304000,
        location: 'Lake Tahoe, CA',
        tags: ['nature', 'water', 'reflection'],
        isFavorite: false,
        album: 'Vacation 2024',
        description: 'Perfect mirror reflection on Lake Tahoe',
        resolution: { width: 1200, height: 800 },
        format: 'JPEG',
        camera: 'Nikon Z7',
        aperture: 'f/8.0',
        exposure: '1/500',
        iso: 64
      },
      {
        id: '5',
        url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
        name: 'Desert Dunes',
        date: new Date('2024-04-15'),
        size: 1920000,
        location: 'Sahara Desert',
        tags: ['desert', 'landscape', 'sand'],
        isFavorite: false,
        album: 'Nature Photography',
        description: 'Endless sand dunes in the Sahara',
        resolution: { width: 1200, height: 800 },
        format: 'JPEG',
        camera: 'Fujifilm X-T4',
        aperture: 'f/5.6',
        exposure: '1/1000',
        iso: 400
      },
      {
        id: '6',
        url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop',
        name: 'Ocean Waves',
        date: new Date('2024-03-25'),
        size: 2150400,
        location: 'Malibu Beach, CA',
        tags: ['ocean', 'waves', 'beach'],
        isFavorite: true,
        album: 'Vacation 2024',
        description: 'Dramatic ocean waves at sunset',
        resolution: { width: 1200, height: 800 },
        format: 'JPEG',
        camera: 'Sony A7III',
        aperture: 'f/11',
        exposure: '1/250',
        iso: 100
      },
      {
        id: '7',
        url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop',
        name: 'City Skyline',
        date: new Date('2024-08-01'),
        size: 1890000,
        location: 'New York City, NY',
        tags: ['city', 'skyline', 'urban'],
        isFavorite: false,
        album: 'City Explorations',
        description: 'Manhattan skyline at blue hour',
        resolution: { width: 1200, height: 800 },
        format: 'JPEG',
        camera: 'Canon EOS R5',
        aperture: 'f/8.0',
        exposure: '30s',
        iso: 100
      },
      {
        id: '8',
        url: 'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=1200&h=800&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=400&h=300&fit=crop',
        name: 'Coffee Art',
        date: new Date('2024-08-05'),
        size: 1200000,
        location: 'Local Coffee Shop',
        tags: ['coffee', 'art', 'lifestyle'],
        isFavorite: true,
        album: 'City Explorations',
        description: 'Beautiful latte art at local café',
        resolution: { width: 1200, height: 800 },
        format: 'JPEG',
        camera: 'iPhone 14 Pro',
        aperture: 'f/1.78',
        exposure: '1/60',
        iso: 125
      }
    ];

    setPhotos(samplePhotos);
    setAlbums(sampleAlbums);
  }, []);

  const filteredPhotos = photos.filter(photo => {
    if (currentView === 'favorites' && !photo.isFavorite) return false;
    if (currentView === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      if (photo.date < oneWeekAgo) return false;
    }
    if (filterTag !== 'all' && !photo.tags.includes(filterTag)) return false;
    if (searchQuery) {
      return photo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
             (photo.location && photo.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
             (photo.description && photo.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'favorites':
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      case 'date':
      default:
        return b.date.getTime() - a.date.getTime();
    }
  });

  const allTags = ['all', ...Array.from(new Set(photos.flatMap(photo => photo.tags)))];

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          const newPhoto: Photo = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            url: url,
            thumbnail: url,
            name: file.name.replace(/\.[^/.]+$/, ""),
            date: new Date(),
            size: file.size,
            tags: [],
            isFavorite: false,
            format: file.type.split('/')[1].toUpperCase(),
          };
          setPhotos(prev => [newPhoto, ...prev]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showNotification('success', 'Photos uploaded successfully');
  }, []);

  const toggleFavorite = useCallback((photoId: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, isFavorite: !photo.isFavorite } : photo
    ));
  }, []);

  const deletePhotos = useCallback(() => {
    if (selectedPhotos.size === 0) return;
    
    if (window.confirm(`Delete ${selectedPhotos.size} photo(s)? This action cannot be undone.`)) {
      setPhotos(prev => prev.filter(photo => !selectedPhotos.has(photo.id)));
      setSelectedPhotos(new Set());
      showNotification('success', `${selectedPhotos.size} photo(s) deleted`);
    }
  }, [selectedPhotos]);

  const selectAllPhotos = useCallback(() => {
    const allFilteredIds = new Set(filteredPhotos.map(p => p.id));
    setSelectedPhotos(allFilteredIds);
  }, [filteredPhotos]);

  const downloadPhoto = useCallback((photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', 'Photo downloaded');
  }, []);

  const openPhotoViewer = useCallback((photo: Photo) => {
    const index = filteredPhotos.findIndex(p => p.id === photo.id);
    setCurrentPhotoIndex(index);
    setSelectedPhoto(photo);
    setShowPhotoViewer(true);
    setZoomLevel(1);
    setShowInfo(false);
  }, [filteredPhotos]);

  const navigatePhoto = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentPhotoIndex - 1)
      : Math.min(filteredPhotos.length - 1, currentPhotoIndex + 1);
    
    setCurrentPhotoIndex(newIndex);
    setSelectedPhoto(filteredPhotos[newIndex]);
    setZoomLevel(1);
  }, [currentPhotoIndex, filteredPhotos]);

  const applyFilters = useCallback(() => {
    if (!selectedPhoto) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        const filterString = `
          brightness(${editFilters.brightness}%) 
          contrast(${editFilters.contrast}%) 
          saturate(${editFilters.saturation}%) 
          blur(${editFilters.blur}px) 
          sepia(${editFilters.sepia}%) 
          hue-rotate(${editFilters.hue}deg)
          opacity(${editFilters.opacity}%)
        `;
        ctx.filter = filterString;
        ctx.drawImage(img, 0, 0);
        
        // Apply vignette effect
        if (editFilters.vignette > 0) {
          const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width * 0.7
          );
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, `rgba(0,0,0,${editFilters.vignette / 100})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        const editedUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPhotos(prev => prev.map(photo =>
          photo.id === selectedPhoto.id 
            ? { ...photo, url: editedUrl, thumbnail: editedUrl, size: Math.round(editedUrl.length * 0.75) }
            : photo
        ));
        setSelectedPhoto(prev => prev ? { ...prev, url: editedUrl } : null);
      }
    };
    
    img.src = selectedPhoto.url;
    setShowEditModal(false);
    resetFilters();
    showNotification('success', 'Filters applied successfully');
  }, [selectedPhoto, editFilters]);

  const resetFilters = useCallback(() => {
    setEditFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      hue: 0,
      opacity: 100,
      vignette: 0
    });
  }, []);

  const createAlbum = useCallback(() => {
    if (!newAlbumName.trim()) return;
    
    const newAlbum: Album = {
      id: Date.now().toString(),
      name: newAlbumName.trim(),
      description: newAlbumDescription.trim(),
      photoCount: selectedPhotos.size,
      createdDate: new Date(),
      lastModified: new Date(),
      color: ['blue', 'green', 'purple', 'pink', 'orange'][Math.floor(Math.random() * 5)],
      isShared: false
    };
    
    // Add selected photos to the album
    if (selectedPhotos.size > 0) {
      setPhotos(prev => prev.map(photo =>
        selectedPhotos.has(photo.id)
          ? { ...photo, album: newAlbum.name }
          : photo
      ));
    }
    
    setAlbums(prev => [newAlbum, ...prev]);
    setNewAlbumName('');
    setNewAlbumDescription('');
    setShowCreateAlbum(false);
    setSelectedPhotos(new Set());
    showNotification('success', 'Album created successfully');
  }, [newAlbumName, newAlbumDescription, selectedPhotos]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlbumColor = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      case 'pink': return 'bg-pink-500';
      case 'orange': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
          <div className={`flex items-center space-x-3 px-5 py-3 rounded-xl shadow-2xl border ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white border-green-400' 
              : notification.type === 'error'
                ? 'bg-red-500 text-white border-red-400'
                : 'bg-blue-500 text-white border-blue-400'
          }`}>
            {notification.type === 'success' && <CheckIcon size={20} weight="bold" />}
            {notification.type === 'error' && <WarningIcon size={20} weight="bold" />}
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

      {/* Header */}
      <header className={`backdrop-blur-xl border-b ${
        theme === 'dark' 
          ? 'bg-gray-800/95 border-gray-700/50' 
          : 'bg-white/95 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600`}>
                <CameraIcon size={24} className="text-white" weight="fill" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Photos
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { key: 'photos', label: 'Photos', icon: ImagesIcon },
                { key: 'albums', label: 'Albums', icon: FolderOpenIcon },
                { key: 'favorites', label: 'Favorites', icon: HeartStraightIcon },
                { key: 'recent', label: 'Recent', icon: ClockCounterClockwiseIcon }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentView(key as any);
                    setSelectedPhotos(new Set());
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    currentView === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} weight={currentView === key ? 'fill' : 'regular'} />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-xl transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <UploadSimpleIcon size={18} weight="bold" />
                <span className="hidden sm:inline font-medium">Upload</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* Toolbar */}
      {currentView !== 'albums' && (
        <div className={`border-b backdrop-blur-sm ${
          theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-3 ml-6">
                {/* Tag Filter */}
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className={`px-3 py-2 rounded-xl border-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag === 'all' ? 'All Tags' : tag}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`px-3 py-2 rounded-xl border-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                  <option value="favorites">Sort by Favorites</option>
                </select>

                {/* View Mode */}
                <div className={`flex border-2 rounded-xl overflow-hidden ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <SquaresFourIcon size={18} weight={viewMode === 'grid' ? 'fill' : 'regular'} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ListBulletsIcon size={18} weight={viewMode === 'list' ? 'fill' : 'regular'} />
                  </button>
                </div>

                {/* Selection Controls */}
                <button
                  onClick={selectAllPhotos}
                  className={`p-2 rounded-xl transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Select All"
                >
                  <SelectionAllIcon size={18} />
                </button>

                {selectedPhotos.size > 0 && (
                  <>
                    <button
                      onClick={() => setShowCreateAlbum(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <FolderPlusIcon size={18} />
                      <span className="hidden sm:inline">Add to Album</span>
                    </button>
                    
                    <button
                      onClick={deletePhotos}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      <TrashIcon size={18} />
                      <span className="hidden sm:inline">Delete ({selectedPhotos.size})</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'albums' ? (
          /* Albums View */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Albums</h2>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {albums.length} albums
                </p>
              </div>
              <button
                onClick={() => setShowCreateAlbum(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon size={20} weight="bold" />
                <span className="font-medium">New Album</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="aspect-video relative overflow-hidden">
                    {album.coverPhoto ? (
                      <img 
                        src={album.coverPhoto} 
                        alt={album.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${getAlbumColor(album.color)}`}>
                        <FolderSimpleIcon size={48} className="text-white/50" weight="fill" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-bold text-xl mb-1">{album.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm opacity-90">{album.photoCount} photos</p>
                        {album.isShared && (
                          <UsersIcon size={16} className="opacity-75" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {album.description && (
                      <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {album.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CalendarBlankIcon size={12} />
                        <span>{formatDate(album.createdDate)}</span>
                      </div>
                      <span>Modified {formatDate(album.lastModified)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create Album Card */}
              <button
                onClick={() => setShowCreateAlbum(true)}
                className={`flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 hover:border-blue-500 hover:shadow-lg ${
                  theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <PlusIcon size={48} className={`mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create Album
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Photos View */
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {currentView === 'favorites' ? 'Favorite Photos' : currentView === 'recent' ? 'Recent Photos' : 'All Photos'}
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}
                {selectedPhotos.size > 0 && ` • ${selectedPhotos.size} selected`}
              </p>
            </div>

            {filteredPhotos.length === 0 ? (
              <div className={`text-center py-20 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
              }`}>
                <ImagesIcon size={64} className={`mx-auto mb-6 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className="text-xl font-semibold mb-2">
                  {currentView === 'favorites' ? 'No favorite photos yet' : 'No photos found'}
                </h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentView === 'favorites' 
                    ? 'Mark photos as favorites to see them here' 
                    : searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Upload some photos to get started'
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <UploadSimpleIcon size={20} weight="bold" />
                    <span>Upload Photos</span>
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`group relative cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                      selectedPhotos.has(photo.id) ? 'ring-4 ring-blue-500 scale-105' : ''
                    }`}
                    onClick={() => openPhotoViewer(photo)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ x: e.clientX, y: e.clientY, photoId: photo.id });
                    }}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={photo.thumbnail}
                        alt={photo.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Selection Check */}
                      <div className={`absolute top-3 right-3 transition-all duration-200 ${
                        selectedPhotos.has(photo.id) ? 'scale-100' : 'scale-0 group-hover:scale-100'
                      }`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSelected = new Set(selectedPhotos);
                            if (newSelected.has(photo.id)) {
                              newSelected.delete(photo.id);
                            } else {
                              newSelected.add(photo.id);
                            }
                            setSelectedPhotos(newSelected);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            selectedPhotos.has(photo.id)
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/80 text-gray-700 hover:bg-white'
                          }`}
                        >
                          <CheckIcon size={18} weight="bold" />
                        </button>
                      </div>

                      {/* Photo Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-medium text-sm truncate">{photo.name}</p>
                        <p className="text-xs opacity-75">{formatDate(photo.date)}</p>
                      </div>

                      {/* Favorite Badge */}
                      {photo.isFavorite && (
                        <div className="absolute top-3 left-3">
                          <HeartIcon size={20} weight="fill" className="text-red-500 drop-shadow-lg" />
                        </div>
                      )}

                      {/* Album Badge */}
                      {photo.album && (
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
                            {photo.album}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                      selectedPhotos.has(photo.id)
                        ? theme === 'dark' ? 'bg-blue-500/20 ring-2 ring-blue-500' : 'bg-blue-50 ring-2 ring-blue-500'
                        : theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
                    } shadow-md hover:shadow-lg`}
                    onClick={() => openPhotoViewer(photo)}
                  >
                    {/* Selection Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newSelected = new Set(selectedPhotos);
                        if (newSelected.has(photo.id)) {
                          newSelected.delete(photo.id);
                        } else {
                          newSelected.add(photo.id);
                        }
                        setSelectedPhotos(newSelected);
                      }}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        selectedPhotos.has(photo.id)
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                      }`}
                    >
                      {selectedPhotos.has(photo.id) && <CheckIcon size={14} weight="bold" />}
                    </button>

                    {/* Thumbnail */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={photo.thumbnail}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{photo.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm">
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatDate(photo.date)}
                        </span>
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatFileSize(photo.size)}
                        </span>
                        {photo.resolution && (
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {photo.resolution.width}×{photo.resolution.height}
                          </span>
                        )}
                        {photo.location && (
                          <div className="flex items-center space-x-1">
                            <MapPinIcon size={12} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {photo.location}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {photo.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(photo.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          photo.isFavorite
                            ? 'text-red-500 hover:bg-red-500/10'
                            : theme === 'dark' ? 'text-gray-400 hover:text-red-500' : 'text-gray-600 hover:text-red-500'
                        }`}
                      >
                        <HeartIcon size={20} weight={photo.isFavorite ? 'fill' : 'regular'} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPhoto(photo);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <DownloadSimpleIcon size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenu({ x: e.clientX, y: e.clientY, photoId: photo.id });
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <DotsThreeIcon size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      {showPhotoViewer && selectedPhoto && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-black'
        }`}>
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPhotoViewer(false)}
                className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <XIcon size={24} />
              </button>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
                <span className="font-medium">{currentPhotoIndex + 1}</span>
                <span className="text-gray-300"> / {filteredPhotos.length}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-xl transition-colors backdrop-blur-sm ${
                  showInfo ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <InfoIcon size={20} />
              </button>
              
              <button
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.5))}
                className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <PlusCircleIcon size={20} />
              </button>
              
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.5))}
                className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <MinusCircleIcon size={20} />
              </button>
              
              <button
                onClick={() => {
                  setShowEditModal(true);
                }}
                className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <PencilSimpleIcon size={20} />
              </button>
              
              <button
                onClick={() => toggleFavorite(selectedPhoto.id)}
                className={`p-2 rounded-xl transition-colors backdrop-blur-sm ${
                  selectedPhoto.isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <HeartIcon size={20} weight={selectedPhoto.isFavorite ? 'fill' : 'regular'} />
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
          {currentPhotoIndex > 0 && (
            <button
              onClick={() => navigatePhoto('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm z-10"
            >
              <CaretLeftIcon size={24} />
            </button>
          )}
          {currentPhotoIndex < filteredPhotos.length - 1 && (
            <button
              onClick={() => navigatePhoto('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm z-10"
            >
              <CaretRightIcon size={24} />
            </button>
          )}

          {/* Photo Container */}
          <div className="relative max-w-full max-h-full flex items-center justify-center p-20">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>

          {/* Photo Info Panel */}
          {showInfo && selectedPhoto && (
            <div className="absolute right-4 top-20 bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-80 text-white border border-white/20">
              <h3 className="text-xl font-bold mb-4">{selectedPhoto.name}</h3>
              
              <div className="space-y-3">
                {selectedPhoto.description && (
                  <p className="text-sm text-gray-300">{selectedPhoto.description}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Date</span>
                    <span>{formatDate(selectedPhoto.date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Size</span>
                    <span>{formatFileSize(selectedPhoto.size)}</span>
                  </div>
                  {selectedPhoto.resolution && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Resolution</span>
                      <span>{selectedPhoto.resolution.width}×{selectedPhoto.resolution.height}</span>
                    </div>
                  )}
                  {selectedPhoto.format && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Format</span>
                      <span>{selectedPhoto.format}</span>
                    </div>
                  )}
                  {selectedPhoto.location && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Location</span>
                      <span>{selectedPhoto.location}</span>
                    </div>
                  )}
                  {selectedPhoto.camera && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Camera</span>
                      <span>{selectedPhoto.camera}</span>
                    </div>
                  )}
                  {selectedPhoto.aperture && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Aperture</span>
                      <span>{selectedPhoto.aperture}</span>
                    </div>
                  )}
                  {selectedPhoto.exposure && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Exposure</span>
                      <span>{selectedPhoto.exposure}</span>
                    </div>
                  )}
                  {selectedPhoto.iso && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">ISO</span>
                      <span>{selectedPhoto.iso}</span>
                    </div>
                  )}
                </div>
                
                {selectedPhoto.tags.length > 0 && (
                  <div>
                    <span className="text-gray-400 text-sm block mb-2">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedPhoto.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-6xl w-full max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex h-full">
              {/* Photo Preview */}
              <div className="flex-1 bg-gray-900 flex items-center justify-center p-4 relative">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.name}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    filter: `
                      brightness(${editFilters.brightness}%) 
                      contrast(${editFilters.contrast}%) 
                      saturate(${editFilters.saturation}%) 
                      blur(${editFilters.blur}px) 
                      sepia(${editFilters.sepia}%)
                      hue-rotate(${editFilters.hue}deg)
                      opacity(${editFilters.opacity}%)
                    `
                  }}
                />
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Edit Controls */}
              <div className={`w-96 p-6 overflow-y-auto ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <PencilSimpleIcon size={24} className="text-blue-500" weight="fill" />
                    <h3 className="text-xl font-bold">Edit Photo</h3>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className={`p-2 rounded-xl transition-colors ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <XIcon size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Brightness */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Brightness</label>
                      <span className="text-sm text-gray-500">{editFilters.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={editFilters.brightness}
                      onChange={(e) => setEditFilters(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Contrast</label>
                      <span className="text-sm text-gray-500">{editFilters.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={editFilters.contrast}
                      onChange={(e) => setEditFilters(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Saturation</label>
                      <span className="text-sm text-gray-500">{editFilters.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={editFilters.saturation}
                      onChange={(e) => setEditFilters(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>

                  {/* Hue */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Hue</label>
                      <span className="text-sm text-gray-500">{editFilters.hue}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={editFilters.hue}
                      onChange={(e) => setEditFilters(prev => ({ ...prev, hue: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>

                  {/* Blur */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Blur</label>
                      <span className="text-sm text-gray-500">{editFilters.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={editFilters.blur}
                      onChange={(e) => setEditFilters(prev => ({ ...prev, blur: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>

                  {/* Sepia */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Sepia</label>
                      <span className="text-sm text-gray-500">{editFilters.sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editFilters.sepia}
                      onChange={(e) => setEditFilters(prev => ({ ...prev, sepia: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>

                  {/* Opacity */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Opacity</label>
                      <span className="text-sm text-gray-500">{editFilters.opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editFilters.opacity}
                      onChange={(e) => setEditFilters(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>

                  {/* Vignette */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Vignette</label>
                      <span className="text-sm text-gray-500">{editFilters.vignette}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editFilters.vignette}
                      onChange={(e) => setEditFilters(prev => ({ ...prev, vignette: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                </div>

                <button
                  onClick={resetFilters}
                  className="w-full mt-6 px-4 py-3 border-2 rounded-xl transition-colors font-medium"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      {showCreateAlbum && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 shadow-2xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FolderPlusIcon size={24} className="text-green-500" weight="fill" />
                <h3 className="text-xl font-bold">Create Album</h3>
              </div>
              <button
                onClick={() => setShowCreateAlbum(false)}
                className={`p-2 rounded-xl transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Album Name</label>
                <input
                  type="text"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="Enter album name"
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  value={newAlbumDescription}
                  onChange={(e) => setNewAlbumDescription(e.target.value)}
                  placeholder="Album description..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {selectedPhotos.size > 0 && (
                <div className={`p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'
                }`}>
                  <p className="text-sm">
                    <span className="font-medium">{selectedPhotos.size}</span> photo(s) will be added to this album
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateAlbum(false)}
                className={`flex-1 px-4 py-3 border-2 rounded-xl transition-colors font-medium ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={createAlbum}
                disabled={!newAlbumName.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Album
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
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
              <EyeIcon size={18} />
              <span>View</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
              <PencilSimpleIcon size={18} />
              <span>Edit</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
              <HeartIcon size={18} />
              <span>Toggle Favorite</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
              <DownloadSimpleIcon size={18} />
              <span>Download</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
              <ShareNetworkIcon size={18} />
              <span>Share</span>
            </button>
            <div className="border-t my-1" />
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-500/20 text-red-500 transition-colors text-left">
              <TrashIcon size={18} />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PhotosApp;