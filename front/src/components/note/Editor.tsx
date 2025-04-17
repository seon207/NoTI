'use client';

import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import {
  GridSuggestionMenuController,
  useCreateBlockNote,
  FormattingToolbarController,
  blockTypeSelectItems,
  BlockTypeSelectItem,
  FormattingToolbar,
} from '@blocknote/react';
import { RiAlertFill } from 'react-icons/ri';
// 커스텀 Alert 컴포넌트 임포트 (Alert.tsx에서 만든 컴포넌트)
import { createHighlighter } from 'public/shiki.bundle';
import { Alert } from './Alert';
// 상대 경로로 shiki.bundle.js 임포트

const schema = BlockNoteSchema.create({
  blockSpecs: {
    // Adds all default blocks.
    ...defaultBlockSpecs,
    // Adds the Alert block.
    alert: Alert,
  },
});

export default function Editor() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    schema, // 스키마 추가
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
    initialContent: [
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
        type: 'codeBlock',
        props: {
          language: 'typescript',
        },
        content: [
          {
            type: 'text',
            text: '// 코드 예시\nconst x = 3 * 4;\nconsole.log(`결과: $\\{x}`);\n',
            styles: {},
          },
        ],
      },
      {
        type: 'alert',
        props: {
          type: 'info', // 기본 알림 타입
        },
        content: [
          {
            type: 'text',
            text: '이것은 알림 블록입니다. 중요한 정보를 강조하는 데 사용하세요.',
            styles: {},
          },
        ],
      },
    ],
  });

  // 에디터 렌더링
  return (
    <BlockNoteView editor={editor} formattingToolbar={false}>
      {/* 그리드 제안 메뉴 컨트롤러 */}
      <GridSuggestionMenuController
        triggerCharacter={':'}
        columns={8} // 원하는 열 수로 조정
      />
      
      {/* 포맷팅 툴바 컨트롤러 추가 */}
      <FormattingToolbarController
        formattingToolbar={() => (
          <FormattingToolbar
            // 블록 타입 선택 항목 설정
            blockTypeSelectItems={[
              // 기본 블록 타입 선택 항목
              ...blockTypeSelectItems(editor.dictionary),
              // Alert 블록 항목 추가
              {
                name: '알림',
                type: 'alert',
                icon: RiAlertFill,
                isSelected: (block) => block.type === 'alert',
              } satisfies BlockTypeSelectItem,
            ]}
          />
        )}
      />
    </BlockNoteView>
  );
}