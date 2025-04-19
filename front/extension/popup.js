/* eslint-disable no-undef */
// 영역 선택 캡처 버튼
document.getElementById('captureArea').addEventListener('click', async () => {
  // 현재 활성화된 탭 정보 가져오기
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 백그라운드 스크립트에 메시지 전송
  chrome.runtime.sendMessage({
    action: 'startAreaCapture',
    tabId: tab.id
  });
  
  // 팝업 닫기
  window.close();
});

// 유튜브 영상 자동 캡처 버튼
document.getElementById('captureYoutube').addEventListener('click', async () => {
  // 현재 활성화된 탭 정보 가져오기
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 백그라운드 스크립트에 메시지 전송
  chrome.runtime.sendMessage({
    action: 'captureYoutubeVideo',
    tabId: tab.id
  });
  
  // 팝업 닫기
  window.close();
});