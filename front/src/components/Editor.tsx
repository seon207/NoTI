'use client';

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
// 상대 경로로 shiki.bundle.js 임포트
import { createHighlighter } from "@/public/shiki.bundle";

export default function Editor() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    codeBlock: {
      indentLineWithTab: true,
      defaultLanguage: "typescript",
      supportedLanguages: {
        typescript: {
          name: "TypeScript",
          aliases: ["ts"],
        },
        javascript: {
          name: "JavaScript",
          aliases: ["js"],
        },
        python: {
          name: "Python",
          aliases: ["py"],
        },
        java: {
          name: "Java",
        },
        html: { name: "HTML" },
        css: { name: "CSS" }
      },
      // 하이라이터 생성
      createHighlighter: () =>
        createHighlighter({
          themes: ["dark-plus", "light-plus"],
          langs: ['javascript', 'typescript', 'python', 'java', 'css', 'html'],
        }),
    },
    // 초기 내용 설정
    initialContent: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "여기에 필기를 시작하세요...",
            styles: {},
          },
        ],
      },
      {
        type: "codeBlock",
        props: {
          language: "typescript",
        },
        content: [
          {
            type: "text",
            text: "// 코드 예시\nconst x = 3 * 4;\nconsole.log(`결과: ${x}`);\n",
            styles: {},
          },
        ],
      },
    ],
  });

  // 에디터 렌더링
  return <BlockNoteView editor={editor} />;
}