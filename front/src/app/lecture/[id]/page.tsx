'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from 'react-resizable-panels';

// 유튜브 플레이어 컴포넌트 임포트
const YouTubePlayer = dynamic(() => import('@/components/YouTubePlayer'), {
  ssr: false,
});

// 에디터 컴포넌트 동적 임포트
const Editor = dynamic(() => import('@/components/note/Editor'), {
  ssr: false,
  loading: () => <div className="p-4">에디터 로딩 중...</div>
});

function LecturePage() {
  const params = useParams();
  const videoId = params.id as string;
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
      <PanelGroup direction={isMobile ? "vertical" : "horizontal"} className="flex-grow w-full overflow-hidden">
        <Panel defaultSize={50} minSize={20}>
          <div className="h-full flex flex-col">
            <div className="flex-grow relative bg-black">
              <YouTubePlayer 
                videoId={videoId} 
                onTimeUpdate={handleTimeUpdate} 
              />
            </div>
            <div className="p-2 bg-gray-100 border-t border-gray-200 flex justify-center">
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                onClick={addTimestamp}
              >
                현재 시간 타임스탬프 추가
              </button>
            </div>
          </div>
        </Panel>
        
        <PanelResizeHandle>
          <div className={isMobile ? "h-2 w-full cursor-row-resize" : "w-2 h-full cursor-col-resize"}>
            <div className={`bg-gray-300 rounded absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
              isMobile ? "h-1 w-10" : "w-1 h-10"
            }`} />
          </div>
        </PanelResizeHandle>
        
        <Panel defaultSize={50} minSize={20}>
          <div className="h-full w-full overflow-hidden">
            <Editor 
              ref={editorRef} 
              videoId={videoId} 
              initialTimestamp={currentTime}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default LecturePage;