/* eslint-disable no-undef */
// 콘텐츠 스크립트
console.log(
  '영상 캡처 및 필기 확장 프로그램의 content script가 로드되었습니다.',
);

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
        action: 'startAreaCapture',
        tabId: chrome.runtime.id
      });
    } else if (event.data.action === 'requestVideoCapture') {
      // 영상 전체 캡처 요청을 백그라운드 스크립트로 전달
      chrome.runtime.sendMessage({
        action: 'captureVideo',
        tabId: chrome.runtime.id
      });
    }
  }
});

// 웹 앱에서 오는 메시지 리스닝
window.addEventListener('message', (event) => {
  // 메시지가 웹 앱에서 온 것인지 확인
  if (event.data.source === 'youtube-note-app') {
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
        action: 'startAreaCapture',
        tabId: chrome.runtime.id
      });
    } else if (event.data.action === 'requestVideoCapture') {
      // 영상 전체 캡처 요청을 백그라운드 스크립트로 전달
      chrome.runtime.sendMessage({
        action: 'captureVideo',
        tabId: chrome.runtime.id
      });
    }
  }
});

function notifyExtensionPresence() {
  window.postMessage(
    {
      source: 'youtube-capture-extension',
      action: 'extensionAvailable',
    },
    '*'
  );
}

// 페이지 로드 완료 시 실행
window.addEventListener('load', () => {
  // 약간의 지연 후 알림 (페이지 초기화 완료 후)
  setTimeout(notifyExtensionPresence, 1000);
});

// 페이지 로드 완료 시 실행
window.addEventListener('load', () => {
  // 약간의 지연 후 알림 (페이지 초기화 완료 후)
  setTimeout(notifyExtensionPresence, 1000);
});

// 현재 페이지에서 비디오 요소 감지 함수
function detectVideosInPage() {
  console.log('페이지에서 비디오 요소 감지 시작');

  // 감지된 비디오 정보 저장 배열
  const detectedVideos = [];
  const seenUrls = new Set(); // 중복 URL 추적

  // 1. HTML5 비디오 태그 감지
  document.querySelectorAll('video').forEach((video, index) => {
    console.log(`비디오 요소 ${index} 발견:`, video);
    let videoUrl = '';

    // 비디오 URL 찾기 - 다양한 방법 시도
    if (video.src) {
      videoUrl = video.src;
    } else if (video.currentSrc) {
      videoUrl = video.currentSrc;
    } else {
      // source 태그 확인
      const sources = video.querySelectorAll('source');
      if (sources.length > 0) {
        Array.from(sources).some((source) => {
          if (source.src) {
            videoUrl = source.src;
            return true; // 루프 종료
          }
          return false;
        });
      }
    }

    // 재생 가능한 비디오 요소를 찾은 경우
    if (videoUrl && !seenUrls.has(videoUrl)) {
      detectedVideos.push({
        element: video,
        url: videoUrl,
        type: 'html5',
      });
      seenUrls.add(videoUrl);
    }
  });

  // 2. iframe 비디오 감지
  document.querySelectorAll('iframe').forEach((iframe, _index) => {
    const { src } = iframe;

    if (!src || seenUrls.has(src)) return;

    let type = 'iframe';

    // 지원하는 비디오 플랫폼 확인
    if (src.includes('youtube.com/embed/')) {
      type = 'youtube-embed';

      // 라이브 스트림 감지
      if (src.includes('&live=1') || src.includes('?live=1')) {
        type = 'youtube-live';
      }
    } else if (src.includes('player.vimeo.com')) {
      type = 'vimeo';
    } else if (src.includes('dailymotion.com/embed')) {
      type = 'dailymotion';
    } else if (src.includes('naver.com/embed')) {
      type = 'naver';
    } else if (src.includes('kakao.com/embed')) {
      type = 'kakao';
    } else if (
      src.includes('video') ||
      src.includes('player') ||
      src.includes('embed')
    ) {
      type = 'unknown-video';
    } else {
      // 비디오 관련 iframe이 아니면 건너뛰기
      return;
    }

    detectedVideos.push({
      element: iframe,
      url: src,
      type,
    });

    seenUrls.add(src);
  });

  // 3. YouTube 특별 처리
  if (window.location.href.includes('youtube.com/watch')) {
    const videoId = new URL(window.location.href).searchParams.get('v');
    if (videoId) {
      // 라이브 스트림인지 확인
      const isLive =
        !!document.querySelector('.ytp-live') ||
        !!document.querySelector('.ytp-live-badge') ||
        document.title.includes('(LIVE)') ||
        !!document.querySelector(
          'ytd-video-primary-info-renderer .ytd-video-primary-info-renderer[is-live]',
        );

      detectedVideos.push({
        url: window.location.href,
        type: isLive ? 'youtube-live' : 'youtube',
        isLive,
      });
    }
  }

  // 4. YouTube 라이브 특별 처리
  if (window.location.href.includes('youtube.com/live')) {
    detectedVideos.push({
      url: window.location.href,
      type: 'youtube-live',
      isLive: true,
    });
  }

  console.log(`총 ${detectedVideos.length}개 비디오 감지됨:`, detectedVideos);
  return detectedVideos;
}

