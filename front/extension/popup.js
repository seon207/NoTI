/* eslint-disable */
document.getElementById("capture").addEventListener("click", async () => {
    try {
        // 현재 활성화된 탭 정보 가져오기
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // 유튜브 페이지인지 확인
        if (!tab.url.includes("youtube.com")) {
            alert("이 기능은 유튜브 페이지에서만 사용할 수 있습니다.");
            return;
        }

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                // 유튜브 비디오 요소 찾기
                const videoElement = document.querySelector('.html5-video-container video');
                if (!videoElement) {
                    return { success: false, error: "유튜브 비디오 요소를 찾을 수 없습니다." };
                }

                // 캔버스 생성 및 비디오 그리기
                const canvas = document.createElement('canvas');
                const width = videoElement.videoWidth;
                const height = videoElement.videoHeight;

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(videoElement, 0, 0, width, height);

                return {
                    success: true,
                    dataUrl: canvas.toDataURL('image/png')
                };
            }
        });

        // executeScript 결과 확인
        const result = results[0].result;

        if (result.success) {
            // 이미지 데이터를 클립보드에 복사 - 기존 코드
            const res = await fetch(result.dataUrl);
            const blob = await res.blob();
            const item = new ClipboardItem({ [blob.type]: blob });
            await navigator.clipboard.write([item]);
            
            // Next.js 앱으로 이미지 데이터 전송 - 추가 코드
            try {
                const response = await fetch('http://localhost:3000/api/capture', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageData: result.dataUrl,
                        metadata: {
                            timestamp: new Date().toISOString(),
                            url: tab.url,
                            title: tab.title
                        }
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    alert("유튜브 영상 이미지가 클립보드에 복사되고 노트 앱에 저장되었습니다!");
                }
            } catch (error) {
                console.error("노트 앱 저장 실패:", error);
                // 클립보드 복사는 성공했으므로 사용자에게는 성공 메시지만 표시
                alert("유튜브 영상 이미지가 클립보드에 복사되었습니다!");
            }
        } else {
            alert("영상 캡쳐 실패: " + result.error);
        }
    } catch (err) {
        console.error("오류 발생:", err);
        alert("오류: " + (err.message || "알 수 없는 오류가 발생했습니다."));
    }
});