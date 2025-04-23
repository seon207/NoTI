"use client";

import { useState, useEffect } from "react";
import { extractVideoInfo } from "@/lib/videoUtils";
import { useRouter } from "next/navigation";
import { NoteItemData } from "@/types/noteType";

interface NoteItemProps {
    note: NoteItemData;
}

export default function NoteItem(props: NoteItemProps) {
    const [isClient, setIsClient] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    // eslint-disable-next-line no-undef
    const handleLectureButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation(); // 이벤트 버블링 방지
        
        if (!props.note.lectureUrl) return;

        try {
            const videoInfo = extractVideoInfo(props.note.lectureUrl);
            
            if (videoInfo.platform === 'unknown') {
                alert("지원하지 않는 비디오 URL입니다.");
                return;
            }

            const defaultTitle = props.note.title || `${videoInfo.platform} 강의 - ${videoInfo.videoId}`;
            
            const watchUrl = `/watch?url=${encodeURIComponent(props.note.lectureUrl)}&title=${encodeURIComponent(defaultTitle)}`;
            window.location.href = watchUrl;
        } catch (error) {
            console.error("URL 처리 중 오류가 발생했습니다:", error);
            alert("URL 형식이 올바르지 않습니다.");
        }
    };

    const handleCardClick = () => {
        router.push(`/note/${props.note.id}`);
    };

    return (
        <div 
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="relative h-40 w-full">
                {isClient ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={props.note.imgSrc || ''}
                        alt={props.note.title || "강의 노트"}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="w-full h-40 bg-gray-200 animate-pulse"></div>
                )}
            </div>
            
            <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">{props.note.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{props.note.date}</p>
                
                <div className="flex justify-between items-center">
                    
                    {isClient ? (
                        <button 
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-1 ml-auto"
                            onClick={handleLectureButtonClick}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            <span>강의 다시보기</span>
                        </button>
                    ) : (
                        <div className="w-28 h-9 bg-blue-100 rounded-lg animate-pulse ml-auto"></div>
                    )}
                </div>
            </div>
        </div>
    );
}