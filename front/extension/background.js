/* eslint-disable no-undef */
// 설치/업데이트 시 실행
chrome.runtime.onInstalled.addListener(() => {
  console.log('유튜브 영상 영역 캡처 확장 프로그램이 설치되었습니다.');
});

// 영역 선택 캡처 시작 함수
function startAreaCapture(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    function: () => {
      // 이미 선택 오버레이가 있는지 확인
      if (document.getElementById('capture-overlay')) {
        return;
      }
      
      // 선택 오버레이 생성
      const overlay = document.createElement('div');
      overlay.id = 'capture-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.zIndex = '99999';
      overlay.style.cursor = 'crosshair';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
      
      // 선택 안내 텍스트
      const helpText = document.createElement('div');
      helpText.style.position = 'absolute';
      helpText.style.top = '20px';
      helpText.style.left = '50%';
      helpText.style.transform = 'translateX(-50%)';
      helpText.style.padding = '8px 12px';
      helpText.style.borderRadius = '4px';
      helpText.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      helpText.style.color = 'white';
      helpText.style.fontFamily = 'sans-serif';
      helpText.style.fontSize = '14px';
      helpText.textContent = '캡처할 영역을 드래그하여 선택하세요. ESC를 누르면 취소됩니다.';
      
      // 선택 영역 요소
      const selection = document.createElement('div');
      selection.id = 'capture-selection';
      selection.style.position = 'absolute';
      selection.style.border = '2px dashed #1a73e8';
      selection.style.backgroundColor = 'rgba(26, 115, 232, 0.1)';
      selection.style.display = 'none';
      
      overlay.appendChild(helpText);
      overlay.appendChild(selection);
      document.body.appendChild(overlay);
      
      // 선택 관련 변수
      let startX; let startY; let endX; let endY;
      let isSelecting = false;
      
      // 마우스 이벤트 핸들러
      overlay.addEventListener('mousedown', (e) => {
        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;
        
        selection.style.left = `${startX  }px`;
        selection.style.top = `${startY  }px`;
        selection.style.width = '0';
        selection.style.height = '0';
        selection.style.display = 'block';
      });
      
      overlay.addEventListener('mousemove', (e) => {
        if (!isSelecting) return;
        
        endX = e.clientX;
        endY = e.clientY;
        
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        
        selection.style.left = `${Math.min(startX, endX)  }px`;
        selection.style.top = `${Math.min(startY, endY)  }px`;
        selection.style.width = `${width  }px`;
        selection.style.height = `${height  }px`;
      });
      
      overlay.addEventListener('mouseup', () => {
        if (!isSelecting) return;
        isSelecting = false;
        
        // 선택 영역이 너무 작은 경우 무시
        const rect = selection.getBoundingClientRect();
        if (rect.width < 10 || rect.height < 10) {
          return;
        }
        
        // 선택 완료 - 선택 영역의 좌표를 반환
        chrome.runtime.sendMessage({
          action: 'areaSelected',
          area: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            devicePixelRatio: window.devicePixelRatio || 1
          }
        });
        
        // 오버레이 제거
        document.body.removeChild(overlay);
      });
      
      // ESC 키 누르면 캡처 취소
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (document.getElementById('capture-overlay')) {
            document.body.removeChild(overlay);
          }
        }
      }, { once: true });
    }
  });
}

// 유튜브 영상 자동 캡처 함수
function captureYoutubeVideo(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    function: () => {
      // 유튜브 동영상 요소 찾기
      const videoElement = document.querySelector('.html5-video-container video') ||
                            document.querySelector('iframe[src*="youtube.com"]') ||
                            document.querySelector('video');
      
      if (!videoElement) {
        alert('페이지에서 비디오 요소를 찾을 수 없습니다.');
        return;
      }
      
      // 비디오 요소의 위치와 크기 계산
      const rect = videoElement.getBoundingClientRect();
      
      // 좌표 전송
      chrome.runtime.sendMessage({
        action: 'areaSelected',
        area: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          devicePixelRatio: window.devicePixelRatio || 1
        }
      });
    }
  });
}
// 이미지 크롭 함수
function cropImage(dataUrl, area, callback) {
  // DOM API를 사용할 수 있는 탭에서 실행
  chrome.tabs.create({ url: 'cropper.html', active: false }, (tab) => {
    // 탭이 로드될 때까지 기다림
    function checkTabLoaded() {
      chrome.tabs.sendMessage(tab.id, {
        action: 'cropImage',
        dataUrl,
        area
      }, (response) => {
        if (response && response.croppedImage) {
          // 크롭된 이미지 받아서 콜백 실행
          callback(response.croppedImage);
          
          // 임시 탭 닫기
          chrome.tabs.remove(tab.id);
        } else if (chrome.runtime.lastError) {
          // 아직 탭이 준비되지 않음, 다시 시도
          setTimeout(checkTabLoaded, 50);
        }
      });
    }
    
    setTimeout(checkTabLoaded, 100);
  });
}

