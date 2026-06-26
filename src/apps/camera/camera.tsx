import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  CameraIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  LightningIcon,
  LightningSlashIcon,
  ArrowsClockwiseIcon,
  DownloadSimpleIcon,
  GearSixIcon,
  XIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  TimerIcon,
  GridFourIcon,
  CheckIcon,
} from '@phosphor-icons/react';

interface CapturedMedia {
  type: 'photo' | 'video';
  url: string;
  timestamp: number;
}

type TimerOption = 0 | 3 | 10;
type ResolutionOption = '720p' | '1080p' | '4k';

const CameraApp: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([]);
  const [showMotionCard, setShowMotionCard] = useState(false);
  const [motionCardType, setMotionCardType] = useState<'photo' | 'video'>('photo');
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState<string>('');

  // New: zoom, timer, settings, grid
  const [zoom, setZoom] = useState(1);
  const [timerOption, setTimerOption] = useState<TimerOption>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [resolution, setResolution] = useState<ResolutionOption>('1080p');
  const [showGallery, setShowGallery] = useState(false);

  const resolutionMap: Record<ResolutionOption, { width: number; height: number }> = {
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '4k': { width: 3840, height: 2160 },
  };

  const startCamera = useCallback(async () => {
    try {
      setCameraError('');
      const { width, height } = resolutionMap[resolution];
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  }, [facingMode, resolution]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const toggleFlash = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && 'applyConstraints' in videoTrack) {
        try {
          const constraints = {
            advanced: [{ torch: !flashEnabled }],
          } as unknown as MediaTrackConstraints;

          videoTrack.applyConstraints(constraints).catch(() => {
            const fallbackConstraints = {
              torch: !flashEnabled,
            } as MediaTrackConstraints;
            videoTrack.applyConstraints(fallbackConstraints).catch(console.error);
          });
        } catch (error) {
          console.warn('Flash not supported on this device:', error);
        }
      }
    }
    setFlashEnabled(!flashEnabled);
  }, [flashEnabled]);

  const flipCamera = useCallback(() => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    setZoom(1);
  }, [facingMode]);

  const applyZoom = useCallback((value: number) => {
    setZoom(value);
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && 'applyConstraints' in videoTrack) {
        videoTrack
          .applyConstraints({ advanced: [{ zoom: value } as unknown as MediaTrackConstraintSet] })
          .catch(() => {
            // Zoom constraint not supported — fall back to CSS scale below
          });
      }
    }
  }, []);

  const showMotionCardWithDelay = useCallback((type: 'photo' | 'video') => {
    setMotionCardType(type);
    setShowMotionCard(true);
    setTimeout(() => setShowMotionCard(false), 1800);
  }, []);

  const capturePhotoNow = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        const newPhoto: CapturedMedia = {
          type: 'photo',
          url: dataUrl,
          timestamp: Date.now(),
        };

        setCapturedMedia((prev) => [newPhoto, ...prev]);
        showMotionCardWithDelay('photo');
      }
    }
  }, [showMotionCardWithDelay]);

  const capturePhoto = useCallback(() => {
    if (timerOption > 0) {
      let remaining = timerOption;
      setCountdown(remaining);
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setCountdown(null);
          capturePhotoNow();
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    } else {
      capturePhotoNow();
    }
  }, [timerOption, capturePhotoNow]);

  const cancelCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
  }, []);

  const startRecording = useCallback(() => {
    if (streamRef.current) {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        const newVideo: CapturedMedia = {
          type: 'video',
          url: url,
          timestamp: Date.now(),
        };

        setCapturedMedia((prev) => [newVideo, ...prev]);
        showMotionCardWithDelay('video');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    }
  }, [showMotionCardWithDelay]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  }, [isRecording]);

  const downloadMedia = useCallback((media: CapturedMedia) => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = `${media.type}_${new Date(media.timestamp).toISOString()}.${media.type === 'photo' ? 'jpg' : 'webm'}`;
    link.click();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      stopCamera();
      const t = setTimeout(() => startCamera(), 100);
      return () => clearTimeout(t);
    }
  }, [facingMode, resolution, startCamera, stopCamera]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const zoomLevels = [1, 1.5, 2, 3];

  return (
    <div className="relative size-full bg-black overflow-hidden select-none">
      {/* Camera View */}
      <div className="absolute inset-0">
        {cameraError ? (
          <div className="flex items-center justify-center h-full bg-zinc-950">
            <div className="text-zinc-300 text-center p-6 max-w-xs">
              <CameraIcon className="w-14 h-14 mx-auto mb-4 text-zinc-600" />
              <p className="text-sm text-zinc-400">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-5 px-5 py-2 bg-zinc-800 text-white text-sm font-medium rounded-full hover:bg-zinc-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ transform: `scale(${zoom})` }}
            className="w-full h-full object-cover transition-transform duration-300 ease-out"
          />
        )}

        {/* Grid overlay */}
        {showGrid && !cameraError && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/15" />
            ))}
          </div>
        )}
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/40 z-30"
          onClick={cancelCountdown}
        >
          <span className="text-white text-8xl font-bold tabular-nums drop-shadow-lg animate-pulse">
            {countdown}
          </span>
        </div>
      )}

      {/* Recording indicator + timer */}
      <div className="absolute top-5 left-5 flex items-center gap-2 z-20">
        {isRecording && (
          <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xs font-semibold tabular-nums tracking-wide">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}
        {timerOption > 0 && countdown === null && (
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
            <TimerIcon size={14} weight="fill" color="#fbbf24" />
            <span className="text-amber-400 text-xs font-medium">{timerOption}s</span>
          </div>
        )}
      </div>

      {/* Top right controls */}
      <div className="absolute top-5 right-5 flex gap-2.5 z-20">
        <IconButton active={flashEnabled} onClick={toggleFlash}>
          {flashEnabled ? (
            <LightningIcon size={18} weight="fill" color="#000" />
          ) : (
            <LightningSlashIcon size={18} weight="regular" color="#fff" />
          )}
        </IconButton>

        <IconButton active={showGrid} onClick={() => setShowGrid((v) => !v)}>
          <GridFourIcon size={18} weight={showGrid ? 'fill' : 'regular'} color={showGrid ? '#000' : '#fff'} />
        </IconButton>

        <IconButton onClick={flipCamera}>
          <ArrowsClockwiseIcon size={18} weight="regular" color="#fff" />
        </IconButton>

        <IconButton onClick={() => setShowSettings(true)}>
          <GearSixIcon size={18} weight="regular" color="#fff" />
        </IconButton>
      </div>

      {/* Zoom control */}
      {!cameraError && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 bg-black/35 backdrop-blur-sm rounded-full py-3 px-1.5">
          <button
            onClick={() => applyZoom(Math.min(zoom + 0.5, 4))}
            className="p-1 text-white/80 hover:text-white transition-colors"
          >
            <MagnifyingGlassPlusIcon size={15} />
          </button>
          <div className="flex flex-col gap-1.5 py-1">
            {zoomLevels.slice().reverse().map((level) => (
              <button
                key={level}
                onClick={() => applyZoom(level)}
                className={`text-[10px] font-semibold rounded-full size-7 flex items-center justify-center transition-all ${
                  Math.abs(zoom - level) < 0.01
                    ? 'bg-amber-400 text-black scale-110'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {level}×
              </button>
            ))}
          </div>
          <button
            onClick={() => applyZoom(Math.max(zoom - 0.5, 1))}
            className="p-1 text-white/80 hover:text-white transition-colors"
          >
            <MagnifyingGlassMinusIcon size={15} />
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-9 left-0 right-0 z-20 flex items-center justify-center gap-10">
        {/* Gallery thumbnail */}
        <button
          onClick={() => setShowGallery(true)}
          className="size-12 rounded-xl bg-zinc-900 border border-white/15 overflow-hidden relative shadow-lg"
        >
          {capturedMedia.length > 0 ? (
            <>
              {capturedMedia[0].type === 'photo' ? (
                <img src={capturedMedia[0].url} alt="Latest capture" className="w-full h-full object-cover" />
              ) : (
                <video src={capturedMedia[0].url} className="w-full h-full object-cover" muted />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-1 right-1.5 text-white text-[10px] font-bold">
                {capturedMedia.length}
              </span>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CameraIcon size={16} className="text-zinc-600" />
            </div>
          )}
        </button>

        {/* Shutter button */}
        <button
          onClick={isRecording ? stopRecording : capturePhoto}
          onDoubleClick={!isRecording ? startRecording : undefined}
          disabled={countdown !== null}
          className={`relative size-[72px] rounded-full border-[3px] flex items-center justify-center transition-all duration-200 ${
            isRecording ? 'border-red-500' : 'border-white'
          } ${countdown !== null ? 'opacity-40' : 'active:scale-90'}`}
        >
          <div
            className={`transition-all duration-200 ${
              isRecording ? 'size-7 rounded-md bg-red-500' : 'size-[58px] rounded-full bg-white'
            }`}
          />
        </button>

        {/* Video record toggle */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={countdown !== null}
          className={`size-12 rounded-full flex items-center justify-center border transition-all ${
            isRecording
              ? 'border-red-500 bg-red-500/20'
              : 'border-white/25 bg-white/5 hover:bg-white/10'
          } ${countdown !== null ? 'opacity-40' : ''}`}
        >
          {isRecording ? (
            <VideoCameraSlashIcon size={20} weight="fill" color="#ef4444" />
          ) : (
            <VideoCameraIcon size={20} weight="regular" color="#fff" />
          )}
        </button>
      </div>

      {/* Capture flash feedback */}
      {showMotionCard && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl px-7 py-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center gap-2.5">
              <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckIcon size={20} weight="bold" color="#34d399" />
              </div>
              <p className="text-sm font-medium text-white">
                {motionCardType === 'photo' ? 'Photo captured' : 'Video saved'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute inset-0 z-40 flex items-end" onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full bg-zinc-900 rounded-t-3xl p-5 pb-8 border-t border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-base">Camera settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="size-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15"
              >
                <XIcon size={16} color="#fff" />
              </button>
            </div>

            <div className="mb-5">
              <p className="text-zinc-400 text-xs font-medium mb-2.5 uppercase tracking-wide">Resolution</p>
              <div className="flex gap-2">
                {(['720p', '1080p', '4k'] as ResolutionOption[]).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      resolution === res
                        ? 'bg-amber-400 text-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {res.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-zinc-400 text-xs font-medium mb-2.5 uppercase tracking-wide">Self-timer</p>
              <div className="flex gap-2">
                {([0, 3, 10] as TimerOption[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimerOption(t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      timerOption === t
                        ? 'bg-amber-400 text-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {t === 0 ? 'Off' : `${t}s`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <GridFourIcon size={18} color="#a1a1aa" />
                <span className="text-zinc-200 text-sm font-medium">Grid lines</span>
              </div>
              <button
                onClick={() => setShowGrid((v) => !v)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  showGrid ? 'bg-amber-400' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`size-5 rounded-full bg-white transition-transform ${
                    showGrid ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery panel */}
      {showGallery && (
        <div className="absolute inset-0 z-40 flex items-end" onClick={() => setShowGallery(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full bg-zinc-900 rounded-t-3xl p-5 pb-8 border-t border-white/10 max-h-[70%] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-base">
                Captures <span className="text-zinc-500">({capturedMedia.length})</span>
              </h2>
              <button
                onClick={() => setShowGallery(false)}
                className="size-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15"
              >
                <XIcon size={16} color="#fff" />
              </button>
            </div>

            {capturedMedia.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">No captures yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {capturedMedia.map((media) => (
                  <div key={media.timestamp} className="relative group aspect-square rounded-xl overflow-hidden bg-zinc-800">
                    {media.type === 'photo' ? (
                      <img src={media.url} alt="Capture" className="w-full h-full object-cover" />
                    ) : (
                      <video src={media.url} className="w-full h-full object-cover" muted />
                    )}
                    <button
                      onClick={() => downloadMedia(media)}
                      className="absolute bottom-1.5 right-1.5 p-1.5 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <DownloadSimpleIcon size={13} color="#fff" />
                    </button>
                    {media.type === 'video' && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 rounded text-[9px] text-white font-medium">
                        VIDEO
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function IconButton({
  children,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-full backdrop-blur-sm transition-all ${
        active ? 'bg-amber-400' : 'bg-black/35 hover:bg-black/50'
      }`}
    >
      {children}
    </button>
  );
}

export default CameraApp;