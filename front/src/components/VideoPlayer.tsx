/* eslint-disable no-unused-vars */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { extractVideoInfo, generateEmbedUrl } from '@/lib/videoUtils';

// YouTube IFrame API 타입 정의
declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState?: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

// 모듈로 만들기 위한 빈 export 추가
export {};

interface VideoPlayerProps {
  videoUrl: string;
  videoId?: string;
  platform?: string;
  title?: string;
  isLive?: boolean;
  onTimeUpdate?: (_time: number) => void;
  onReady?: () => void;
  onError?: (_error: string) => void;
  initialTime?: number;
}

function VideoPlayer({
  videoUrl,
  videoId,
  platform,
  isLive = false,
  onTimeUpdate,
  onReady,
  onError,
  initialTime = 0,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null); // YouTube 플레이어 인스턴스

  // 비디오 정보 추출
  const videoInfo = videoId
    ? {
        platform: (platform as any) || 'youtube',
        videoId,
        isLive,
      }
    : extractVideoInfo(videoUrl);

  // iframe URL 생성
  const embedUrl = generateEmbedUrl({
    platform: videoInfo.platform,
    videoId: videoInfo.videoId || '',
    url: videoUrl,
    isLive,
  });

  // YouTube 플레이어 이벤트 핸들러
  const handleYouTubePlayerReady = (event: any) => {
    console.log('YouTube 플레이어 준비 완료');
    setLoading(false);
    onReady?.();

    // 시간 업데이트 설정
    if (onTimeUpdate && !isLive) {
      const intervalId = setInterval(() => {
        try {
          const currentTime = event.target.getCurrentTime();
          onTimeUpdate(currentTime);
        } catch (errors) {
          console.error('시간 업데이트 오류:', errors);
        }
      }, 1000);

      // 이전 인터벌 클리어를 위해 ref에 인터벌 ID 저장
      const currentRef = playerRef.current;
      if (currentRef) {
        currentRef.timeUpdateInterval = intervalId;
      }
    }
  };

  const handleYouTubePlayerStateChange = (event: any) => {
    // 상태 변경 처리 (재생, 일시정지, 종료 등)
    console.log('플레이어 상태 변경:', event.data);
  };

  const handleYouTubePlayerError = (event: any) => {
    console.error('YouTube 플레이어 오류:', event.data);
    const errorMessages: Record<number, string> = {
      2: '잘못된 매개변수가 전달되었습니다.',
      5: 'HTML5 플레이어 관련 오류가 발생했습니다.',
      100: '요청한 비디오를 찾을 수 없습니다.',
      101: '소유자가 다른 사이트에서의 재생을 허용하지 않았습니다.',
      150: '소유자가 다른 사이트에서의 재생을 허용하지 않았습니다.',
    };

    const errorMessage =
      errorMessages[event.data] || '알 수 없는 오류가 발생했습니다.';
    setError(errorMessage);
    onError?.(errorMessage);
  };

  // YouTube 플레이어 초기화
  const initYouTubePlayer = () => {
    if (!videoInfo.videoId || !window.YT || !window.YT.Player) return;

    try {
      // 기존 iframe 제거
      const container = document.getElementById('youtube-player-container');
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        // 새 div 생성
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player';
        container.appendChild(playerDiv);

        // YouTube 플레이어 생성
        playerRef.current = new window.YT.Player('youtube-player', {
          videoId: videoInfo.videoId,
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            start: Math.floor(initialTime),
            origin: window.location.origin,
          },
          events: {
            onReady: handleYouTubePlayerReady,
            onStateChange: handleYouTubePlayerStateChange,
            onError: handleYouTubePlayerError,
          },
        });
      }
    } catch (errs) {
      console.error('YouTube 플레이어 초기화 오류:', errs);
      setError('YouTube 플레이어 초기화 중 오류가 발생했습니다');
      onError?.('YouTube 플레이어 초기화 중 오류가 발생했습니다');
    }
  };

  // YouTube API 초기화
  useEffect(() => {
    // YouTube 영상일 경우에만 API 로드
    if (
      videoInfo.platform === 'youtube' ||
      videoInfo.platform === 'youtube-live'
    ) {
      if (typeof window !== 'undefined') {
        if (!window.YT) {
          // YouTube API 로드
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

          // API 준비 이벤트
          window.onYouTubeIframeAPIReady = initYouTubePlayer;
        } else {
          // API가 이미 로드된 경우
          initYouTubePlayer();
        }
      }
    }

    return () => {
      // 컴포넌트 언마운트 시 플레이어 정리
      if (playerRef.current) {
        try {
          // 인터벌 제거
          if (playerRef.current.timeUpdateInterval) {
            clearInterval(playerRef.current.timeUpdateInterval);
          }
          playerRef.current.destroy();
        } catch (err) {
          console.error('플레이어 정리 오류:', err);
        }
      }
    };
  }, [videoInfo.platform, videoInfo.videoId]);

  // iframe 메시지 이벤트 리스너 (다른 플랫폼 지원)
  useEffect(() => {
    if (
      videoInfo.platform === 'youtube' ||
      videoInfo.platform === 'youtube-live'
    ) {
      return; // YouTube는 자체 API로 처리
    }

    const handleMessage = (event: MessageEvent) => {
      // Vimeo 메시지 처리
      if (videoInfo.platform === 'vimeo') {
        try {
          if (typeof event.data === 'string') {
            const data = JSON.parse(event.data);

            // 준비 완료
            if (data.event === 'ready') {
              setLoading(false);
              onReady?.();

              // Vimeo 플레이어에 시간 업데이트 요청
              if (iframeRef.current) {
                iframeRef.current.contentWindow?.postMessage(
                  {
                    method: 'addEventListener',
                    value: 'timeupdate',
                  },
                  '*',
                );
              }
            }

            // 시간 업데이트
            else if (
              data.event === 'timeupdate' &&
              data.data &&
              data.data.seconds
            ) {
              const time = data.data.seconds;
              onTimeUpdate?.(time);
            }
          }
        } catch {
          // JSON 파싱 오류는 무시 (Vimeo가 아닌 메시지일 수 있음)
        }
      }

      // 다른 플랫폼 메시지 처리 추가 가능
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }

    return undefined;
  }, [videoInfo.platform, onTimeUpdate, onReady]);

  // iframe 로드 완료 핸들러
  const handleIframeLoaded = () => {
    if (
      videoInfo.platform === 'youtube' ||
      videoInfo.platform === 'youtube-live'
    ) {
      return; // YouTube는 자체 API로 처리
    }

    console.log('iframe 로드 완료');
    setLoading(false);
    onReady?.();
  };

  // YouTube API 사용 렌더링
  if (
    videoInfo.platform === 'youtube' ||
    videoInfo.platform === 'youtube-live'
  ) {
    return (
      <div className="relative w-full aspect-video bg-black">
        <div
          id="youtube-player-container"
          className="absolute inset-0 w-full h-full"
        >
          {/* YouTube API가 여기에 플레이어 삽입 */}
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-white text-center p-4 max-w-md bg-red-900 bg-opacity-75 rounded">
              <p className="font-bold mb-1">오류 발생</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {isLive && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-sm">
            LIVE
          </div>
        )}
      </div>
    );
  }

  // 일반 iframe 렌더링 (다른 플랫폼)
  return (
    <div className="relative w-full aspect-video bg-black">
      {embedUrl ? (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onLoad={handleIframeLoaded}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-center p-4">
            <p className="font-bold mb-1">지원되지 않는 비디오 형식</p>
            <p className="text-sm text-gray-400">{videoUrl}</p>
          </div>
        </div>
      )}

      {loading && embedUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
        </div>
      )}

      {isLive && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-sm">
          LIVE
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
