/* eslint-disable no-nested-ternary */

'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import MyNoteEditor from "@/components/mynotes/MyNoteEditor";
import { NoteData } from "@/types/noteType";

export default function NoteViewPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const loadNoteData = async () => {
    setIsLoading(true);
    
    try {
      // 실제 구현에서는 API 호출로 대체
      const storageKey = `note-${noteId}`;
      const savedContent = localStorage.getItem(storageKey);
      const savedTitle = localStorage.getItem(`${storageKey}-title`) || `노트 ${noteId}`;
      
      // 데모 데이터
      const demoData: NoteData = {
        id: noteId,
        title: savedTitle,
        date: new Date().toISOString().split('T')[0],
        content: savedContent ? JSON.parse(savedContent) : [],
        lectureUrl: noteId === '1' 
          ? 'https://youtu.be/rxhd22IcqAY?si=ZV2DvQjtcZwERWli' 
          : undefined
      };
      
      setNoteData(demoData);
    } catch (error) {
      console.error("노트 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNoteData();
  }, [noteId]);

  // 강의 보기 핸들러
  const handleWatchLecture = () => {
    if (!noteData?.lectureUrl) return;
    
    try {
      const watchUrl = `/watch?url=${encodeURIComponent(noteData.lectureUrl)}&title=${encodeURIComponent(noteData.title)}`;
      router.push(watchUrl);
    } catch (error) {
      console.error("URL 처리 중 오류가 발생했습니다:", error);
      alert("URL 형식이 올바르지 않습니다.");
    }
  };

  const handleEditButtonClick = () => {
    setIsEditing(!isEditing);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/home" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            내 노트 목록으로
          </Link>
        </div>
        
        <div className="flex gap-4">
          {noteData?.lectureUrl && (
            <button 
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              onClick={handleWatchLecture}
            >
              강의 보기
            </button>
          )}
          
          <div
            onClick={handleEditButtonClick}
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
          >
            노트 편집
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : noteData ? (
          <MyNoteEditor 
            title={noteData.title} 
            initialContent={noteData.content}
            viewOnly={!isEditing}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700">노트를 찾을 수 없습니다</h2>
              <p className="mt-2 text-gray-500">요청하신 노트를 찾을 수 없습니다.</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => router.push('/mynotes')}
              >
                노트 목록으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 하단 정보 (옵션) */}
      {noteData && (
        <footer className="bg-white py-2 px-6 text-sm text-gray-500 border-t">
          마지막 수정: {noteData.date}
        </footer>
      )}
    </div>
  );
}