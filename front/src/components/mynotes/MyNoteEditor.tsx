'use client';

import {
  BlockNoteSchema,
  defaultBlockSpecs,
} from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import {
  GridSuggestionMenuController,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
  DefaultReactSuggestionItem,
} from '@blocknote/react';

import {
  MdSave,
} from 'react-icons/md';
import { createHighlighter } from 'public/shiki.bundle';
import { useState, useEffect, useCallback } from 'react';

interface EditorProps {
  videoId?: string;
  initialTimestamp?: number;
  title?: string;
  initialContent?: any[];
  viewOnly?: boolean;
  // eslint-disable-next-line no-unused-vars
  onSave?: (content: any, title: string) => void;
}

// BlockNote schema definition
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs
  },
});

export default function MyNoteEditor(props: EditorProps) {
  const {
    title = '새 노트',
    initialContent,
    onSave,
    viewOnly = false,
  } = props;

  const [storageKey] = useState<string>('default-note');
  const [noteTitle, setNoteTitle] = useState<string>(title);
  const [isTitleDefault, setIsTitleDefault] = useState<boolean>(
    title === '새 노트'
  );

  function getInitialContent() {
    if (initialContent && initialContent.length > 0) return initialContent;

    try {
      const savedContent = localStorage.getItem(storageKey);
      if (savedContent) return JSON.parse(savedContent);
    } catch (error) {
      console.error('노트 불러오기 실패:', error);
    }

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

  const editor = useCreateBlockNote({
    schema,
    codeBlock: {
      indentLineWithTab: true,
      defaultLanguage: 'typescript',
      supportedLanguages: {
        typescript: { name: 'TypeScript', aliases: ['ts'] },
        javascript: { name: 'JavaScript', aliases: ['js'] },
        python: { name: 'Python', aliases: ['py'] },
        java: { name: 'Java' },
        html: { name: 'HTML' },
        css: { name: 'CSS' },
      },
      createHighlighter: () =>
        createHighlighter({
          themes: ['dark-plus', 'light-plus'],
          langs: ['javascript', 'typescript', 'python', 'java', 'css', 'html'],
        }),
    },
    initialContent: getInitialContent(),
    pasteHandler: ({ event, editor: pasteEditor, defaultPasteHandler }) => {
      if (viewOnly) return false;
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result as string;
                const { block } = pasteEditor.getTextCursorPosition();
                if (block) {
                  pasteEditor.insertBlocks(
                    [{ type: 'image', props: { url: dataUrl } }],
                    block,
                    'after'
                  );
                }
              };
              reader.readAsDataURL(file);
              return true;
            }
          }
        }
      }
      return defaultPasteHandler();
    },
  });

  useEffect(() => {
    if (!editor || viewOnly) return;
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(editor.document));
        localStorage.setItem(`${storageKey}-title`, noteTitle);
      } catch (e) {
        console.error('노트 자동 저장 실패:', e);
      }
    }, 2000);
    return () => clearTimeout(saveTimeout);
  }, [editor, noteTitle, storageKey, viewOnly]);

  useEffect(() => {
    if (!editor || viewOnly) return;

    const handleSelectionChange = () => {
      const cursorPosition = editor.getTextCursorPosition();
      if (!cursorPosition || !cursorPosition.block) return;
      
      const { block } = cursorPosition;
      const content = editor.getBlock(block.id);
      if (!content) return;
      
      const blockContent = content.content as any[];

      if (
        content &&
        content.type === 'paragraph' &&
        Array.isArray(blockContent) &&
        blockContent.length === 1 &&
        blockContent[0]?.type === 'text' &&
        blockContent[0]?.text === '여기에 필기를 시작하세요...'
      ) {
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

    const container = document.querySelector('.bn-container');
    if (container) {
      container.addEventListener('click', handleSelectionChange);
    }

    return () => {
      if (container) {
        container.removeEventListener('click', handleSelectionChange);
      }
    };
  }, [editor, viewOnly]);

  const handleTitleFocus = useCallback(() => {
    if (isTitleDefault) {
      setNoteTitle('');
      setIsTitleDefault(false);
    }
  }, [isTitleDefault]);

  const handleSaveClick = useCallback(() => {
    if (!editor) return;
    try {
      const content = editor.document;
      localStorage.setItem(storageKey, JSON.stringify(content));
      localStorage.setItem(`${storageKey}-title`, noteTitle);
      if (onSave) onSave(content, noteTitle);
    } catch (e) {
      console.error('노트 저장 실패:', e);
      alert('노트 저장에 실패했습니다.');
    }
  }, [editor, noteTitle, storageKey, onSave]);

  const getCustomSlashMenuItems = useCallback(() => {
    if (!editor || viewOnly) return [];
    
    const defaultItems = getDefaultReactSlashMenuItems(editor);

    return [...defaultItems];
  }, [editor, viewOnly]);

  const filterItems = useCallback((items: DefaultReactSuggestionItem[], query: string) => {
    if (!query) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter((item) => 
      item.title.toLowerCase().includes(lowerQuery) ||
      (Array.isArray(item.aliases) &&
        item.aliases.some((alias) =>
          alias.toLowerCase().includes(lowerQuery)
        ))
    );
  }, []);

  return (
    <div className="h-full flex flex-col m-4">
      <div className="mb-6">
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          onFocus={handleTitleFocus}
          onClick={handleTitleFocus}
          className={`w-full px-4 py-3 text-2xl font-bold border-b-2 border-gray-200 ${
            !viewOnly
              ? 'focus:outline-none focus:border-indigo-500'
              : 'bg-transparent cursor-default'
          } transition-colors duration-200`}
          placeholder="노트 제목을 입력하세요"
          aria-label="노트 제목"
          readOnly={viewOnly}
        />
      </div>

      <div className="flex-grow overflow-auto">
        <BlockNoteView
          editor={editor}
          slashMenu={!viewOnly}
          editable={!viewOnly}
          className={`note-editor ${viewOnly ? 'view-only' : 'edit-mode'}`}
        >
          {!viewOnly && editor && (
            <>
              <GridSuggestionMenuController triggerCharacter=":" columns={6} />
              <SuggestionMenuController
                triggerCharacter="/"
                getItems={async (query: string) => filterItems(getCustomSlashMenuItems(), query)}
                suggestionMenuComponent={({ items }) => (
                  <div className="bn-suggestion-menu">
                    {items.map((item: any, index: number) => (
                      <div key={index} className="bn-suggestion-menu-item">
                        {item.icon}
                        <div>
                          <div className="bn-suggestion-menu-item-title">{item.title}</div>
                          {item.subtext && <div className="bn-suggestion-menu-item-subtext">{item.subtext}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                onItemClick={(item: any) => item.onItemClick()}
              />
            </>
          )}
        </BlockNoteView>
      </div>

      {!viewOnly && (
        <div className="mt-4 p-3 border-t flex justify-between bg-white shadow-sm">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex items-center"
            onClick={handleSaveClick}
          >
            <MdSave className="mr-2" /> 저장
          </button>
        </div>
      )}
    </div>
  );
}