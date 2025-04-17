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
import { MdCancel, MdCheckCircle, MdError, MdInfo } from 'react-icons/md';
// 커스텀 Alert 컴포넌트 임포트
import { createHighlighter } from 'public/shiki.bundle';
import { Alert, AlertType } from './Alert';
// 상대 경로로 shiki.bundle.js 임포트

// 스키마 생성
const schema = BlockNoteSchema.create({
  blockSpecs: {
    // 기본 블록 스펙
    ...defaultBlockSpecs,
    // Alert 블록 추가
    alert: Alert,
  },
});

export default function Editor() {
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
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '슬래시(/) 키를 눌러 알림 블록을 추가해보세요!',
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
    ],
  });

  // 커스텀 슬래시 메뉴 아이템
  function getCustomSlashMenuItems() {
    const defaultItems = getDefaultReactSlashMenuItems(editor);

    // Alert 아이템 추가
    const alertItems = [
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
    ];

    return [...defaultItems, ...alertItems];
  }

  // 직접 필터링 함수 구현
  // filterSuggestionItems가 @blocknote/react에서 export되지 않는 문제 해결
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

  // 에디터 렌더링
  return (
    <BlockNoteView editor={editor} slashMenu={false}>
      {/* 그리드 제안 메뉴 컨트롤러 */}
      <GridSuggestionMenuController
        triggerCharacter={':'}
        columns={8} // 원하는 열 수로 조정
      />

      {/* 슬래시 메뉴 컨트롤러 추가 */}
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query: string) =>
          filterItems(getCustomSlashMenuItems(), query)
        }
      />
    </BlockNoteView>
  );
}
