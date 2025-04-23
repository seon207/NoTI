'use client';

import Bookmarks from '@/components/mynotes/pages/Bookmarks';
import Quizzes from '@/components/mynotes/pages/Quizzes';
import RecentNotes from '@/components/mynotes/pages/RecentNotes';
import Sidebar from '@/components/mynotes/Sidebar';
import { useState } from 'react';
import RecentlyDeleted from '@/components/mynotes/pages/RecentlyDeleted';

export default function MyNotesPage() {
  const [activeComponent, setActiveComponent] = useState('recentNotes');
  
  // 사이드바에서 선택된 메뉴에 따라 컴포넌트 렌더링
  const renderComponent = () => {
    switch (activeComponent) {
      case 'recentNotes':
        return <RecentNotes />;
      case 'bookmarks':
        return <Bookmarks />;
      case 'quizzes':
        return <Quizzes />;
      case 'recentlyDeleted':
        return <RecentlyDeleted />;
      default:
        return <RecentNotes />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
      <main className="flex-1 overflow-y-auto p-6">
        {renderComponent()}
      </main>
    </div>
  );
}