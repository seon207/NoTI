'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CustomVideoPlayerProps {
  videoUrl: string;
  title?: string;
  onTimeUpdate?: (_time: number) => void;
  initialTime?: number;
}

function CustomVideoPlayer({
  videoUrl,
  title,
  onTimeUpdate,
  initialTime = 0,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loading, setLoading] = useState(true);

  // 프록시 URL 사용 (CORS 우회)
  const actualVideoUrl = videoUrl.startsWith('http')
    ? `/api/video-proxy?url=${encodeURIComponent(videoUrl)}`
    : videoUrl;

  useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [initialTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      // 비디오가 없을 때도 함수 반환 (일관성 유지)
      return () => {
        // 아무것도 하지 않음 - 빈 클린업 함수
      };
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleCanPlay = () => setLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('canplay', handleCanPlay);

    // 모든 경로에서 함수 반환
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onTimeUpdate, videoUrl]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const captureScreenshot = () => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="loading-spinner mr-2"></div>
          <span>비디오 로딩 중...</span>
        </div>
      )}

      <div className="relative flex-grow flex items-center justify-center">
        <video
          ref={videoRef}
          src={actualVideoUrl}
          controls
          className="w-full h-full"
          title={title}
        />
      </div>
      <div className="bg-gray-900 text-white p-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full hover:bg-white/20"
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <div className="flex-grow mx-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full"
              step="any"
            />
          </div>

          <span className="text-sm whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm font-medium truncate max-w-[200px]">
            {title || 'Video Player'}
          </div>

          <div className="flex space-x-2">
            <select
              value={playbackRate}
              onChange={(e) =>
                handlePlaybackRateChange(parseFloat(e.target.value))
              }
              className="text-sm bg-gray-800 border border-gray-700 rounded px-2 py-1"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>

            <button
              onClick={() => {
                const screenshot = captureScreenshot();
                if (screenshot) {
                  // 스크린샷 데이터를 커스텀 이벤트로 전달
                  window.dispatchEvent(
                    new CustomEvent('capture-screenshot', {
                      detail: {
                        image: screenshot,
                        time: currentTime,
                      },
                    }),
                  );
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
            >
              캡처
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .loading-spinner {
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 3px solid white;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default CustomVideoPlayer;
