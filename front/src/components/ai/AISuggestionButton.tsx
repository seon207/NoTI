// components/ai/AISuggestionButton.tsx
import React from 'react';
import { MdAutoFixHigh } from 'react-icons/md';
import { AISuggestion } from '@/types/aiType';

interface AISuggestionButtonProps {
  blockId: string;
  blockType: string;
  requestAISuggestion: (_blockId: string) => void;
  suggestion?: AISuggestion;
  applySuggestion: (_blockId: string) => void;
  dismissSuggestion: (_blockId: string) => void;
}

function AISuggestionButton({
  blockId,
  blockType,
  requestAISuggestion,
  suggestion,
  applySuggestion,
  dismissSuggestion,
}: AISuggestionButtonProps) {
  // 텍스트 블록이 아니면 버튼 표시하지 않음
  if (!['paragraph', 'heading'].includes(blockType)) {
    return null;
  }
  
  return (
    <>
      {/* AI 제안 버튼 */}
      <div className="absolute right-2 top-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="p-1 text-indigo-600 hover:text-indigo-800 bg-white rounded shadow"
          title="AI 제안 요청"
          onClick={() => requestAISuggestion(blockId)}
        >
          <MdAutoFixHigh size={16} />
        </button>
      </div>
      
      {/* AI 제안 표시 영역 */}
      {suggestion && suggestion.isLoading && (
        <div className="mt-1 ml-4 p-2 bg-gray-50 border-l-2 border-gray-300 text-sm">
          <div className="flex items-center text-gray-600">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            AI 제안 생성 중...
          </div>
        </div>
      )}
      
      {suggestion && suggestion.isVisible && (
        <div className="mt-1 ml-4 p-2 bg-indigo-50 border-l-2 border-indigo-400 text-sm">
          <div className="flex items-center text-xs text-indigo-700 mb-1">
            <MdAutoFixHigh className="mr-1" /> AI 제안:
          </div>
          <div className="text-gray-800">{suggestion.suggestedText}</div>
          <div className="flex mt-2 space-x-2">
            <button
              type="button"
              className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
              onClick={() => applySuggestion(blockId)}
            >
              적용
            </button>
            <button
              type="button"
              className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300"
              onClick={() => dismissSuggestion(blockId)}
            >
              무시
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AISuggestionButton;