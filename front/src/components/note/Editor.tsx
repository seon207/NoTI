'use client';

import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import {
  GridSuggestionMenuController,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from '@blocknote/react';
import { MdCancel, MdCheckCircle, MdError, MdInfo, MdTimer, MdAutoFixHigh } from 'react-icons/md';
import { createHighlighter } from 'public/shiki.bundle';
import { forwardRef, useImperativeHandle, useEffect, useState, useCallback, ForwardedRef } from 'react';
import { AISuggestion } from '@/types/aiType';
import { generateAISuggestion, getBlockText } from '@/service/aiSuggestionService';
import AISuggestionButton from '@/components/ai/AISuggestionButton';
import { Alert, AlertType } from './Alert';

// 에디터 props 정의
interface EditorProps {
  videoId?: string;
  initialTimestamp?: number;
}

// 스키마 생성
const schema = BlockNoteSchema.create({
  blockSpecs: {
    // 기본 블록 스펙
    ...defaultBlockSpecs,
    // Alert 블록 추가
    alert: Alert,
  },
});

// forwardRef를 사용하여 부모 컴포넌트에서 메서드에 접근할 수 있게 함
function Editor(props: EditorProps, ref: ForwardedRef<{ addTimestamp: (_time: number) => void }>) {
  const { videoId, initialTimestamp = 0 } = props;
  const [storageKey, setStorageKey] = useState<string>('default-note');
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, AISuggestion>>({});
  
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // 비디오 ID에 따라 저장 키 업데이트
  useEffect(() => {
    if (videoId) {
      setStorageKey(`note-${videoId}`);
    }
  }, [videoId]);

  // 로컬스토리지에서 저장된 내용 불러오기
  function getSavedContent() {
    try {
      const savedContent = localStorage.getItem(storageKey);
      if (savedContent) {
        return JSON.parse(savedContent);
      }
    } catch (error) {
      console.error('노트 불러오기 실패:', error);
    }
    
    // 기본 내용
    return [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '여기에 필기를 시작하세요...',
            styles: {},
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '슬래시(/) 키를 눌러 다양한 서식을 추가해보세요!',
            styles: {},
          },
        ],
      },
    ];
  }

  // 에디터 인스턴스 생성
  const editor = useCreateBlockNote({
    schema,
    codeBlock: {
      indentLineWithTab: true,
      defaultLanguage: 'typescript',
      supportedLanguages: {
        typescript: {
          name: 'TypeScript',
          aliases: ['ts'],
        },
        javascript: {
          name: 'JavaScript',
          aliases: ['js'],
        },
        python: {
          name: 'Python',
          aliases: ['py'],
        },
        java: {
          name: 'Java',
        },
        html: { name: 'HTML' },
        css: { name: 'CSS' },
      },
      // 하이라이터 생성
      createHighlighter: () =>
        createHighlighter({
          themes: ['dark-plus', 'light-plus'],
          langs: ['javascript', 'typescript', 'python', 'java', 'css', 'html'],
        }),
    },
    // 초기 내용 설정
    initialContent: getSavedContent(),
    // 붙여넣기 핸들러 추가
    pasteHandler: ({ event, editor: pasteEditor, defaultPasteHandler }) => {
      console.log('붙여넣기 이벤트 감지:', event.clipboardData?.types);
      
      // 클립보드에 이미지가 있는지 확인
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          // 이미지 타입인지 확인
          if (item.type.startsWith('image/')) {
            console.log('이미지 붙여넣기 감지:', item.type);
            
            // 클립보드에서 이미지 파일 가져오기
            const file = item.getAsFile();
            if (file) {
              // 이미지를 데이터 URL로 변환
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result as string;
                
                // 현재 커서 위치에 이미지 삽입
                const { block } = pasteEditor.getTextCursorPosition();
                pasteEditor.insertBlocks(
                  [
                    {
                      type: 'image',
                      props: { url: dataUrl },
                    },
                  ],
                  block,
                  'after',
                );
                
                console.log('이미지가 에디터에 삽입되었습니다.');
              };
              
              reader.readAsDataURL(file);
              return true; // 이벤트 처리 완료
            }
          }
        }
      }
      
      // 이미지가 아닌 경우 기본 붙여넣기 동작 수행
      return defaultPasteHandler();
    },
  });

  // 외부 메시지 수신을 위한 이벤트 리스너 추가
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 확장 프로그램에서 온 메시지인지 확인
      if (event.data.source === "youtube-capture-extension" && 
          event.data.action === "insertImage") {
        
        // 이미지 데이터 확인
        const { imageData } = event.data;
        
        if (imageData && editor) {
          // 현재 커서 위치에 이미지 삽입
          const { block } = editor.getTextCursorPosition();
          
          // 이미지를 삽입할 새 블록 생성 및 삽입
          editor.insertBlocks(
            [
              {
                type: 'image',
                props: { 
                  url: imageData
                },
              },
            ],
            block,
            'after',
          );
          
          // 타임스탬프도 있으면 함께 추가
          if (event.data.currentTime) {
            const formattedTime = formatTime(event.data.currentTime);
            editor.insertBlocks(
              [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: `[${formattedTime}] 캡처된 이미지`,
                      styles: { bold: true, textColor: '#3b82f6' },
                    },
                  ],
                },
              ],
              block,
              'after',
            );
          }
        }
      }
    };
    
    // 이벤트 리스너 등록
    window.addEventListener('message', handleMessage);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [editor]);

  

  // 컨텐츠 변경 시 자동 저장
  useEffect(() => {
    if (!editor) {
      return undefined; // 명시적으로 반환값 지정
    }

    const saveTimeout = setTimeout(() => {
      const content = editor.document;
      try {
        localStorage.setItem(storageKey, JSON.stringify(content));
      } catch (error) {
        console.error('노트 저장 실패:', error);
      }
    }, 1000);

    return function cleanup() {
      clearTimeout(saveTimeout);
    };
  }, [editor, storageKey]);

  // 타임스탬프 추가 함수
  const addTimestamp = useCallback((time: number) => {
    if (!editor) return;
    
    const formattedTime = formatTime(time);
    const { block } = editor.getTextCursorPosition();
    
    // 현재 커서 위치에 타임스탬프 텍스트 삽입
    editor.insertBlocks(
      [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `[${formattedTime}] `,
              styles: { bold: true, textColor: '#3b82f6' },
            },
          ],
        },
      ],
      block,
      'after',
    );
  }, [editor]);

  // AI 제안 요청 함수
  const requestAISuggestion = useCallback(async (blockId: string) => {
    // 이미 제안을 로딩 중이거나 표시 중인 경우 무시
    if (aiSuggestions[blockId] && (aiSuggestions[blockId].isLoading || aiSuggestions[blockId].isVisible)) {
      return;
    }

    // 블록 내용 가져오기
    const block = editor.getBlock(blockId);
    if (!block) return;

    const blockText = getBlockText(block);
    if (!blockText.trim()) return; // 빈 텍스트인 경우 무시

    // 로딩 상태 설정
    setAiSuggestions((prev) => ({
      ...prev,
      [blockId]: {
        blockId,
        originalText: blockText,
        suggestedText: '',
        isLoading: true,
        isVisible: false,
      },
    }));

    try {
      // AI 제안 생성 (실제로는 API 호출)
      const suggestion = await generateAISuggestion(blockText);
      
      // 제안 저장 및 표시
      setAiSuggestions((prev) => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          suggestedText: suggestion,
          isLoading: false,
          isVisible: true,
        },
      }));
    } catch (error) {
      console.error('AI 제안 생성 실패:', error);
      
      // 오류 상태 설정
      setAiSuggestions((prev) => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          isLoading: false,
          isVisible: false,
        },
      }));
    }
  }, [editor, aiSuggestions]);

  // AI 제안 적용 함수
  const applySuggestion = useCallback((blockId: string) => {
    const suggestion = aiSuggestions[blockId];
    if (!suggestion || !editor) return;

    // 블록 가져오기
    const block = editor.getBlock(blockId);
    if (!block) return;

    // 제안된 텍스트로 블록 내용 업데이트
    editor.updateBlock(block, {
      content: [
        {
          type: 'text',
          text: suggestion.suggestedText,
          styles: {},
        },
      ],
    });

    // 제안 숨기기
    setAiSuggestions((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        isVisible: false,
      },
    }));
  }, [editor, aiSuggestions]);

  // AI 제안 거부 함수
  const dismissSuggestion = useCallback((blockId: string) => {
    setAiSuggestions((prev) => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        isVisible: false,
      },
    }));
  }, []);

  // useImperativeHandle로 부모 컴포넌트에서 접근 가능한 메서드 정의
  useImperativeHandle(ref, () => ({
    addTimestamp
  }), [addTimestamp]);

  // 커스텀 슬래시 메뉴 아이템
  function getCustomSlashMenuItems() {
    const defaultItems = getDefaultReactSlashMenuItems(editor);

    // Alert 아이템 추가
    const customItems = [
      {
        title: '경고 알림',
        onItemClick: () => {
          const { block } = editor.getTextCursorPosition();
          editor.insertBlocks(
            [
              {
                type: 'alert',
                props: { type: 'warning' as AlertType },
              },
            ],
            block,
            'after',
          );
        },
        aliases: ['alert', 'warning', '경고', '주의'],
        group: '알림',
        icon: <MdError size={18} style={{ color: '#e69819' }} />,
        subtext: '경고 알림 블록을 추가합니다.',
      },
      {
        title: '오류 알림',
        onItemClick: () => {
          const { block } = editor.getTextCursorPosition();
          editor.insertBlocks(
            [
              {
                type: 'alert',
                props: { type: 'error' as AlertType },
              },
            ],
            block,
            'after',
          );
        },
        aliases: ['error', '오류', '에러'],
        group: '알림',
        icon: <MdCancel size={18} style={{ color: '#d80d0d' }} />,
        subtext: '오류 알림 블록을 추가합니다.',
      },
      {
        title: '정보 알림',
        onItemClick: () => {
          const { block } = editor.getTextCursorPosition();
          editor.insertBlocks(
            [
              {
                type: 'alert',
                props: { type: 'info' as AlertType },
              },
            ],
            block,
            'after',
          );
        },
        aliases: ['info', '정보', '안내'],
        group: '알림',
        icon: <MdInfo size={18} style={{ color: '#507aff' }} />,
        subtext: '정보 알림 블록을 추가합니다.',
      },
      {
        title: '성공 알림',
        onItemClick: () => {
          const { block } = editor.getTextCursorPosition();
          editor.insertBlocks(
            [
              {
                type: 'alert',
                props: { type: 'success' as AlertType },
              },
            ],
            block,
            'after',
          );
        },
        aliases: ['success', '성공', '완료'],
        group: '알림',
        icon: <MdCheckCircle size={18} style={{ color: '#0bc10b' }} />,
        subtext: '성공 알림 블록을 추가합니다.',
      },
      // 타임스탬프 메뉴 아이템 추가
      {
        title: '타임스탬프',
        onItemClick: () => {
          addTimestamp(initialTimestamp);
        },
        aliases: ['timestamp', '시간', '타임스탬프', 'time'],
        group: '영상',
        icon: <MdTimer size={18} style={{ color: '#3b82f6' }} />,
        subtext: '현재 동영상 시간을 타임스탬프로 추가합니다.',
      },
      // AI 제안 메뉴 아이템 추가
      {
        title: 'AI 제안',
        onItemClick: () => {
          const { block } = editor.getTextCursorPosition();
          if (block) {
            requestAISuggestion(block.id);
          }
        },
        aliases: ['ai', '인공지능', '제안', 'suggestion'],
        group: 'AI',
        icon: <MdAutoFixHigh size={18} style={{ color: '#6366f1' }} />,
        subtext: '현재 블록에 대한 AI 제안을 요청합니다.',
      },
    ];

    return [...defaultItems, ...customItems];
  }

  // 직접 필터링 함수 구현
  function filterItems(items: any[], query: string) {
    if (!query) return items;

    const lowerQuery = query.toLowerCase();

    return items.filter((item) => {
      // 제목 검색
      if (item.title.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // 별칭 검색
      if (item.aliases && Array.isArray(item.aliases)) {
        return item.aliases.some((alias: string) =>
          alias.toLowerCase().includes(lowerQuery),
        );
      }

      return false;
    });
  }

  // BlockNote 커스텀 렌더러 함수
  function CustomBlockComponent(prop: any) {
    const { block } = prop;
    const suggestion = aiSuggestions[block.id];
    
    return (
      <div className="relative group">
        {prop.children}
        <AISuggestionButton
          blockId={block.id}
          blockType={block.type}
          requestAISuggestion={requestAISuggestion}
          suggestion={suggestion}
          applySuggestion={applySuggestion}
          dismissSuggestion={dismissSuggestion}
        />
      </div>
    );
  }
  CustomBlockComponent.displayName = 'CustomBlockComponent';

  // 에디터 렌더링
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-auto">
      <BlockNoteView 
        editor={editor} 
        slashMenu={false}
        className="ai-enabled-editor"
      >
          
          {/* 그리드 제안 메뉴 컨트롤러 */}
          <GridSuggestionMenuController
            triggerCharacter={':'}
            columns={8}
          />

          {/* 슬래시 메뉴 컨트롤러 추가 */}
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query: string) =>
              filterItems(getCustomSlashMenuItems(), query)
            }
          />
        </BlockNoteView>
      </div>
      <div className="p-2 border-t flex justify-between bg-white">
        <button
          type="button"
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          onClick={() => {
            const content = editor.document;
            localStorage.setItem(storageKey, JSON.stringify(content));
          }}
        >
          저장
        </button>
        <div className="flex space-x-2">
          <button
            type="button"
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm flex items-center"
            onClick={() => {
              const { block } = editor.getTextCursorPosition();
              if (block) {
                requestAISuggestion(block.id);
              }
            }}
          >
            <MdAutoFixHigh className="mr-1" /> AI 제안
          </button>
          <button
            type="button"
            className="px-3 py-1 border-1 text-black rounded text-sm flex items-center cursor-pointer"
            onClick={async () => {
              try {
                const content = JSON.stringify(editor.document);
                const response = await fetch('http://localhost:8080/api/download/notion', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ content }),
                });
                if (!response.ok) throw new Error('서버 응답 실패');
                console.log('서버로 전송 성공!');
              } catch (err) {
                console.error('서버 전송 실패', err);
              }
            }}
          >
            Notion
          </button>
          <button
            type="button"
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            onClick={() => addTimestamp(initialTimestamp)}
          >
            타임스탬프 추가
          </button>
        </div>
      </div>
    </div>
  );
}

export default forwardRef<{
  addTimestamp: (_time: number) => void;
}, EditorProps>(Editor);