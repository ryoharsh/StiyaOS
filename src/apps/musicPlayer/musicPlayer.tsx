import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerX,
  Repeat,
  Heart,
  DotsThree,
  MusicNotes,
  MagnifyingGlass,
  Plus,
  X,
  UploadSimple,
  Clock,
  Headphones,
  Moon,
  Sun,
  Microphone,
  Trash,
  FolderPlus,
  PlayCircle,
  Queue,
  MusicNote,
  House,
  Compass,
  HeartStraight,
  ListBullets,
  ShuffleAngular,
  RepeatOnce,
  Playlist,
  SoundcloudLogo,
  Equalizer,
  Check,
  Warning,
  Info,
  ArrowsClockwise,
  SidebarSimple,
} from '@phosphor-icons/react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  genre: string;
  year: number;
  coverArt: string;
  audioUrl: string;
  isFavorite: boolean;
  playCount: number;
  dateAdded: Date;
  lyrics?: string;
  bpm?: number;
  mood?: string;
  bitrate?: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: string[];
  coverArt: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
}

interface EqualizerSettings {
  bass: number;
  mid: number;
  treble: number;
  surround: boolean;
}

const MusicPlayerApp: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'library' | 'playlists' | 'favorites' | 'recent' | 'explore'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [visualizer, setVisualizer] = useState<number[]>(Array(64).fill(0));
  const [showLyrics, setShowLyrics] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'album' | 'duration' | 'dateAdded' | 'playCount'>('title');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [eqSettings, setEqSettings] = useState<EqualizerSettings>({
    bass: 50,
    mid: 50,
    treble: 50,
    surround: false
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [showQueue, setShowQueue] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; songId: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [colorScheme, setColorScheme] = useState<string>('purple');
  const [audioStats, setAudioStats] = useState({
    totalSongs: 0,
    totalDuration: 0,
    totalPlays: 0,
    favoriteCount: 0
  });

  // Sample songs data with more variety
  useEffect(() => {
    const sampleSongs: Song[] = [
      {
        id: '1',
        title: 'Chill Vibes',
        artist: 'Lo-Fi Beats',
        album: 'Relaxing Sounds',
        duration: 180,
        genre: 'Lo-Fi',
        year: 2023,
        coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        isFavorite: true,
        playCount: 45,
        dateAdded: new Date('2024-01-15'),
        bpm: 85,
        mood: 'Relaxed',
        bitrate: '320kbps'
      },
      {
        id: '2',
        title: 'Midnight Jazz',
        artist: 'Smooth Collective',
        album: 'Night Sessions',
        duration: 240,
        genre: 'Jazz',
        year: 2023,
        coverArt: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        isFavorite: false,
        playCount: 23,
        dateAdded: new Date('2024-02-10'),
        bpm: 120,
        mood: 'Sophisticated',
        bitrate: '256kbps'
      },
      {
        id: '3',
        title: 'Electric Dreams',
        artist: 'Synth Wave',
        album: 'Neon Nights',
        duration: 210,
        genre: 'Electronic',
        year: 2024,
        coverArt: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        isFavorite: true,
        playCount: 67,
        dateAdded: new Date('2024-03-01'),
        bpm: 128,
        mood: 'Energetic',
        bitrate: '320kbps'
      },
      {
        id: '4',
        title: 'Acoustic Morning',
        artist: 'Folk Tales',
        album: 'Simple Things',
        duration: 195,
        genre: 'Folk',
        year: 2023,
        coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        isFavorite: false,
        playCount: 12,
        dateAdded: new Date('2024-01-20'),
        bpm: 95,
        mood: 'Peaceful',
        bitrate: '192kbps'
      },
      {
        id: '5',
        title: 'Urban Rhythm',
        artist: 'City Sounds',
        album: 'Street Life',
        duration: 165,
        genre: 'Hip-Hop',
        year: 2024,
        coverArt: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        isFavorite: true,
        playCount: 89,
        dateAdded: new Date('2024-02-28'),
        bpm: 140,
        mood: 'Confident',
        bitrate: '320kbps'
      },
      {
        id: '6',
        title: 'Ocean Waves',
        artist: 'Nature Sounds',
        album: 'Relaxation',
        duration: 300,
        genre: 'Ambient',
        year: 2024,
        coverArt: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        isFavorite: false,
        playCount: 34,
        dateAdded: new Date('2024-03-10'),
        bpm: 60,
        mood: 'Calm',
        bitrate: '256kbps'
      },
      {
        id: '7',
        title: 'Rock Anthem',
        artist: 'The Rebels',
        album: 'Revolution',
        duration: 245,
        genre: 'Rock',
        year: 2023,
        coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        isFavorite: false,
        playCount: 56,
        dateAdded: new Date('2024-01-05'),
        bpm: 160,
        mood: 'Powerful',
        bitrate: '320kbps'
      },
      {
        id: '8',
        title: 'Classical Serenity',
        artist: 'Orchestra Ensemble',
        album: 'Timeless Classics',
        duration: 420,
        genre: 'Classical',
        year: 2022,
        coverArt: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        isFavorite: true,
        playCount: 78,
        dateAdded: new Date('2024-02-15'),
        bpm: 72,
        mood: 'Elegant',
        bitrate: '320kbps'
      },
    ];

    const samplePlaylists: Playlist[] = [
      {
        id: '1',
        name: 'Chill Mix',
        description: 'Relaxing songs for study and work',
        songs: ['1', '4', '6'],
        coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        isPublic: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-03-01'),
        color: 'blue'
      },
      {
        id: '2',
        name: 'Party Vibes',
        description: 'High energy songs for parties',
        songs: ['3', '5', '7'],
        coverArt: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop',
        isPublic: false,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-15'),
        color: 'red'
      },
      {
        id: '3',
        name: 'Morning Routine',
        description: 'Start your day right',
        songs: ['4', '8'],
        coverArt: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
        isPublic: true,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-15'),
        color: 'green'
      }
    ];

    setSongs(sampleSongs);
    setPlaylists(samplePlaylists);
  }, []);

  // Audio controls
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        showToast('Unable to play audio', 'error');
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentSong]);

  const playPreviousSong = useCallback(() => {
    if (!currentSong) return;
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    if (currentIndex > 0) {
      setCurrentSong(songs[currentIndex - 1]);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      setCurrentSong(songs[songs.length - 1]);
      setIsPlaying(true);
    }
  }, [songs, currentSong, repeatMode]);

  const playNextSong = useCallback(() => {
    if (!currentSong) return;
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    if (currentIndex < songs.length - 1) {
      setCurrentSong(songs[currentIndex + 1]);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      setCurrentSong(songs[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [songs, currentSong, repeatMode]);

  const playSong = useCallback((song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setSongs(prev => prev.map(s => 
      s.id === song.id ? { ...s, playCount: s.playCount + 1 } : s
    ));
    showToast(`Now playing: ${song.title}`, 'success');
  }, []);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNextSong();
      }
    };
    const handleError = () => {
      showToast('Error playing audio', 'error');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [playNextSong, repeatMode]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Progress bar control
  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressChange(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      handleProgressChange(e);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [currentSong]);

  const handleProgressChange = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!progressRef.current || !audioRef.current || !currentSong) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : (e as MouseEvent).clientX;
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    const newTime = percentage * currentSong.duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [currentSong]);

  // Toggle favorite
  const toggleFavorite = useCallback((songId: string) => {
    setSongs(prev => prev.map(song => 
      song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song
    ));
  }, []);

  // Playlist management
  const createPlaylist = useCallback(() => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      description: '',
      songs: Array.from(selectedSongs),
      coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    setNewPlaylistName('');
    setShowCreatePlaylist(false);
    setSelectedSongs(new Set());
    showToast('Playlist created successfully!', 'success');
  }, [newPlaylistName, selectedSongs]);

  const addToPlaylist = useCallback((playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId && !playlist.songs.includes(songId)
        ? { ...playlist, songs: [...playlist.songs, songId], updatedAt: new Date() }
        : playlist
    ));
    showToast('Song added to playlist', 'success');
  }, []);

  // File upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const newSong: Song = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          duration: 0,
          genre: 'Unknown',
          year: new Date().getFullYear(),
          coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
          audioUrl: url,
          isFavorite: false,
          playCount: 0,
          dateAdded: new Date()
        };
        setSongs(prev => [newSong, ...prev]);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Files uploaded successfully!', 'success');
  }, []);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter and sort songs
  const filteredSongs = songs.filter(song => {
    const matchesSearch = searchQuery === '' || 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = filterGenre === 'all' || song.genre === filterGenre;
    
    if (currentView === 'favorites') return song.isFavorite && matchesSearch && matchesGenre;
    if (currentView === 'recent') return matchesSearch && matchesGenre;
    
    return matchesSearch && matchesGenre;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'artist': return a.artist.localeCompare(b.artist);
      case 'album': return a.album.localeCompare(b.album);
      case 'duration': return b.duration - a.duration;
      case 'dateAdded': return b.dateAdded.getTime() - a.dateAdded.getTime();
      case 'playCount': return b.playCount - a.playCount;
      case 'title':
      default: return a.title.localeCompare(b.title);
    }
  });

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const genres = ['all', ...Array.from(new Set(songs.map(song => song.genre)))];

  // Calculate audio stats
  useEffect(() => {
    setAudioStats({
      totalSongs: songs.length,
      totalDuration: songs.reduce((acc, song) => acc + song.duration, 0),
      totalPlays: songs.reduce((acc, song) => acc + song.playCount, 0),
      favoriteCount: songs.filter(song => song.isFavorite).length
    });
  }, [songs]);

  // Visualizer animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setVisualizer(Array.from({ length: 64 }, () => 
          Math.random() * (isPlaying ? 100 : 20)
        ));
      }, 50);
    } else {
      setVisualizer(Array(64).fill(5));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Context menu handler
  const handleContextMenu = (e: React.MouseEvent, songId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, songId });
  };

  // Color scheme classes
  const getColorClasses = () => {
    switch (colorScheme) {
      case 'blue': return {
        primary: 'bg-blue-600 hover:bg-blue-700',
        accent: 'text-blue-600',
        border: 'border-blue-500',
        light: 'bg-blue-500/10',
        gradient: 'from-blue-600 to-blue-800'
      };
      case 'green': return {
        primary: 'bg-green-600 hover:bg-green-700',
        accent: 'text-green-600',
        border: 'border-green-500',
        light: 'bg-green-500/10',
        gradient: 'from-green-600 to-green-800'
      };
      case 'red': return {
        primary: 'bg-red-600 hover:bg-red-700',
        accent: 'text-red-600',
        border: 'border-red-500',
        light: 'bg-red-500/10',
        gradient: 'from-red-600 to-red-800'
      };
      default: return {
        primary: 'bg-purple-600 hover:bg-purple-700',
        accent: 'text-purple-600',
        border: 'border-purple-500',
        light: 'bg-purple-500/10',
        gradient: 'from-purple-600 to-purple-800'
      };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className={`flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success' ? 'bg-green-600 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
          }`}>
            {toast.type === 'success' ? <Check size={20} /> :
             toast.type === 'error' ? <Warning size={20} /> :
             <Info size={20} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`border-b backdrop-blur-xl ${
        theme === 'dark' 
          ? 'bg-gray-800/95 border-gray-700/50' 
          : 'bg-white/95 border-gray-200/50'
      }`}>
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${colors.gradient} bg-gradient-to-br`}>
              <Headphones size={24} className="text-white" weight="fill" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MusicBox
              </h1>
              <p className="text-xs text-gray-500">Professional Edition</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { key: 'home', label: 'Home', icon: House },
              { key: 'library', label: 'Library', icon: MusicNotes },
              { key: 'playlists', label: 'Playlists', icon: Playlist },
              { key: 'favorites', label: 'Favorites', icon: HeartStraight },
              { key: 'recent', label: 'Recent', icon: Clock },
              { key: 'explore', label: 'Explore', icon: Compass }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  currentView === key
                    ? `${colors.primary} text-white shadow-lg`
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

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center space-x-2 px-4 py-2 ${colors.primary} text-white rounded-xl transition-all duration-200 hover:shadow-lg`}
            >
              <UploadSimple size={18} />
              <span className="hidden sm:inline font-medium">Upload</span>
            </button>
            
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              {['purple', 'blue', 'green', 'red'].map((color) => (
                <button
                  key={color}
                  onClick={() => setColorScheme(color)}
                  className={`w-6 h-6 rounded-lg transition-all duration-200 ${
                    color === 'purple' ? 'bg-purple-600' :
                    color === 'blue' ? 'bg-blue-600' :
                    color === 'green' ? 'bg-green-600' :
                    'bg-red-600'
                  } ${colorScheme === color ? 'ring-2 ring-white ring-offset-2 dark:ring-offset-gray-700' : ''}`}
                />
              ))}
            </div>
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl transition-all duration-200 ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <SidebarSimple size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className={`w-72 border-r overflow-y-auto ${
            theme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/50 border-gray-200/50'
          }`}>
            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search music..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <MusicNote size={20} className={colors.accent} />
                  <p className="text-lg font-bold">{audioStats.totalSongs}</p>
                  <p className="text-xs text-gray-500">Songs</p>
                </div>
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <Clock size={20} className={colors.accent} />
                  <p className="text-lg font-bold">{formatDuration(audioStats.totalDuration)}</p>
                  <p className="text-xs text-gray-500">Duration</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-500">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl border-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="title">Title</option>
                  <option value="artist">Artist</option>
                  <option value="album">Album</option>
                  <option value="duration">Duration</option>
                  <option value="dateAdded">Date Added</option>
                  <option value="playCount">Play Count</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-500">Genre</label>
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre === 'all' ? 'All Genres' : genre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-500">View Mode</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 py-2 rounded-xl transition-all duration-200 ${
                      viewMode === 'list' 
                        ? `${colors.primary} text-white` 
                        : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}
                  >
                    <ListBullets size={18} className="mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 py-2 rounded-xl transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? `${colors.primary} text-white` 
                        : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}
                  >
                    <Queue size={18} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>

            {/* Playlists */}
            {currentView === 'playlists' && (
              <div className="px-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">My Playlists</h3>
                  <button
                    onClick={() => setShowCreatePlaylist(true)}
                    className="p-1.5 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => {
                        setSelectedPlaylist(playlist);
                        setCurrentView('playlists');
                      }}
                      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                        selectedPlaylist?.id === playlist.id
                          ? `${colors.primary} text-white shadow-lg`
                          : theme === 'dark'
                            ? 'hover:bg-gray-700/50'
                            : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={playlist.coverArt}
                          alt={playlist.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className={`absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                          <PlayCircle size={20} className="text-white" weight="fill" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{playlist.name}</p>
                        <p className={`text-sm truncate ${
                          selectedPlaylist?.id === playlist.id ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {playlist.songs.length} songs
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Playlist options
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <DotsThree size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header */}
          <div className={`px-6 py-6 border-b backdrop-blur-xl ${
            theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">
                  {currentView === 'home' && 'Home'}
                  {currentView === 'library' && 'Music Library'}
                  {currentView === 'playlists' && (selectedPlaylist ? selectedPlaylist.name : 'Playlists')}
                  {currentView === 'favorites' && 'Favorite Songs'}
                  {currentView === 'recent' && 'Recently Played'}
                  {currentView === 'explore' && 'Explore Music'}
                </h2>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filteredSongs.length} songs
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {isSelectionMode && (
                  <>
                    <button
                      onClick={() => {
                        setShowCreatePlaylist(true);
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 ${colors.primary} text-white rounded-xl transition-all duration-200`}
                    >
                      <FolderPlus size={18} />
                      <span>Add to Playlist</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSongs(new Set());
                        setIsSelectionMode(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200"
                    >
                      <X size={18} />
                      <span>Clear Selection</span>
                    </button>
                  </>
                )}
                
                {currentSong && (
                  <button
                    onClick={() => setShowNowPlaying(!showNowPlaying)}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      showNowPlaying 
                        ? colors.primary + ' text-white'
                        : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Equalizer size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Song List */}
          <div className="flex-1 overflow-auto scrollbar-thin">
            {filteredSongs.length > 0 ? (
              viewMode === 'list' ? (
                <div className="space-y-1 p-4">
                  {/* Table Header */}
                  <div className={`flex items-center space-x-4 px-3 py-2 text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="w-8 text-center">#</div>
                    <div className="w-12"></div>
                    <div className="flex-1">Title</div>
                    <div className="hidden md:block w-32">Genre</div>
                    <div className="hidden lg:block w-24">Duration</div>
                    <div className="w-24 text-right">Actions</div>
                  </div>

                  {filteredSongs.map((song, index) => (
                    <div
                      key={song.id}
                      onContextMenu={(e) => handleContextMenu(e, song.id)}
                      className={`flex items-center space-x-4 p-3 rounded-xl group cursor-pointer transition-all duration-200 ${
                        currentSong?.id === song.id
                          ? theme === 'dark' 
                            ? `${colors.light} border-2 ${colors.border}`
                            : `${colors.light} border-2 ${colors.border}`
                          : theme === 'dark'
                            ? 'hover:bg-gray-800/50'
                            : 'hover:bg-gray-50'
                      } ${selectedSongs.has(song.id) ? `${colors.light} border-2 ${colors.border}` : ''}`}
                      onClick={() => {
                        if (isSelectionMode) {
                          const newSelection = new Set(selectedSongs);
                          if (newSelection.has(song.id)) {
                            newSelection.delete(song.id);
                          } else {
                            newSelection.add(song.id);
                          }
                          setSelectedSongs(newSelection);
                        } else {
                          playSong(song);
                        }
                      }}
                    >
                      {/* Track Number / Play Button */}
                      <div className="w-8 text-center">
                        {currentSong?.id === song.id && isPlaying ? (
                          <Equalizer size={20} className={colors.accent} weight="fill" />
                        ) : (
                          <span className="group-hover:hidden text-sm text-gray-500">
                            {index + 1}
                          </span>
                        )}
                        <PlayCircle 
                          size={24} 
                          className={`hidden group-hover:block ${colors.accent}`} 
                          weight="fill"
                        />
                      </div>

                      {/* Cover Art */}
                      <div className="relative">
                        <img
                          src={song.coverArt}
                          alt={`${song.title} cover`}
                          className="w-12 h-12 rounded-lg object-cover shadow-md"
                        />
                        {currentSong?.id === song.id && (
                          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                            <div className="flex space-x-0.5">
                              {[1, 2, 3].map(i => (
                                <div key={i} className={`w-0.5 bg-white rounded-full animate-pulse`} 
                                     style={{ height: `${12 + i * 4}px`, animationDelay: `${i * 0.1}s` }} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium truncate ${
                          currentSong?.id === song.id ? colors.accent : ''
                        }`}>
                          {song.title}
                        </h3>
                        <p className={`text-sm truncate ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {song.artist} • {song.album}
                        </p>
                      </div>

                      {/* Genre */}
                      <div className="hidden md:block w-32">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {song.genre}
                        </span>
                      </div>

                      {/* Duration */}
                      <div className={`hidden lg:block w-24 text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {formatTime(song.duration)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 w-24 justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song.id);
                          }}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            song.isFavorite 
                              ? 'text-red-500 hover:bg-red-500/10' 
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                          }`}
                        >
                          <Heart 
                            size={18} 
                            weight={song.isFavorite ? 'fill' : 'regular'} 
                          />
                        </button>
                        
                        <div className="relative group/menu">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setContextMenu({ x: e.clientX, y: e.clientY, songId: song.id });
                            }}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                          >
                            <DotsThree size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                  {filteredSongs.map((song) => (
                    <div
                      key={song.id}
                      className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
                        theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-white hover:shadow-xl'
                      }`}
                      onClick={() => playSong(song)}
                    >
                      <div className="relative aspect-square">
                        <img
                          src={song.coverArt}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <PlayCircle size={48} className="text-white" weight="fill" />
                        </div>
                        {currentSong?.id === song.id && (
                          <div className="absolute bottom-2 left-2 bg-green-500 rounded-full p-1">
                            <Equalizer size={16} className="text-white" weight="fill" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium truncate">{song.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            {song.genre}
                          </span>
                          <span className="text-xs text-gray-500">{formatTime(song.duration)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-12">
                  <MusicNotes size={64} className={`mx-auto mb-4 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <h3 className="text-lg font-medium mb-2">No songs found</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {searchQuery ? 'Try adjusting your search terms' : 'Upload some music to get started'}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-4 ${colors.primary} text-white px-6 py-2 rounded-xl inline-flex items-center space-x-2`}
                  >
                    <UploadSimple size={18} />
                    <span>Upload Music</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Now Playing Sidebar */}
          {showNowPlaying && currentSong && (
            <div className={`w-80 border-l overflow-y-auto ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Now Playing</h3>
                  <button
                    onClick={() => setShowNowPlaying(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl">
                    <img
                      src={currentSong.coverArt}
                      alt={currentSong.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-xl font-bold">{currentSong.title}</h4>
                    <p className="text-gray-500">{currentSong.artist}</p>
                    <p className="text-sm text-gray-500">{currentSong.album}</p>
                  </div>

                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <h4 className="text-sm font-medium mb-3">Song Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Genre</span>
                        <span>{currentSong.genre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Year</span>
                        <span>{currentSong.year}</span>
                      </div>
                      {currentSong.bpm && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">BPM</span>
                          <span>{currentSong.bpm}</span>
                        </div>
                      )}
                      {currentSong.mood && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Mood</span>
                          <span>{currentSong.mood}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Plays</span>
                        <span>{currentSong.playCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visualizer */}
                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <h4 className="text-sm font-medium mb-3">Visualizer</h4>
                    <div className="flex items-end justify-center space-x-1 h-16">
                      {visualizer.slice(0, 32).map((height, index) => (
                        <div
                          key={index}
                          className={`w-1 rounded-full transition-all duration-75 ${colors.gradient} bg-gradient-to-t`}
                          style={{ height: `${Math.max(4, height * 0.5)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Player Bar */}
      {currentSong && (
        <div className={`border-t backdrop-blur-xl ${
          theme === 'dark' 
            ? 'bg-gray-800/95 border-gray-700/50' 
            : 'bg-white/95 border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* Current Song Info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="relative group">
                <img
                  src={currentSong.coverArt}
                  alt={`${currentSong.title} cover`}
                  className="w-14 h-14 rounded-xl object-cover shadow-lg"
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ArrowsClockwise size={20} className="text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="font-medium truncate">{currentSong.title}</h4>
                <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentSong.artist}
                </p>
              </div>
              <button
                onClick={() => toggleFavorite(currentSong.id)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  currentSong.isFavorite 
                    ? 'text-red-500 hover:bg-red-500/10' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                }`}
              >
                <Heart 
                  size={20} 
                  weight={currentSong.isFavorite ? 'fill' : 'regular'} 
                />
              </button>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center space-y-2 flex-1 max-w-2xl">
              {/* Control Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isShuffled 
                      ? colors.accent
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Shuffle"
                >
                  <ShuffleAngular size={20} weight={isShuffled ? 'fill' : 'regular'} />
                </button>

                <button
                  onClick={playPreviousSong}
                  className="p-2 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
                  title="Previous"
                >
                  <SkipBack size={24} weight="fill" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className={`p-4 ${colors.primary} text-white rounded-full shadow-lg transform hover:scale-105 transition-all duration-200`}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" className="ml-0.5" />}
                </button>

                <button
                  onClick={playNextSong}
                  className="p-2 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
                  title="Next"
                >
                  <SkipForward size={24} weight="fill" />
                </button>

                <button
                  onClick={() => setRepeatMode(
                    repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none'
                  )}
                  className={`p-2 rounded-xl transition-all duration-200 relative ${
                    repeatMode !== 'none' 
                      ? colors.accent
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title={`Repeat ${repeatMode}`}
                >
                  {repeatMode === 'one' ? (
                    <RepeatOnce size={20} weight="fill" />
                  ) : (
                    <Repeat size={20} weight={repeatMode !== 'none' ? 'fill' : 'regular'} />
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center space-x-3 w-full">
                <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatTime(currentTime)}
                </span>
                <div
                  ref={progressRef}
                  className={`flex-1 h-2 rounded-full cursor-pointer group ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                  onMouseDown={handleProgressMouseDown}
                >
                  <div
                    className={`h-full rounded-full relative transition-all duration-100 ${
                      isDragging ? 'scale-y-150' : ''
                    }`}
                    style={{ 
                      width: `${(currentTime / currentSong.duration) * 100}%`,
                      background: `linear-gradient(to right, ${colorScheme === 'purple' ? '#9333ea' : colorScheme === 'blue' ? '#2563eb' : colorScheme === 'green' ? '#16a34a' : '#dc2626'}, #ec4899)`
                    }}
                  >
                    <div className={`absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                      isDragging ? 'opacity-100 scale-125' : ''
                    }`}></div>
                  </div>
                </div>
                <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatTime(currentSong.duration)}
                </span>
              </div>
            </div>

            {/* Volume and Additional Controls */}
            <div className="flex items-center space-x-4 flex-1 justify-end">
              {/* Mini Visualizer */}
              <div className="hidden lg:flex items-end space-x-0.5 h-8">
                {visualizer.slice(0, 24).map((height, index) => (
                  <div
                    key={index}
                    className={`w-0.5 rounded-full transition-all duration-75`}
                    style={{ 
                      height: `${Math.max(2, height * 0.3)}px`,
                      background: `linear-gradient(to top, ${colorScheme === 'purple' ? '#9333ea' : colorScheme === 'blue' ? '#2563eb' : colorScheme === 'green' ? '#16a34a' : '#dc2626'}, #ec4899)`
                    }}
                  />
                ))}
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
                >
                  {isMuted || volume === 0 ? (
                    <SpeakerX size={20} weight="fill" />
                  ) : (
                    <SpeakerHigh size={20} weight="fill" />
                  )}
                </button>
                <div className="w-24 hidden sm:block">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      setIsMuted(newVolume === 0);
                    }}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, ${colorScheme === 'purple' ? '#9333ea' : colorScheme === 'blue' ? '#2563eb' : colorScheme === 'green' ? '#16a34a' : '#dc2626'} ${volume * 100}%, #374151 ${volume * 100}%)`
                    }}
                  />
                </div>
              </div>

              {/* Additional Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    showLyrics 
                      ? colors.accent
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Lyrics"
                >
                  <Microphone size={20} weight={showLyrics ? 'fill' : 'regular'} />
                </button>
                
                <button
                  onClick={() => setShowQueue(!showQueue)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    showQueue 
                      ? colors.accent
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Queue"
                >
                  <ListBullets size={20} weight={showQueue ? 'fill' : 'regular'} />
                </button>

                <button
                  onClick={() => setShowEqualizer(!showEqualizer)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    showEqualizer 
                      ? colors.accent
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Equalizer"
                >
                  <Equalizer size={20} weight={showEqualizer ? 'fill' : 'regular'} />
                </button>
              </div>
            </div>
          </div>

          {/* Equalizer Panel */}
          {showEqualizer && (
            <div className={`border-t p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <label className="text-sm font-medium mb-2 block">Bass</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={eqSettings.bass}
                    onChange={(e) => setEqSettings(prev => ({ ...prev, bass: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{eqSettings.bass}%</span>
                </div>
                <div className="text-center">
                  <label className="text-sm font-medium mb-2 block">Mid</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={eqSettings.mid}
                    onChange={(e) => setEqSettings(prev => ({ ...prev, mid: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{eqSettings.mid}%</span>
                </div>
                <div className="text-center">
                  <label className="text-sm font-medium mb-2 block">Treble</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={eqSettings.treble}
                    onChange={(e) => setEqSettings(prev => ({ ...prev, treble: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{eqSettings.treble}%</span>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setEqSettings(prev => ({ ...prev, surround: !prev.surround }))}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    eqSettings.surround 
                      ? colors.primary + ' text-white'
                      : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  <SoundcloudLogo size={20} />
                  <span>Surround Sound {eqSettings.surround ? 'On' : 'Off'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className={`max-w-md w-full rounded-2xl p-6 shadow-2xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Create Playlist</h3>
              <button
                onClick={() => setShowCreatePlaylist(false)}
                className="p-1.5 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Playlist Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  autoFocus
                />
              </div>

              {selectedSongs.size > 0 && (
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <p className="text-sm">
                    <span className="font-medium">{selectedSongs.size}</span> songs selected
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreatePlaylist(false);
                  setIsSelectionMode(false);
                }}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={createPlaylist}
                disabled={!newPlaylistName.trim()}
                className={`flex-1 px-4 py-3 ${colors.primary} text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg`}
              >
                Create Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lyrics Panel */}
      {showLyrics && currentSong && (
        <div className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 backdrop-blur-xl text-white shadow-2xl z-40 overflow-y-auto animate-in slide-in-from-right">
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Lyrics</h3>
              <button
                onClick={() => setShowLyrics(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <img
                src={currentSong.coverArt}
                alt={currentSong.title}
                className="w-16 h-16 rounded-xl object-cover shadow-lg"
              />
              <div>
                <h4 className="font-semibold text-lg">{currentSong.title}</h4>
                <p className="text-gray-400">{currentSong.artist}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-3 text-center leading-relaxed">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-600/20 rounded-full">
                <MusicNote size={16} className="text-purple-400" />
                <span className="text-sm text-purple-300">Synced Lyrics</span>
              </div>
              <p className="text-lg text-gray-300 mt-6">
                🎵 Lyrics will appear here in time with the music 🎵
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Lyrics sync feature would be implemented with a lyrics API service in the full version.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Queue Panel */}
      {showQueue && (
        <div className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 backdrop-blur-xl text-white shadow-2xl z-40 overflow-y-auto animate-in slide-in-from-right">
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Queue</h3>
              <button
                onClick={() => setShowQueue(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {queue.length > 0 ? (
              <div className="space-y-2">
                {queue.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  >
                    <span className="text-sm text-gray-500 w-6">{index + 1}</span>
                    <img
                      src={song.coverArt}
                      alt={song.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-all duration-200">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ListBullets size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Queue is empty</p>
                <p className="text-sm text-gray-500 mt-2">Add songs to queue to see them here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 w-56 rounded-xl shadow-2xl py-2 animate-in zoom-in-95"
            style={{
              left: `${Math.min(contextMenu.x, window.innerWidth - 240)}px`,
              top: `${Math.min(contextMenu.y, window.innerHeight - 200)}px`,
              background: theme === 'dark' ? '#1f2937' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
            }}
          >
            <button
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              onClick={() => {
                playSong(songs.find(s => s.id === contextMenu.songId)!);
                setContextMenu(null);
              }}
            >
              <Play size={18} />
              <span>Play Now</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              onClick={() => {
                // Add to queue
                setContextMenu(null);
                showToast('Added to queue', 'success');
              }}
            >
              <ListBullets size={18} />
              <span>Add to Queue</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              onClick={() => {
                toggleFavorite(contextMenu.songId);
                setContextMenu(null);
              }}
            >
              <Heart size={18} />
              <span>Toggle Favorite</span>
            </button>
            <div className="border-t my-1" />
            <button
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              onClick={() => {
                setSelectedSongs(new Set([contextMenu.songId]));
                setIsSelectionMode(true);
                setContextMenu(null);
              }}
            >
              <Check size={18} />
              <span>Select</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-red-500"
              onClick={() => {
                // Remove from playlist or delete
                setContextMenu(null);
                showToast('Song removed', 'error');
              }}
            >
              <Trash size={18} />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}

      {/* Audio Element */}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          onLoadedMetadata={() => {
            if (audioRef.current && currentSong.duration === 0) {
              const duration = audioRef.current.duration;
              setSongs(prev => prev.map(song => 
                song.id === currentSong.id ? { ...song, duration } : song
              ));
            }
          }}
          autoPlay={isPlaying}
        />
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default MusicPlayerApp;