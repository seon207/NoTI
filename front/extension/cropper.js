/* eslint-disable no-undef */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'cropImage') {
    const { dataUrl, area } = message;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      
      // device pixel ratio 고려하여 캔버스 크기 설정
      const dpr = area.devicePixelRatio || 1;
      canvas.width = area.width * dpr;
      canvas.height = area.height * dpr;
      
      // 이미지에서 선택 영역만 크롭
      ctx.drawImage(
        img,
        area.x * dpr, area.y * dpr,
        area.width * dpr, area.height * dpr,
        0, 0, canvas.width, canvas.height
      );
      
      // 크롭된 이미지 데이터 반환
      sendResponse({ croppedImage: canvas.toDataURL('image/png') });
    };
    
    img.src = dataUrl;
    
    // 여기에 true 반환을 추가하여 비동기 응답 지원 표시
    return true;
  }
  
  // 다른 메시지 타입에 대한 처리가 없으면 undefined를 반환하게 됨
  // 명시적으로 false 반환 추가
  return false;
});