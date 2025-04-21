'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

// 커스텀 비디오 플레이어 컴포넌트 임포트
const CustomVideoPlayer = dynamic(
  () => import('@/components/CustomVideoPlayer'),
  {
    ssr: false,
  },
);

// 에디터 컴포넌트 동적 임포트
const Editor = dynamic(() => import('@/components/note/Editor'), {
  ssr: false,
  loading: () => <div className="p-4">에디터 로딩 중...</div>,
});

interface VideoData {
  videoUrl: string;
  title: string;
  thumbnail?: string;
  duration?: number;
}

function WatchPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v');
  const directUrl = searchParams.get('url');

  // YouTube인 경우와 그 외의 경우 분기
  const videoUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : directUrl || '';

  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
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

  // 비디오 데이터 로드
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoUrl) {
        setError('유효한 URL이 제공되지 않았습니다');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('API 요청 URL:', videoUrl);

        const response = await fetch('/api/extract-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: videoUrl }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || '비디오 정보를 가져오는데 실패했습니다',
          );
        }

        const data = await response.json();
        console.log('비디오 데이터 받음:', data);
        setVideoData(data);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        );
      } finally {
        setLoading(false);
      }
    };

    if (videoUrl) {
      fetchVideoData();
    }
  }, [videoUrl]);

  // 동영상 시간 업데이트 핸들러
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // 타임스탬프 추가 핸들러
  const addTimestamp = () => {
    // 에디터 ref를 통해 addTimestamp 메서드에 접근
    if (editorRef.current?.addTimestamp) {
      editorRef.current.addTimestamp(currentTime);
    }
  };

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

              {videoData && (
                <CustomVideoPlayer
                  videoUrl={videoData.videoUrl}
                  title={videoData.title}
                  onTimeUpdate={handleTimeUpdate}
                />
              )}
            </div>
            <div className="p-2 bg-gray-100 border-t border-gray-200 flex justify-center">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                onClick={addTimestamp}
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
