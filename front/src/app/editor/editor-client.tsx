'use client';

import dynamic from 'next/dynamic';

const EditorComponent = dynamic(() => import('@/components/note/Editor'), {
  ssr: false,
});

export default function EditorClient() {
  return <EditorComponent />;
}
