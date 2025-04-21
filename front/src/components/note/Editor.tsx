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
import {
  MdCancel,
  MdCheckCircle,
  MdError,
  MdInfo,
  MdTimer,
  MdCamera,
  MdVideocam,
} from 'react-icons/md';
import { createHighlighter } from 'public/shiki.bundle';
import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
  useCallback,
  ForwardedRef,
} from 'react';
import { Alert, AlertType } from './Alert';

// 에디터 props 정의
interface EditorProps {
  videoId?: string;
  initialTimestamp?: number;
  title?: string;
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
function Editor(
  props: EditorProps,
  ref: ForwardedRef<{ addTimestamp: (_time: number) => void }>,
) {
  const { videoId, initialTimestamp = 0, title = '새 노트' } = props;
  const [storageKey, setStorageKey] = useState<string>('default-note');
  const [noteTitle, setNoteTitle] = useState<string>(title || '새 노트');
  const [isTitleDefault, setIsTitleDefault] = useState<boolean>(
    title === '새 노트',
  );
  const [isExtensionAvailable, setIsExtensionAvailable] = useState<boolean>(false);

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

  // 익스텐션 존재 여부 확인
  useEffect(() => {
    // 익스텐션이 설치되어 있는지 확인하는 메시지 보내기
    window.postMessage(
      {
        source: 'youtube-note-app',
        action: 'checkExtension',
      },
      '*'
    );

    // 응답 이벤트 리스닝
    const checkExtensionListener = (event: MessageEvent) => {
      if (
        event.data.source === 'youtube-capture-extension' &&
        event.data.action === 'extensionAvailable'
      ) {
        setIsExtensionAvailable(true);
        console.log('익스텐션이 감지되었습니다.');
      }
    };

    window.addEventListener('message', checkExtensionListener);

    // 3초 후에 타임아웃 체크 (응답이 없으면 익스텐션이 없는 것으로 간주)
    const timeoutId = setTimeout(() => {
      if (!isExtensionAvailable) {
        console.log('익스텐션을 찾을 수 없습니다.');
      }
    }, 3000);

    return () => {
      window.removeEventListener('message', checkExtensionListener);
      clearTimeout(timeoutId);
    };
  }, []);

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

    // 기본 내용 - 첫 번째 안내 메시지만 포함
    return [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '여기에 필기를 시작하세요...',
            styles: { textColor: '#dfe2e6' },
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
      if (
        event.data.source === 'youtube-capture-extension' &&
        event.data.action === 'insertImage'
      ) {
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
                  url: imageData,
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

  // 에디터 블록 업데이트 시 기본 문구 제거 처리
  useEffect(() => {
    if (!editor) return;

    // 블록에 포커스될 때 기본 문구 제거 처리
    const handleSelectionChange = () => {
      // 현재 선택된 블록 확인
      const { block } = editor.getTextCursorPosition();
      if (!block) return;

      // 선택된 블록의 내용 확인
      const content = editor.getBlock(block.id);
      if (
        content &&
        content.type === 'paragraph' &&
        content.content.length === 1 &&
        content.content[0].type === 'text' &&
        content.content[0].text === '여기에 필기를 시작하세요...'
      ) {
        // 기본 문구 지우기
        editor.updateBlock(block, {
          content: [
            {
              type: 'text',
              text: '',
              styles: {},
            },
          ],
        });
      }
    };

    // 에디터 클릭 이벤트 리스너 추가
    document
      .querySelector('.bn-container')
      ?.addEventListener('click', handleSelectionChange);

    return () => {
      // 클린업 함수
      document
        .querySelector('.bn-container')
        ?.removeEventListener('click', handleSelectionChange);
    };
  }, [editor]);

  // 타임스탬프 추가 함수
  const addTimestamp = useCallback(
    (time: number) => {
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
    },
    [editor],
  );

  // 영역 캡처 요청 함수
  const requestAreaCapture = useCallback(() => {
    if (!isExtensionAvailable) {
      // 익스텐션이 없는 경우 알림
      alert('영상 캡처 확장 프로그램이 설치되어 있지 않습니다. 확장 프로그램을 설치해주세요.');
      return;
    }

    // 익스텐션에 영역 캡처 요청 메시지 전송
    window.postMessage(
      {
        source: 'youtube-note-app',
        action: 'requestAreaCapture',
      },
      '*'
    );

    console.log('영역 캡처 요청 메시지 전송');
  }, [isExtensionAvailable]);

  // 영상 전체 캡처 요청 함수
  const requestVideoCapture = useCallback(() => {
    if (!isExtensionAvailable) {
      // 익스텐션이 없는 경우 알림
      alert('영상 캡처 확장 프로그램이 설치되어 있지 않습니다. 확장 프로그램을 설치해주세요.');
      return;
    }

    // 익스텐션에 영상 전체 캡처 요청 메시지 전송
    window.postMessage(
      {
        source: 'youtube-note-app',
        action: 'requestVideoCapture',
      },
      '*'
    );

    console.log('영상 전체 캡처 요청 메시지 전송');
  }, [isExtensionAvailable]);

  // 제목 클릭/포커스 시 기본 텍스트 초기화
  const handleTitleFocus = useCallback(() => {
    if (isTitleDefault) {
      setNoteTitle('');
      setIsTitleDefault(false);
    }
  }, [isTitleDefault]);

  // useImperativeHandle로 부모 컴포넌트에서 접근 가능한 메서드 정의
  useImperativeHandle(
    ref,
    () => ({
      addTimestamp,
    }),
    [addTimestamp],
  );

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
      // 영역 캡처 메뉴 아이템 추가
      {
        title: '영역 캡처',
        onItemClick: requestAreaCapture,
        aliases: ['capture', '캡처', '영역', 'area'],
        group: '캡처',
        icon: <MdCamera size={18} style={{ color: '#f59e0b' }} />,
        subtext: '화면의 원하는 영역을 캡처합니다.',
      },
      // 영상 전체 캡처 메뉴 아이템 추가
      {
        title: '영상 전체 캡처',
        onItemClick: requestVideoCapture,
        aliases: ['video', '영상', '전체', 'full'],
        group: '캡처',
        icon: <MdVideocam size={18} style={{ color: '#ef4444' }} />,
        subtext: '현재 영상 전체를 캡처합니다.',
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
    return (
      <div className="relative group">
        {prop.children}
      </div>
    );
  }
  CustomBlockComponent.displayName = 'CustomBlockComponent';

  // 에디터 렌더링
  return (
    <div className="h-full flex flex-col m-4">
      {/* 제목 영역 추가 */}
      <div className="mb-6">
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          onFocus={handleTitleFocus}
          onClick={handleTitleFocus}
          className="w-full px-4 py-3 text-2xl font-bold border-b-2 border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors duration-200"
          placeholder="노트 제목을 입력하세요"
          aria-label="노트 제목"
        />
      </div>

      <div className="flex-grow overflow-auto">
        <BlockNoteView
          editor={editor}
          slashMenu={false}
          className="capture-enabled-editor"
        >
          {/* 그리드 제안 메뉴 컨트롤러 */}
          <GridSuggestionMenuController triggerCharacter={':'} columns={8} />

          {/* 슬래시 메뉴 컨트롤러 추가 */}
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query: string) =>
              filterItems(getCustomSlashMenuItems(), query)
            }
          />
        </BlockNoteView>
      </div>
      <div className="mt-4 p-3 border-t flex justify-between bg-white shadow-sm">
        <button
          type="button"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors duration-200"
          onClick={() => {
            const content = editor.document;
            localStorage.setItem(storageKey, JSON.stringify(content));
            // 제목도 함께 저장
            localStorage.setItem(`${storageKey}-title`, noteTitle);
          }}
        >
          저장
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded text-sm font-medium flex items-center transition-colors duration-200"
            onClick={requestAreaCapture}
            title="화면의 원하는 영역을 캡처합니다"
          >
            <MdCamera className="mr-2" /> 영역 캡처
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium flex items-center transition-colors duration-200"
            onClick={requestVideoCapture}
            title="현재 영상 전체를 캡처합니다"
          >
            <MdVideocam className="mr-2" /> 영상 전체 캡처
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium flex items-center cursor-pointer transition-colors duration-200"
          >
            Notion 내보내기
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex items-center transition-colors duration-200"
            onClick={() => addTimestamp(initialTimestamp)}
          >
            <MdTimer className="mr-2" /> 타임스탬프 추가
          </button>
        </div>
      </div>
    </div>
  );
}

export default forwardRef<
  {
    addTimestamp: (_time: number) => void;
  },
  EditorProps
>(Editor);