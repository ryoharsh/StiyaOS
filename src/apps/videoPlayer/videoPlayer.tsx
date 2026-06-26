import { useState, useRef, useEffect } from "react";
import {
  PlayIcon,
  PauseIcon,
  SpeakerHighIcon,
  FastForwardIcon,
  RewindIcon,
  RepeatIcon,
  RepeatOnceIcon,
  ShuffleIcon,
  PictureInPictureIcon,
  ArrowsOutCardinalIcon,
  ArrowsInCardinalIcon,
  ListIcon,
  PlaylistIcon,
  DotsThreeIcon,
  XIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  InfoIcon,
  SpeakerSimpleHighIcon,
  SpeakerSimpleSlashIcon,
  EqualizerIcon,
  WarningIcon,
} from "@phosphor-icons/react";

interface VideoTrack {
  id: string;
  title: string;
  artist?: string;
  duration: number;
  thumbnail: string;
  src: string;
  type: 'video' | 'audio';
  description?: string;
  album?: string;
  year?: number;
}

export default function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [activeTrack, setActiveTrack] = useState<VideoTrack | null>(null);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [isShuffled, setIsShuffled] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const playlist: VideoTrack[] = [
    {
      id: '1',
      title: 'Relaxing Music - Chill Vibes',
      artist: 'Lo-Fi Beats',
      duration: 245,
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
      src: '/welcome.mp4',
      type: 'video',
      description: 'Perfect background music for studying and relaxation',
      album: 'Chill Collection',
      year: 2024
    },
    {
      id: '2',
      title: 'Epic Cinematic Journey',
      artist: 'Orchestral Dreams',
      duration: 312,
      thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop',
      src: '/welcome.mp4',
      type: 'video',
      description: 'An epic orchestral piece for your listening pleasure',
      album: 'Cinematic Dreams',
      year: 2024
    },
    {
      id: '3',
      title: 'Electronic Waves',
      artist: 'Digital Pulse',
      duration: 198,
      thumbnail: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=100&h=100&fit=crop',
      src: '/welcome.mp4',
      type: 'video',
      description: 'Modern electronic music with deep bass',
      album: 'Digital Era',
      year: 2024
    },
    {
      id: '4',
      title: 'Acoustic Serenity',
      artist: 'Nature Sounds',
      duration: 267,
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
      src: '/welcome.mp4',
      type: 'video',
      description: 'Calm acoustic guitar melodies',
      album: 'Natural Harmony',
      year: 2024
    }
  ];

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
      setCurrentTime(video.currentTime);
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        video.currentTime = 0;
        video.play();
      } else if (repeatMode === 'all') {
        const nextIndex = (playlist.findIndex(t => t.id === activeTrack?.id) + 1) % playlist.length;
        setActiveTrack(playlist[nextIndex]);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [activeTrack, repeatMode]);

  useEffect(() => {
    // Set initial active track
    if (!activeTrack && playlist.length > 0) {
      setActiveTrack(playlist[0]);
    }
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {
        showNotification('error', 'Failed to play video');
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
    }
    if (newMutedState) {
      setVolume(0);
    } else {
      setVolume(0.75);
      if (videoRef.current) {
        videoRef.current.volume = 0.75;
      }
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        showNotification('error', 'Fullscreen not supported');
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPictureInPicture(false);
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
        setIsPictureInPicture(true);
      }
    } catch (error) {
      showNotification('error', 'Picture-in-Picture not supported');
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
      showNotification('info', `Speed: ${speed}x`);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playTrack = (track: VideoTrack) => {
    setActiveTrack(track);
    setIsPlaying(true);
  };

  return (
    <div className="flex h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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

      {/* Playlist Sidebar */}
      {showPlaylist && (
        <div className="flex flex-col w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 h-full">
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <PlaylistIcon size={24} className="text-purple-500" weight="fill" />
                <h2 className="text-xl font-bold text-white">Playlist</h2>
              </div>
              <button
                onClick={() => setShowPlaylist(false)}
                className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <XIcon size={20} weight="bold" />
              </button>
            </div>
            
            <div className="relative">
              <MagnifyingGlassIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tracks..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto scrollbar-thin p-4">
            <div className="space-y-2">
              {playlist.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`group flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeTrack?.id === track.id
                      ? 'bg-purple-600/20 border border-purple-500/30'
                      : 'hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-12 h-12 rounded-lg object-cover shadow-md"
                    />
                    {activeTrack?.id === track.id && isPlaying && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <EqualizerIcon size={20} className="text-white" weight="fill" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      activeTrack?.id === track.id ? 'text-purple-400' : 'text-white'
                    }`}>
                      {track.title}
                    </p>
                    {track.artist && (
                      <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track);
                      }}
                      className="p-1.5 rounded-lg hover:bg-purple-600/20 text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      <PlayIcon size={16} weight="fill" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    >
                      <DotsThreeIcon size={16} weight="bold" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{playlist.length} tracks</span>
              <button className="flex items-center space-x-1 hover:text-white transition-colors">
                <ShuffleIcon size={16} />
                <span>Shuffle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        <div ref={containerRef} className="flex-1 relative bg-black">
          {/* Video Player */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={activeTrack?.src}
          >
            <source src={activeTrack?.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Video Overlay Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8 pt-16">
            {/* Video Info */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white mb-1">
                {activeTrack?.title || 'No Track Selected'}
              </h2>
              {activeTrack?.artist && (
                <p className="text-sm text-gray-300">{activeTrack.artist}</p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <input
                ref={progressRef}
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-colors"
                style={{
                  background: `linear-gradient(to right, #a855f7 ${progress}%, #4b5563 ${progress}%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlayPause}
                  className="p-2.5 bg-white rounded-full hover:bg-gray-200 transition-colors shadow-lg"
                >
                  {isPlaying ? (
                    <PauseIcon size={22} color="#000" weight="fill" />
                  ) : (
                    <PlayIcon size={22} color="#000" weight="fill" className="ml-0.5" />
                  )}
                </button>

                <button
                  onClick={skipBackward}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Skip Backward 10s"
                >
                  <RewindIcon size={20} weight="fill" />
                </button>

                <button
                  onClick={skipForward}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Skip Forward 10s"
                >
                  <FastForwardIcon size={20} weight="fill" />
                </button>

                <div className="relative group"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <button
                    onClick={toggleMute}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {isMuted ? (
                      <SpeakerSimpleSlashIcon size={20} weight="fill" />
                    ) : volume < 0.5 ? (
                      <SpeakerSimpleHighIcon size={20} weight="fill" />
                    ) : (
                      <SpeakerHighIcon size={20} weight="fill" />
                    )}
                  </button>
                  
                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-800 rounded-xl transition-all duration-200 ${
                    showVolumeSlider ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                  }`}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-purple-500"
                      style={{
                        background: `linear-gradient(to right, #a855f7 ${volume * 100}%, #4b5563 ${volume * 100}%)`
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center text-xs text-gray-400">
                  <span className="tabular-nums">{formatTime(currentTime)}</span>
                  <span className="mx-1">/</span>
                  <span className="tabular-nums">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Center Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                  className={`p-2 rounded-lg transition-colors ${
                    repeatMode !== 'none' ? 'text-purple-500 bg-purple-500/10' : 'text-gray-400 hover:text-white'
                  }`}
                  title={`Repeat: ${repeatMode}`}
                >
                  {repeatMode === 'one' ? (
                    <RepeatOnceIcon size={18} weight="fill" />
                  ) : (
                    <RepeatIcon size={18} weight={repeatMode !== 'none' ? 'fill' : 'regular'} />
                  )}
                </button>

                <button
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={`p-2 rounded-lg transition-colors ${
                    isShuffled ? 'text-purple-500 bg-purple-500/10' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Shuffle"
                >
                  <ShuffleIcon size={18} weight={isShuffled ? 'fill' : 'regular'} />
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-2">
                {/* Playback Speed */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      playbackSpeed !== 1 
                        ? 'text-purple-400 bg-purple-500/10' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {playbackSpeed}x
                  </button>
                  
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors ${
                            playbackSpeed === speed ? 'text-purple-400' : 'text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePictureInPicture}
                  className={`p-2 rounded-lg transition-colors ${
                    isPictureInPicture ? 'text-purple-500 bg-purple-500/10' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Picture in Picture"
                >
                  <PictureInPictureIcon size={18} weight={isPictureInPicture ? 'fill' : 'regular'} />
                </button>

                <button
                  onClick={handleFullscreen}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Fullscreen"
                >
                  {isFullscreen ? (
                    <ArrowsInCardinalIcon size={18} weight="fill" />
                  ) : (
                    <ArrowsOutCardinalIcon size={18} weight="fill" />
                  )}
                </button>

                {!showPlaylist && (
                  <button
                    onClick={() => setShowPlaylist(true)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Show Playlist"
                  >
                    <ListIcon size={18} weight="fill" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Video Metadata Overlay */}
          {activeTrack && (
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              {activeTrack.album && (
                <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                  {activeTrack.album}
                </span>
              )}
              {activeTrack.year && (
                <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                  {activeTrack.year}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}