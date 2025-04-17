// ./src/app/editor/page.tsx (서버 컴포넌트)
import EditorClient from './editor-client';

export default function EditorPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">노트 에디터</h1>
      <EditorClient />
    </main>
  );
}