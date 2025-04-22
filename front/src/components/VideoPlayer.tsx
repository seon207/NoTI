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
export { };

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

  // Google Analytics 관련 변수들
  const lastTimePositionRef = useRef<number>(0);
  const lastEventTimeRef = useRef<number>(0);


  const gaTrackingId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

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

    // 재생 위치 추적 및 GA 이벤트 발생
    const currentTime = Math.floor(event.target.getCurrentTime());
    trackPlaybackPosition(currentTime);
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
        playerDiv.style.width = '100%';
        playerDiv.style.height = '100%';
        container.appendChild(playerDiv);

        // YouTube 플레이어 생성 - 크기 지정 추가
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
          width: '100%', // 명시적으로 너비 설정
          height: '100%', // 명시적으로 높이 설정
        });
      }
    } catch (err) {
      console.error('YouTube 플레이어 초기화 오류:', err);
      setError('YouTube 플레이어 초기화 중 오류가 발생했습니다');
      onError?.('YouTube 플레이어 초기화 중 오류가 발생했습니다');
    }
  };

  // Google Anayltics 초기화
  useEffect(() => {
    // 측정 ID가 없으면 초기화 중단
    if (!gaTrackingId) {
      console.log("GA 측정 ID가 설정되지 않았습니다. 환경변수 NEXT_PUBLIC_GOOGLE_ANALYTICS_ID를 확인하세요");
      return;
    }

    // GA4가 이미 초기화되었는지 확인
    if (typeof window.gtag === 'function') return;

    // GA4 스크립트 추가
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`;
    document.head.appendChild(script);

    // GA4 초기화 코드
    window.dataLayer = window.dataLayer || [];
    function gtag(..._args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date()); // GA4 추적 시작

    // 로컬 호스트에서는 디버그 모드로 설정
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      gtag('config', gaTrackingId, {
        'debug_mode': true,
        'send_page_view': false
      });
      console.info('Google Analytics가 디버그 모드로 초기화되었습니다.');
    } else {
      gtag('config', gaTrackingId, {
        'send_page_view': false
      });
    }

    // gtag 함수를 전역 함수로 설정
    window.gtag = gtag;
  })

  // 시간 구간 계산 (5분 단위)
  const timeSegementLabel = (currentTime: number): string => {
    const timeSegement = Math.floor(currentTime / 5) * 5;

    return `${timeSegement}-${timeSegement + 5}`;
  }

  // 재생 위치 추적 및 GA 이벤트 발생 (시크 감지용 - 시크: 영상 내 이동)
  const trackPlaybackPosition = (currentTimePosition: number) => {
    const currentTimeInt = Math.floor(currentTimePosition);
    const lastTimeInt = Math.floor(lastTimePositionRef.current);
    const timeLabel = timeSegementLabel(currentTimeInt);

    const videoId = playerRef.current?.getVideoData().video_id;
    const video_title = playerRef.current?.getVideoData().title;

    if (currentTimeInt <= 2 && lastTimeInt > 2) {
      sendGAEvent('video_restart', {
        video_id: videoId,
        video_title: playerRef.current?.getVideoData()?.title || 'Unknown',
        from_position: lastTimeInt,
        time_label: timeLabel
      });
    }
    // 시간 변화가 크면 사용자가 앞/뒤로 이동했다고 판단 (3초 이상 차이)
    else if (Math.abs(currentTimeInt - lastTimeInt) > 3) {
      // 현재 시간에서 마지막 시간을 빼서 양수면 앞으로, 음수면 뒤로 이동
      if (currentTimeInt > lastTimeInt) {
        sendGAEvent('video_forward', {
          video_id: videoId,
          video_title: video_title,
          from_position: lastTimeInt,
          to_position: currentTimeInt,
          seek_amount: currentTimeInt - lastTimeInt,
          time_label: timeLabel
        });
      } else {
        sendGAEvent('video_backward', {
          video_id: videoId,
          video_title: video_title,
          from_position: lastTimeInt,
          to_position: currentTimeInt,
          seek_amount: lastTimeInt - currentTimeInt,
          time_label: timeLabel
        });
      }
    }
    lastTimePositionRef.current = currentTimePosition;
  };

  // GA 이벤트 전송 함수 (중복 방지 로직 포함)
  // 빠르게 연속해서 발생할 수 있는 이벤트(예: 시크 바 드래그, 빠른 클릭)가 GA에 중복 전송되는 것을 방지
  const sendGAEvent = (eventName: string, params: any) => {
    // 측정 ID가 없으면 이벤트 전송 중단
    if (!gaTrackingId) return;

    const now = Date.now();

    // 300ms 내에 동일한 이벤트가 발생하지 않도록 방지 (중복 방지)
    if (now - lastEventTimeRef.current < 300) {
      return;
    }

    // GA4 이벤트 전송
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
      console.log(`GA 이벤트 전송: ${eventName}`, params);
    }

    lastEventTimeRef.current = now;
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
      <div className="relative w-full h-full overflow-hidden bg-black">
        <div
          id="youtube-player-container"
          className="absolute inset-0 w-full h-full"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
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
    <div className="relative w-full h-full overflow-hidden bg-black">
      {embedUrl ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover', // contain에서 cover로 변경
            }}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={handleIframeLoaded}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-center p-4">
            <p className="font-bold mb-1">지원되지 않는 비디오 형식</p>
            <p className="text-sm text-gray-400">{videoUrl}</p>
          </div>
        </div>
      )}

      {/* 로딩 및 에러 표시는 그대로 유지 */}

      {/* 추가할 글로벌 스타일 */}
      <style jsx global>{`
        .video-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%; /* 16:9 비율 (100% / 16 * 9) */
          overflow: hidden;
        }

        /* 다양한 비율에 대응하기 위한 클래스들 */
        .video-container.ratio-4-3 {
          padding-bottom: 75%; /* 4:3 비율 */
        }

        .video-container.ratio-1-1 {
          padding-bottom: 100%; /* 1:1 비율 */
        }

        .video-container iframe,
        .video-container video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain; /* 영상 비율 유지 */
        }
      `}</style>
    </div>
  );
}

export default VideoPlayer;
