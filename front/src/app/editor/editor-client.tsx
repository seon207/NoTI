
'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';

const EditorComponent = dynamic(() => import('@/components/note/Editor'), {
  ssr: false,
});

interface EditorRef {
  getContent: () => any; 
}

export default function EditorClient() {
  const editorRef = useRef<EditorRef>(null);

  const sendContentToServer = async () => {
    if (!editorRef.current) {
      console.error('Editor가 아직 준비되지 않았습니다.');
      return;
    }

    const content = editorRef.current.getContent();
    try {
      const response = await fetch('http://localhost:8080/api/download/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: JSON.parse(content) }),
      });

      if (!response.ok) {
        throw new Error('서버 응답 실패');
      }

      const data = await response.json();
      console.log('서버 응답:', data);
    } catch (error) {
      console.error('전송 실패:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <EditorComponent ref={editorRef} />

      <button
        onClick={sendContentToServer}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        서버로 전송
      </button>
    </div>
  );
}
