"use client";

import { DeletedNoteItemData } from "@/types/noteType";

interface DeletedNoteItemProps {
    deletedNote: DeletedNoteItemData;
    isEditing: boolean;
    isSelected?: boolean;
    // eslint-disable-next-line no-unused-vars
    onToggleSelect?: (id: string) => void;
}

export default function DeletedNoteItem(props: DeletedNoteItemProps) {
    const { deletedNote, isEditing, isSelected = false, onToggleSelect } = props;

    const handleToggleSelect = () => {
        if (onToggleSelect) {
            onToggleSelect(deletedNote.id);
        }
    };

    const handleClick = () => {
        if (isEditing) {
            handleToggleSelect();
        }
    };

    return (
        <div
            onClick={handleClick}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="flex items-center space-x-3 flex-1">
                <div>
                    <div className="font-medium text-gray-900">{deletedNote.title}</div>
                    <div className="text-sm text-gray-500">
                        <span className="text-red-500 font-medium">{deletedNote.deadline}일 후 삭제</span>
                    </div>
                </div>
            </div>

            {isEditing && (
                    <div className="w-5 h-5 flex-shrink-0">
                        {isSelected ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                )}
        </div>
    );
}
