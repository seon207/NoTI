"use client";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

export default function Editor() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote();

  // 기본적인 스타일링 기능은 에디터 내장 UI에서 제공됩니다
  // 텍스트를 선택하면 서식 옵션 메뉴가 나타납니다
  return (
    <div className="editor-container">
      <BlockNoteView editor={editor} />
    </div>
  );
}