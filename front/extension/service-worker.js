// service-worker.js
/* eslint-disable */
// 확장 프로그램이 설치될 때 실행
chrome.runtime.onInstalled.addListener(() => {
    console.log("YouTube 캡처 확장 프로그램이 설치되었습니다.");
});

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
  if (tab.url && (tab.url.includes("youtube.com") || tab.url.includes("localhost:3000/lecture"))) {
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
              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              ctx.drawImage(videoElement, 0, 0, width, height);

              // 현재 재생 시간 가져오기
              const currentTime = videoElement.currentTime;

              // 데이터 URL로 변환
              return {
                  dataUrl: canvas.toDataURL('image/png'),
                  currentTime: currentTime,
                  videoUrl: window.location.href
              };
          } catch (error) {
              console.error("비디오 캡쳐 에러:", error);
              alert("영상 캡쳐 실패: " + error.message);
              return null;
          }
      }
  }).then(async (results) => {
    if (results && results[0] && results[0].result) {
      const { dataUrl, currentTime, videoUrl } = results[0].result;

      // 캡처한 이미지 데이터 전역 변수에 저장
      capturedImageData = dataUrl;

      try {
          // 클립보드에 복사
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const item = new ClipboardItem({ [blob.type]: blob });
          await navigator.clipboard.write([item]);

          // 노트 앱에 이미지 데이터 전송 시도
          // URL에서 videoId 추출
          const urlObj = new URL(videoUrl);
          const videoId = urlObj.searchParams.get('v');

          // 노트 앱 탭 찾기
          const noteTabs = await chrome.tabs.query({
              url: `http://localhost:3000/lecture/${videoId}`
          });

          if (noteTabs.length > 0) {
              // 노트 앱 탭이 열려있으면 메시지 전송
              chrome.tabs.sendMessage(noteTabs[0].id, {
                  action: "insertImage",
                  imageData: dataUrl,
                  currentTime: currentTime
              });
            }

          // 알림 표시
          alert("유튜브 영상 이미지가 클립보드에 복사되었습니다!");

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