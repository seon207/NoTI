/* eslint-disable no-undef */
// 기본 콘텐츠 스크립트
console.log('YouTube 캡처 확장 프로그램의 content script가 로드되었습니다.');

// 필요한 경우에만 메시지 핸들러 추가
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script 메시지 수신:', message);
  
  // 기본 응답
  sendResponse({ success: true });
  
  return false;
});