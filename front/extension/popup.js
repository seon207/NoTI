/* eslint-disable no-undef */
// 영역 선택 캡처 버튼
document.getElementById('captureArea').addEventListener('click', async () => {
  try {
    console.log('영역 선택 캡처 버튼 클릭됨');
    // 현재 활성화된 탭 정보 가져오기
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log('현재 탭:', tab);

    // 백그라운드 스크립트에 메시지 전송
    chrome.runtime.sendMessage({
      action: 'startAreaCapture',
      tabId: tab.id,
    });

    // 팝업 닫기
    window.close();
  } catch (err) {
    console.error('영역 선택 캡처 오류:', err);
  }
});

// 유튜브 영상 자동 캡처 버튼
document
  .getElementById('captureYoutube')
  .addEventListener('click', async () => {
    try {
      console.log('유튜브 영상 자동 캡처 버튼 클릭됨');
      // 현재 활성화된 탭 정보 가져오기
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      console.log('현재 탭:', tab);

      // 백그라운드 스크립트에 메시지 전송
      chrome.runtime.sendMessage({
        action: 'captureYoutubeVideo',
        tabId: tab.id,
      });

      // 팝업 닫기
      window.close();
    } catch (err) {
      console.error('유튜브 영상 캡처 오류:', err);
    }
  });

// 현재 페이지 영상 감지 버튼
document.getElementById('detectVideo').addEventListener('click', async () => {
  try {
    console.log('현재 페이지 영상 감지 버튼 클릭됨');
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // 백그라운드 스크립트에 메시지 전송
    chrome.runtime.sendMessage({
      action: 'detectVideo',
      tabId: tab.id,
      url: tab.url,
    });

    // 팝업 닫기
    window.close();
  } catch (err) {
    console.error('영상 감지 오류:', err);
  }
});

// 영상으로 필기 시작하기 버튼
document.getElementById('openInApp').addEventListener('click', async () => {
  try {
    console.log('영상으로 필기 시작하기 버튼 클릭됨');
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // 백그라운드 스크립트에 메시지 전송
    chrome.runtime.sendMessage({
      action: 'openVideoInApp',
      videoUrl: tab.url,
      videoTitle: tab.title,
    });

    // 팝업 닫기
    window.close();
  } catch (err) {
    console.error('앱 열기 오류:', err);
  }
});