// 이미지 클립보드 복사 함수
async function copyImageToClipboard(dataUrl) {
  try {
    // 데이터 URL에서 Blob 객체 생성
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // ClipboardItem 객체 생성
    const item = new ClipboardItem({ [blob.type]: blob });
    
    // 클립보드에 쓰기
    await navigator.clipboard.write([item]);
    
    console.log('이미지가 클립보드에 복사되었습니다.', blob.type, blob.size);
    return true;
  } catch (error) {
    console.error('클립보드 복사 실패:', error);
    
    // 대체 방법 시도
    try {
      // 임시 캔버스 생성
      const canvas = document.createElement('canvas');
      const img = new Image();
      
      // 이미지 로드 완료 대기
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });
      
      // 캔버스에 이미지 그리기
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // 대체 클립보드 복사 방법
      canvas.toBlob(async (blob) => {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        console.log('대체 방법으로 클립보드 복사 성공');
      });
      
      return true;
    } catch (backupError) {
      console.error('대체 클립보드 복사 방법도 실패:', backupError);
      return false;
    }
  }
}

// 노트 앱에 메시지 전송 함수
function sendToNoteApp(tabId, imageData) {
  // 현재 url에서 비디오 ID 추출 시도
  chrome.tabs.get(tabId, (tab) => {
    let videoId = null;
    
    // URL에서 videoId 추출 시도
    try {
      const url = new URL(tab.url);
      if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v');
      } else if (url.pathname.includes('/lecture/')) {
        // 노트 앱 URL에서 강의 ID 추출
        const matches = url.pathname.match(/\/lecture\/([^/]+)/);
        if (matches && matches.length > 1) {
          const [, extractedId] = matches; // 배열 구조 분해 사용
          videoId = extractedId;
        }
      }
    } catch (e) {
      console.error('URL 파싱 오류:', e);
    }
    
    // 노트 앱 탭 찾기
    chrome.tabs.query({
      url: videoId ? 
        `http://localhost:3000/lecture/${videoId}` : 
        'http://localhost:3000/lecture/*'
    }, (tabs) => {
      // 노트 앱 탭이 있으면 메시지 전송
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'insertImage',
          imageData,
          source: 'youtube-capture-extension'
        });
        console.log('노트 앱으로 이미지 전송 완료');
      } else {
        console.log('노트 앱 탭을 찾을 수 없음');
      }
    });
  });
}

// 선택된 영역 캡처 함수
async function captureSelectedArea(tabId, area) {
  try {
    // 전체 화면 캡처
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    
    // 캡처된 이미지를 이용해 영역 크롭
    cropImage(dataUrl, area, async (croppedImageData) => {
      // 클립보드에 복사
      await copyImageToClipboard(croppedImageData);
      
      // 노트 앱에 메시지 전송 시도
      sendToNoteApp(tabId, croppedImageData);
      
      // 사용자에게 알림
      chrome.scripting.executeScript({
        target: { tabId },
        function: () => {
          // 복사 성공 알림 표시
          const notification = document.createElement('div');
          notification.style.position = 'fixed';
          notification.style.top = '20px';
          notification.style.left = '50%';
          notification.style.transform = 'translateX(-50%)';
          notification.style.padding = '10px 20px';
          notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          notification.style.color = 'white';
          notification.style.borderRadius = '5px';
          notification.style.zIndex = '99999';
          notification.style.fontFamily = 'sans-serif';
          notification.style.fontSize = '14px';
          notification.textContent = '선택한 영역이 클립보드에 복사되었습니다.';
          
          document.body.appendChild(notification);
          
          // 3초 후 알림 제거
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 3000);
        }
      });
    });
  } catch (error) {
    console.error('영역 캡처 실패:', error);
    chrome.scripting.executeScript({
      target: { tabId },
      function: (errorMsg) => {
        alert(`캡처 실패: ${  errorMsg}`);
      },
      args: [error.message]
    });
  }
}

  // 단축키 이벤트 처리
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'capture-area') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      startAreaCapture(tab.id);
    }
  });

  // 메시지 이벤트 처리
  chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
    if (message.action === 'startAreaCapture') {
      startAreaCapture(message.tabId);
    } 
    else if (message.action === 'captureYoutubeVideo') {
      captureYoutubeVideo(message.tabId);
    }
    else if (message.action === 'areaSelected') {
      captureSelectedArea(sender.tab.id, message.area);
    }
    
    return true; // 비동기 응답을 위해 true 반환
  });
