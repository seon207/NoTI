/* eslint-disable */
// 확장 프로그램이 설치될 때 실행
chrome.runtime.onInstalled.addListener(() => {
    // 모든 사이트에서 사이드 패널 활성화
    chrome.sidePanel.setOptions({
        path: 'sidepanel.html',
        enabled: true
    });
});

// 확장 프로그램 아이콘 클릭 시 사이드 패널 열기 설정
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("사이드 패널 설정 오류:", error));


// 키보드 단축키를 눌렀을 때 실행
chrome.commands.onCommand.addListener(async (command) => {
    if (command === "capture-youtube-video") {
        // 현재 활성화된 탭 가져오기
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        captureYoutubeVideoInTab(tab);
    }
});

// 캡처한 이미지 데이터를 저장할 전역 변수
let capturedImageData = null;

function captureYoutubeVideoInTab(tab) {
    // 현재 탭이 유튜브인지 확인
    if (tab.url && tab.url.includes("youtube.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                try {
                    // 유튜브 비디오 플레이어 요소 찾기
                    const videoElement = document.querySelector('.html5-video-container video');
                    if (!videoElement) {
                        alert("유튜브 비디오 요소를 찾을 수 없습니다.");
                        return null;
                    }

                    // 캔버스 생성 및 비디오 그리기
                    const canvas = document.createElement('canvas');
                    const width = videoElement.videoWidth;
                    const height = videoElement.videoHeight;

                    // 실제 비디오 크기로 캔버스 설정
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(videoElement, 0, 0, width, height);

                    // 데이터 URL로 변환
                    return canvas.toDataURL('image/png');
                } catch (error) {
                    console.error("비디오 캡쳐 에러:", error);
                    alert("영상 캡쳐 실패: " + error.message);
                    return null;
                }
            }
        }).then(async (results) => {
            if (results && results[0] && results[0].result) {
                const dataUrl = results[0].result;

                // 캡처한 이미지 데이터 전역 변수에 저장
                capturedImageData = dataUrl;

                try {
                    // 클립보드에 복사
                    const response = await fetch(dataUrl);
                    const blob = await response.blob();
                    const item = new ClipboardItem({ [blob.type]: blob });
                    await navigator.clipboard.write([item]);

                    // Next.js 앱으로 이미지 데이터 전송
                    sendCaptureToNextApp(dataUrl, tab.url, document.title);

                    // 함수 추가
                    function sendCaptureToNextApp(imageData, url, title) {
                    fetch('http://localhost:3000/api/capture', {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                        imageData: imageData,
                        metadata: {
                            timestamp: new Date().toISOString(),
                            url: url,
                            title: title
                        }
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('캡처 저장 성공:', data);
                        
                        // 선택적: 캡처 후 Next.js 앱의 노트 페이지로 이동
                        // chrome.tabs.create({ url: `http://localhost:3000/notes/${data.id}` });
                    })
                    .catch(error => {
                        console.error('캡처 저장 실패:', error);
                    });
                    }
                    // 알림 표시
                    alert("유튜브 영상 이미지가 클립보드에 복사되었습니다!");

                    // 사이드패널이 열려 있으면 알림
                    chrome.runtime.sendMessage({
                        action: 'imageUpdated',
                        imageData: capturedImageData
                    });

                } catch (err) {
                    console.error("클립보드 복사 실패:", err);
                    alert("클립보드 복사에 실패했습니다: " + err.message);
                }
            }
        });
    } else {
        // 유튜브 페이지가 아니면 알림
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                alert("이 기능은 유튜브 페이지에서만 사용할 수 있습니다.");
            }
        });
    }
}