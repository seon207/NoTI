'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

// 컴포넌트 동적 임포트
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  ssr: false,
});

const Editor = dynamic(() => import('@/components/note/Editor'), {
  ssr: false,
  loading: () => <div className="p-4">에디터 로딩 중...</div>,
});

// interface VideoData {
//   title: string;
//   videoId?: string;
//   platform?: string;
//   isLive?: boolean;
// }

function WatchPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v') || undefined; // null을 undefined로 변환
  const directUrl = searchParams.get('url');
  const platform = searchParams.get('platform') || '';
  const title = searchParams.get('title') || '영상 제목';
  const isLive = searchParams.get('live') === '1';
  const initialTime = searchParams.get('t')
    ? parseInt(searchParams.get('t') || '0', 10)
    : 0;

  // 비디오 URL 결정
  const videoUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : directUrl || '';

  const videoData = {
    title: title || '영상 제목',
    videoId,
    platform: platform || (videoId ? 'youtube' : ''),
    isLive,
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const editorRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);


  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 초기 설정
    handleResize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', handleResize);

    // 클린업 함수
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 동영상 시간 업데이트 핸들러
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // 플레이어 에러 핸들러
  const handlePlayerError = (err: string) => {
    setError(err);
  };

  // 플레이어 준비 완료 핸들러
  const handlePlayerReady = () => {
    setLoading(false);
  };

  // 스크린샷 캡처 이벤트 리스너
  useEffect(() => {
    const handleCaptureScreenshot = (event: CustomEvent) => {
      const { image, time } = event.detail;
      if (image && editorRef.current?.insertImage) {
        editorRef.current.insertImage(image, time);
      }
    };

    window.addEventListener(
      'capture-screenshot' as any,
      handleCaptureScreenshot as any,
    );

    return () => {
      window.removeEventListener(
        'capture-screenshot' as any,
        handleCaptureScreenshot as any,
      );
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <PanelGroup
        direction={isMobile ? 'vertical' : 'horizontal'}
        className="flex-grow w-full overflow-hidden"
      >
        <Panel defaultSize={50} minSize={20}>
          <div className="h-full flex flex-col">
            {/* 여기서 flex-grow를 제거하고 h-full을 추가합니다 */}
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-white z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-red-900/50 z-10">
                  <div className="bg-red-800 p-4 rounded-lg max-w-md">
                    <h3 className="font-bold mb-2">오류 발생</h3>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* VideoPlayer를 감싸는 div에 높이와 너비를 100%로 설정합니다 */}
              {videoUrl && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-full" style={{ maxWidth: '100%' }}>
                    <VideoPlayer
                      videoUrl={videoUrl}
                      videoId={videoData.videoId}
                      platform={videoData.platform}
                      title={videoData.title}
                      isLive={videoData.isLive}
                      onTimeUpdate={handleTimeUpdate}
                      onReady={handlePlayerReady}
                      onError={handlePlayerError}
                      initialTime={initialTime}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Panel>
        <PanelResizeHandle>
          <div
            className={
              isMobile
                ? 'h-4 w-full cursor-row-resize bg-gray-200 flex items-center justify-center'
                : 'w-3 h-full cursor-col-resize bg-gray-200 flex items-center justify-center'
            }
          >
            {/* 절대 위치 사용하지 않고 Flexbox로 중앙 정렬 */}
            <div
              className={
                isMobile
                  ? 'h-1 w-4 bg-gray-400 rounded'
                  : 'w-1 h-12 bg-gray-400 rounded'
              }
            />
          </div>
        </PanelResizeHandle>
        <Panel defaultSize={50} minSize={20}>
          <div className="h-full w-full overflow-hidden">
            {/* isResizing 상태를 Editor에 전달 */}
            <Editor
              ref={editorRef}
              videoId={videoUrl}
              initialTimestamp={currentTime}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default WatchPage;
