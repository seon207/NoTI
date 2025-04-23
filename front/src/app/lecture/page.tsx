"use client";

import Link from "next/link";
import { useState, FormEvent, useEffect, JSX } from "react";
import { extractVideoInfo } from "@/lib/videoUtils";

export default function LectureSelectionPage(): JSX.Element {
    const [inputUrl, setInputUrl] = useState<string>("");
    const [isClient, setIsClient] = useState<boolean>(false);

    // Only run client-side
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        
        if (!inputUrl.trim()) return;

        // Extract video information from the URL
        const videoInfo = extractVideoInfo(inputUrl);
        
        if (videoInfo.platform === 'unknown') {
            console.log("지원하지 않는 비디오 URL입니다. 다시 확인해주세요.");
            return;
        }

        try {
            // Create a default title
            const urlObj = new URL(inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`);
            const defaultTitle = urlObj.searchParams.get('title') || 
                             `${videoInfo.platform} 강의 - ${videoInfo.videoId}`;
            
            // Create URL with search params manually
            const watchUrl = `/watch?url=${encodeURIComponent(inputUrl)}&title=${encodeURIComponent(defaultTitle)}`;
            window.location.href = watchUrl;
        } catch (error) {
            console.error("URL 처리 중 오류가 발생했습니다:", error);
        }
    };

    return (
        <div className="w-full h-screen bg-gray-50">
            <div className="p-6">
                <Link href="/home" className="flex items-center text-blue-600 hover:text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    뒤로가기
                </Link>
            </div>
            <div className="w-full h-3/4 flex flex-col items-center justify-center px-4">
                <div className="text-xl font-medium text-gray-800 mb-6">
                    수강할 강의를 입력해주세요
                </div>
                {isClient ? (
                    <form className="flex flex-col items-center w-full max-w-md" onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="강의 URL 또는 코드 입력"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                        />
                        <button 
                            type="submit"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                        >
                            강의로 가기
                        </button>
                    </form>
                ) : (
                    <div className="flex flex-col items-center w-full max-w-md">
                        <div className="w-full h-12 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                        <div className="w-32 h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                    </div>
                )}
            </div>
        </div>
    );
}