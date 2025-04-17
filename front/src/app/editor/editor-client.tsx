// ./src/app/editor/editor-client.tsx (클라이언트 컴포넌트)
'use client';

import dynamic from 'next/dynamic';

const EditorComponent = dynamic(
  () => import('@/src/components/Editor'),
  { ssr: false }
);

export default function EditorClient() {
  return <EditorComponent />;
}