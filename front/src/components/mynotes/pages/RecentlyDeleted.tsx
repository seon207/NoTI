// RecentlyDeleted.tsx

"use client";

import { useState } from "react";
import { deletedNoteList } from "@/mockdata/noteData";
import DeletedNoteItem from "../items/DeletedNoteItem";

export default function RecentlyDeleted() {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const onEditButtonClick = () => {
        setIsEditing(true);
    };
    
    const onCancelButtonClick = () => {
        setIsEditing(false);
        setSelectedItems([]);
    };

    const handleToggleSelect = (id: string) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } 
                return [...prev, id];
            
        });
    };

    const handleSelectAll = () => {
        if (selectedItems.length === deletedNoteList.length) {
            // 모두 선택되어 있다면 모두 해제
            setSelectedItems([]);
        } else {
            // 일부만 선택되어 있거나 없다면 모두 선택
            setSelectedItems(deletedNoteList.map(note => note.id));
        }
    };

    const handleRestore = () => {
        console.log("복구할 아이템 ID:", selectedItems);
        // 복구 처리 로직 추가
        onCancelButtonClick();
    };

    const handleDelete = () => {
        console.log("영구 삭제할 아이템 ID:", selectedItems);
        // 삭제 처리 로직 추가
        onCancelButtonClick();
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">최근 삭제된 노트</h1>
                
                <div className="flex items-center space-x-3">
                    {!isEditing ? (
                        <button 
                            onClick={onEditButtonClick}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            선택
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={handleSelectAll}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                {selectedItems.length === deletedNoteList.length ? "전체 해제" : "전체 선택"}
                            </button>
                            <button 
                                onClick={onCancelButtonClick}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                                취소
                            </button>
                            <button 
                                onClick={handleRestore}
                                disabled={selectedItems.length === 0}
                                className={`bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                                    selectedItems.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-200"
                                }`}
                            >
                                복구
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={selectedItems.length === 0}
                                className={`bg-red-100 text-red-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                                    selectedItems.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-red-200"
                                }`}
                            >
                                삭제
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {deletedNoteList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-gray-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    <p className="text-lg font-medium">삭제된 노트가 없습니다.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {deletedNoteList.map((note) => (
                        <DeletedNoteItem
                            key={note.id}
                            deletedNote={note}
                            isEditing={isEditing}
                            isSelected={selectedItems.includes(note.id)}
                            onToggleSelect={handleToggleSelect}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}