/* eslint-disable no-undef */

// 디버깅을 위한 로그 함수
function log(message) {
  console.log(message);
  const status = document.getElementById('status');
  if (status) {
    status.textContent = message;
  }
}

log('cropper.js 파일이 로드되었습니다.');

// 클립보드에 이미지 복사 함수
async function copyToClipboard(dataUrl) {
  log('클립보드 복사 시작');
  try {
    // 미리보기 이미지 표시
    const preview = document.getElementById('preview');
    if (preview) {
      preview.src = dataUrl;
      preview.style.display = 'block';
    }
    
    // 비동기로 데이터 URL에서 blob 생성
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // ClipboardItem 지원 확인
    if (typeof ClipboardItem !== 'undefined') {
      log('ClipboardItem API 사용 시도');
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      log('클립보드 복사 성공 (ClipboardItem API)');
      return true;
    } 
      log('ClipboardItem API가 지원되지 않음, 대체 방법 시도');
    
    
    // 대체 방법: execCommand 사용
    const tempImg = document.createElement('img');
    tempImg.src = dataUrl;
    
    const tempContainer = document.createElement('div');
    tempContainer.appendChild(tempImg);
    tempContainer.setAttribute('contenteditable', 'true');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    
    document.body.appendChild(tempContainer);
    
    // 선택 및 복사
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(tempContainer);
    selection.removeAllRanges();
    selection.addRange(range);
    
    const success = document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(tempContainer);
    
    log(`클립보드 복사 시도 (execCommand): ${  success ? '성공' : '실패'}`);
    return success;
  } catch (error) {
    log(`클립보드 복사 실패: ${  error.message}`);
    console.error('클립보드 복사 실패:', error);
    return false;
  }
}

// 메시지 리스너 등록
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log(`메시지 수신: ${  message.action}`);
  console.log('cropper.js에서 메시지 수신:', message);

  if (message.action === 'cropImage') {
    log('이미지 크롭 작업 시작');
    const { dataUrl, area } = message;

    if (!dataUrl) {
      log('오류: 이미지 데이터가 없습니다.');
      sendResponse({ error: '이미지 데이터가 없습니다.' });
      return true;
    }

    if (!area) {
      log('오류: 영역 정보가 없습니다.');
      sendResponse({ error: '영역 정보가 없습니다.' });
      return true;
    }

    log('이미지 로딩 중...');
    const img = new Image();
    
    img.onload = () => {
      log(`이미지 로드 성공 (크기: ${  img.width  }x${  img.height  })`);
      const canvas = document.getElementById('canvas');
      if (!canvas) {
        log('오류: 캔버스 요소를 찾을 수 없습니다.');
        sendResponse({ error: '캔버스 요소를 찾을 수 없습니다.' });
        return;
      }
      
      const ctx = canvas.getContext('2d');
      
      // device pixel ratio 고려하여 캔버스 크기 설정
      const dpr = area.devicePixelRatio || 1;
      canvas.width = area.width * dpr;
      canvas.height = area.height * dpr;
      
      log(`캔버스 크기 설정: ${  canvas.width  }x${  canvas.height}`);
      
      try {
        // 이미지에서 선택 영역만 크롭
        ctx.drawImage(
          img,
          area.x * dpr, area.y * dpr,
          area.width * dpr, area.height * dpr,
          0, 0, canvas.width, canvas.height
        );
        
        // 크롭된 이미지 데이터
        const croppedImage = canvas.toDataURL('image/png');
        log('이미지 크롭 완료');
        
        // 클립보드에 직접 복사 시도
        copyToClipboard(croppedImage)
          .then(success => {
            log(`클립보드 복사 결과: ${  success ? '성공' : '실패'}`);
            
            // 크롭된 이미지 데이터 반환
            sendResponse({ 
              croppedImage,
              clipboardSuccess: success 
            });
          })
          .catch(err => {
            log(`클립보드 복사 오류: ${  err.message}`);
            
            sendResponse({ 
              croppedImage,
              clipboardSuccess: false,
              error: err.message
            });
          });
      } catch (err) {
        log(`이미지 그리기 오류: ${  err.message}`);
        sendResponse({ error: `이미지 그리기 오류: ${  err.message}` });
      }
    };

    img.onerror = (error) => {
      log('이미지 로드 실패');
      console.error('이미지 로드 실패:', error);
      sendResponse({ error: '이미지 로드 실패' });
    };

    // 디버깅을 위해 데이터 URL의 일부 출력
    log(`데이터 URL 길이: ${  dataUrl.length  }, 시작 부분: ${  dataUrl.substring(0, 30)  }...`);
    img.src = dataUrl;

    // 비동기 응답을 위해 true 반환
    return true;
  }

  return false;
});

// 초기화 완료 메시지
log('cropper.js 초기화 완료, 메시지 대기 중...');