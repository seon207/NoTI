'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

const WebexMeeting = dynamic(() => import('@/components/WebexMeeting'), {
  ssr: false,
});
// 에디터 컴포넌트 동적 임포트
const Editor = dynamic(() => import('@/components/note/Editor'), {
  ssr: false,
  loading: () => <div className="p-4">에디터 로딩 중...</div>,
});

export default function LecturePage() {
  const params = useParams();
  const meetingDest = params.id as string;
  const [currentTime] = useState<number>(0);
  const editorRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // (참고) 타임스탬프 추가 핸들러
  const addTimestamp = () => {
    if (editorRef.current?.addTimestamp) {
      editorRef.current.addTimestamp(currentTime);
    }
  };

  const [token, setToken] = useState('');
  useEffect(() => {
    if (!token) {
      const t = prompt('Webex Access Token을 입력하세요');
      if (t) setToken(t);
    }
  }, [token]);

  return (
    <div className="flex flex-col h-screen">
      <PanelGroup
        direction={isMobile ? 'vertical' : 'horizontal'}
        className="flex-grow w-full overflow-hidden"
      >
        {/* Webex Meeting 화면 */}
        <Panel defaultSize={50} minSize={20}>
          <div className="h-full flex flex-col">
            <div className="flex-grow relative bg-black">
              {token && (
                <WebexMeeting
                  destination={"https://meet337.webex.com/meet337/j.php?MTID=m6efb4d75c7fe7983d0487c8bb4a2691d"}
                  accessToken={token}
                />
              )}
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

        {/* 분할바 */}
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

        {/* 노트 에디터 */}
        <Panel defaultSize={50} minSize={20}>
          <div className="h-full w-full overflow-hidden">
            <Editor
              ref={editorRef}
              videoId={meetingDest}
              initialTimestamp={currentTime}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
