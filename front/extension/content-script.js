/* eslint-disable no-undef */
// 콘텐츠 스크립트
console.log(
  '영상 캡처 및 필기 확장 프로그램의 content script가 로드되었습니다.',
);

// 웹 앱에서 오는 메시지 리스닝 (하나의 리스너만 사용)
window.addEventListener('message', (event) => {
  // 메시지가 웹 앱에서 온 것인지 확인
  if (event.data && event.data.source === 'youtube-note-app') {
    console.log('웹 앱에서 메시지 수신:', event.data);

    // 요청 유형에 따라 처리
    if (event.data.action === 'checkExtension') {
      // 익스텐션이 설치되어 있다고 응답
      window.postMessage(
        {
          source: 'youtube-capture-extension',
          action: 'extensionAvailable',
        },
        '*'
      );
    } else if (event.data.action === 'requestAreaCapture') {
      // 영역 캡처 요청을 백그라운드 스크립트로 전달
      chrome.runtime.sendMessage({
        action: 'startAreaCapture'
      });
    } else if (event.data.action === 'requestVideoCapture') {
      // 영상 전체 캡처 요청을 백그라운드 스크립트로 전달
      chrome.runtime.sendMessage({
        action: 'captureVideo'
      });
    }
  }
});

// 페이지 로드 시 웹 앱에 익스텐션 설치 여부 알림
function notifyExtensionPresence() {
  window.postMessage(
    {
      source: 'youtube-capture-extension',
      action: 'extensionAvailable',
    },
    '*'
  );
}

// 페이지 로드 완료 시 실행 (한 번만 호출)
window.addEventListener('load', () => {
  // 약간의 지연 후 알림 (페이지 초기화 완료 후)
  setTimeout(notifyExtensionPresence, 1000);
});

// 나머지 기존 코드...