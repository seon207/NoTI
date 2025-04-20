/* eslint-disable no-undef */
// 노트 앱을 위한 content-script.js

// 확장 프로그램으로부터 메시지 수신 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script 메시지 수신:', message);

  if (message.action === 'insertImage') {
    try {
      // 노트 앱에 이미지 삽입 로직
      console.log('노트 앱에 이미지 삽입 요청 받음:', message.imageData);
      
      // 이미지를 삽입할 수 있는 DOM 요소 찾기
      const editor = document.querySelector('.note-editor') || document.querySelector('#editor');
      
      if (editor) {
        // 이미지 요소 생성 및 삽입
        const imgElement = document.createElement('img');
        imgElement.src = message.imageData;
        imgElement.style.maxWidth = '100%';
        imgElement.alt = '캡처된 이미지';
        
        editor.appendChild(imgElement);
        console.log('이미지가 노트 앱에 삽입되었습니다.');
        sendResponse({ success: true });
      } else {
        console.error('노트 앱에서 에디터 요소를 찾을 수 없습니다.');
        sendResponse({ success: false, error: '에디터 요소를 찾을 수 없습니다.' });
      }
    } catch (error) {
      console.error('이미지 삽입 중 오류:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // 비동기 응답을 위해 true 반환
  }
  
  // 다른 메시지 유형에도 기본 반환값 제공
  return false;
});

console.log('YouTube 캡처 확장 프로그램의 content script가 로드되었습니다.');