// 비디오 메타데이터 정보 수집
function getVideoMetadata() {
  // 현재 페이지의 메타 태그 정보 수집
  const metadata = {
    title: document.title,
    ogTitle: '',
    ogImage: '',
    ogType: '',
    ogUrl: '',
    twitterCard: '',
    twitterTitle: '',
    twitterImage: '',
    description: '',
    canonical: '',
    hqThumbnail: '',
    duration: '',
  };

  // Open Graph 메타 태그
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) metadata.ogTitle = ogTitle.content;

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) metadata.ogImage = ogImage.content;

  const ogType = document.querySelector('meta[property="og:type"]');
  if (ogType) metadata.ogType = ogType.content;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) metadata.ogUrl = ogUrl.content;

  // Twitter 메타 태그
  const twitterCard = document.querySelector('meta[name="twitter:card"]');
  if (twitterCard) metadata.twitterCard = twitterCard.content;

  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) metadata.twitterTitle = twitterTitle.content;

  const twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (twitterImage) metadata.twitterImage = twitterImage.content;

  // 기타 메타 태그
  const description = document.querySelector('meta[name="description"]');
  if (description) metadata.description = description.content;

  // 캐노니컬 링크
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) metadata.canonical = canonical.href;

  // YouTube 특별 처리 - 비디오 ID, 썸네일, 재생 시간 등
  if (window.location.href.includes('youtube.com/watch')) {
    const videoId = new URL(window.location.href).searchParams.get('v');
    if (videoId) {
      metadata.videoId = videoId;
      metadata.hqThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      // 재생 시간 찾기 (비디오 정보에서)
      const durationElement = document.querySelector('.ytp-time-duration');
      if (durationElement) {
        metadata.duration = durationElement.textContent;
      }
    }
  }

  return metadata;
}

// 유튜브 영상 캡처 지원 함수
function captureYoutubeVideo() {
  // YouTube 비디오 요소 찾기
  const videoElement =
    document.querySelector('.html5-video-container video') ||
    document.querySelector('ytd-watch-flexy video') ||
    document.querySelector('video');

  if (!videoElement) {
    console.error('YouTube 비디오 요소를 찾을 수 없습니다.');
    return null;
  }

  try {
    // 캔버스에 비디오 프레임 그리기
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // 현재 재생 시간 정보
    const { currentTime } = videoElement;

    return {
      dataUrl: canvas.toDataURL('image/png'),
      currentTime,
      width: canvas.width,
      height: canvas.height,
    };
  } catch (error) {
    console.error('비디오 캡처 오류:', error);
    return null;
  }
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script 메시지 수신:', message);

  // 페이지 내 비디오 감지 요청
  if (message.action === 'detectVideos') {
    const videos = detectVideosInPage();
    const metadata = getVideoMetadata();
    sendResponse({
      success: videos.length > 0,
      videos,
      metadata,
    });
    return true;
  }

  // YouTube 비디오 캡처 요청
  if (message.action === 'captureYoutubeVideo') {
    const capturedData = captureYoutubeVideo();
    if (capturedData) {
      sendResponse({ success: true, ...capturedData });
    } else {
      sendResponse({ success: false, error: '비디오 캡처 실패' });
    }
    return true;
  }
  
  // 캡처된 이미지 처리 - background에서 content script로 전달
  if (message.action === 'capturedImage') {
    // 웹 앱으로 이미지 전달
    window.postMessage(
      {
        source: 'youtube-capture-extension',
        action: 'insertImage',
        imageData: message.imageData,
        currentTime: message.currentTime
      },
      '*'
    );
    sendResponse({ success: true });
    return true;
  }

  // 기본 응답
  sendResponse({ success: false, error: '지원하지 않는 액션' });
  return false;
});

// 페이지 로드 시 자동 비디오 감지 (선택적)
window.addEventListener('load', () => {
  // 일부 사이트에서만 자동 감지 (예: YouTube)
  if (
    window.location.href.includes('youtube.com/watch') ||
    window.location.href.includes('youtube.com/live')
  ) {
    console.log('YouTube 페이지 감지: 비디오 정보 수집');
    const videos = detectVideosInPage();
    const metadata = getVideoMetadata();

    if (videos.length > 0) {
      // 백그라운드 스크립트로 정보 전송
      chrome.runtime.sendMessage({
        action: 'videoDetected',
        videos,
        metadata,
        url: window.location.href,
      });
    }
  }
});

// YouTube 특정 이벤트 리스너 (예: 새 비디오 로드 감지)
if (window.location.href.includes('youtube.com')) {
  // YouTube의 네비게이션 변경 감지 (SPA 동작)
  let lastUrl = window.location.href;

  // URL 변경 감지를 위한 인터벌 설정
  setInterval(() => {
    if (lastUrl !== window.location.href) {
      console.log('YouTube URL 변경 감지:', window.location.href);
      lastUrl = window.location.href;

      // 새 URL이 비디오 페이지인 경우
      if (
        window.location.href.includes('/watch') ||
        window.location.href.includes('/live')
      ) {
        setTimeout(() => {
          console.log('새 YouTube 비디오 페이지 감지: 비디오 정보 수집');
          const videos = detectVideosInPage();
          const metadata = getVideoMetadata();

          if (videos.length > 0) {
            chrome.runtime.sendMessage({
              action: 'videoDetected',
              videos,
              metadata,
              url: window.location.href,
            });
          }
        }, 1500); // 페이지 로드 시간 고려
      }
    }
  }, 1000);
}