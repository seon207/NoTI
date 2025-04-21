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

  // 타임스탬프 추가 핸들러
  const handleAddTimestamp = () => {
    // 에디터 ref를 통해 addTimestamp 메서드에 접근
    if (editorRef.current?.addTimestamp) {
      editorRef.current.addTimestamp(currentTime);
    }
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
            <div className="flex-grow relative bg-black">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-red-900/50">
                  <div className="bg-red-800 p-4 rounded-lg max-w-md">
                    <h3 className="font-bold mb-2">오류 발생</h3>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {videoUrl && (
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
              )}
            </div>
            <div className="p-2 bg-gray-100 border-t border-gray-200 flex justify-center">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                onClick={handleAddTimestamp}
                disabled={loading || !!error}
              >
                현재 시간 타임스탬프 추가
              </button>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle>
          <div
            className={
              isMobile
                ? 'h-2 w-full cursor-row-resize'
                : 'w-2 h-full cursor-col-resize'
            }
          >
            <div
              className={`bg-gray-300 rounded absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                isMobile ? 'h-1 w-10' : 'w-1 h-10'
              }`}
            />
          </div>
        </PanelResizeHandle>

        <Panel defaultSize={50} minSize={20}>
          <div className="h-full w-full overflow-hidden">
            <Editor
              ref={editorRef}
              videoId={videoUrl} // 여기서는 URL을 ID로 사용
              initialTimestamp={currentTime}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default WatchPage;
