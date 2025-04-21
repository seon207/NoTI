/* eslint-disable */
// 확장 프로그램이 설치될 때 실행
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube 캡처 확장 프로그램이 설치되었습니다.');
});

// 키보드 단축키를 눌렀을 때 실행
chrome.commands.onCommand.addListener(async (command) => {
  console.log('감지된 명령:', command);
  if (command === 'capture-area') {
    // manifest.json에 정의된 명령과 일치하는지 확인
    // 현재 활성화된 탭 가져오기
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    // 영역 선택 캡처 시작
    startAreaCapture(tab.id);
  }
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
      helpText.textContent =
        '캡처할 영역을 드래그하여 선택하세요. ESC를 누르면 취소됩니다.';

      overlay.appendChild(helpText);
      document.body.appendChild(overlay);

      // 선택 영역 요소
      const selection = document.createElement('div');
      selection.id = 'capture-selection';
      selection.style.position = 'absolute';
      selection.style.border = '2px dashed #1a73e8';
      selection.style.backgroundColor = 'rgba(26, 115, 232, 0.1)';
      selection.style.display = 'none';
      overlay.appendChild(selection);

      // 선택 관련 변수
      let startX, startY, endX, endY;
      let isSelecting = false;

      // 마우스 이벤트 핸들러
      overlay.addEventListener('mousedown', (e) => {
        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;

        selection.style.left = `${startX}px`;
        selection.style.top = `${startY}px`;
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

        selection.style.left = `${Math.min(startX, endX)}px`;
        selection.style.top = `${Math.min(startY, endY)}px`;
        selection.style.width = `${width}px`;
        selection.style.height = `${height}px`;
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
            devicePixelRatio: window.devicePixelRatio || 1,
          },
        });

        // 오버레이 제거
        document.body.removeChild(overlay);
      });

      // ESC 키 누르면 캡처 취소
      document.addEventListener(
        'keydown',
        (e) => {
          if (e.key === 'Escape') {
            if (document.getElementById('capture-overlay')) {
              document.body.removeChild(overlay);
            }
          }
        },
        { once: true },
      );
    },
  });
}

// 유튜브 영상 자동 캡처 함수
function captureYoutubeVideo(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    function: () => {
      console.log('유튜브 비디오 캡처 시작');

      // 다양한 선택자로 유튜브 비디오 요소 찾기 시도
      const videoElement =
        document.querySelector('.html5-video-container video') || // 표준 유튜브 플레이어
        document.querySelector('ytd-watch-flexy video') || // 새로운 유튜브 UI
        document.querySelector('iframe[src*="youtube.com"]') || // iframe 내의 유튜브
        document.querySelector('video'); // 일반 비디오 태그

      if (!videoElement) {
        console.error('페이지에서 비디오 요소를 찾을 수 없습니다.');
        alert('페이지에서 비디오 요소를 찾을 수 없습니다.');
        return;
      }

      // 비디오 요소의 위치와 크기 계산
      const rect = videoElement.getBoundingClientRect();
      console.log('비디오 요소 찾음:', rect);

      // 좌표 전송
      chrome.runtime.sendMessage({
        action: 'areaSelected',
        area: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          devicePixelRatio: window.devicePixelRatio || 1,
        },
      });
    },
  });
}

// 메시지 이벤트 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('메시지 수신:', message);

  if (message.action === 'detectVideo') {
    detectVideoInPage(message.tabId, message.url);
  }
  if (message.action === 'startAreaCapture') {
    startAreaCapture(message.tabId);
  } else if (message.action === 'captureYoutubeVideo') {
    captureYoutubeVideo(message.tabId);
  } else if (message.action === 'areaSelected') {
    captureSelectedArea(sender.tab.id, message.area);
  }

  return true; // 비동기 응답을 위해 true 반환
});

// 선택된 영역 캡처 함수
async function captureSelectedArea(tabId, area) {
  console.log('캡처 영역:', area);
  try {
    // 전체 화면 캡처
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
    });
    console.log('화면 캡처 완료');

    // 원본 탭에서 이미지 크롭 및 클립보드 복사 실행
    chrome.scripting.executeScript({
      target: { tabId },
      function: (imageData, captureArea) => {
        console.log('이미지 크롭 시작');

        // 이미지 로드 및 크롭
        const img = new Image();

        img.onload = () => {
          // 크롭 처리
          console.log('이미지 로드 완료, 크롭 중...');

          // 캔버스 생성
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // 디바이스 픽셀 비율 고려
          const dpr = captureArea.devicePixelRatio || 1;
          canvas.width = captureArea.width * dpr;
          canvas.height = captureArea.height * dpr;

          // 이미지 크롭
          ctx.drawImage(
            img,
            captureArea.x * dpr,
            captureArea.y * dpr,
            captureArea.width * dpr,
            captureArea.height * dpr,
            0,
            0,
            canvas.width,
            canvas.height,
          );

          // 크롭된 이미지를 blob으로 변환하여 클립보드에 복사
          canvas.toBlob(
            async (blob) => {
              try {
                // 클립보드에 복사
                const item = new ClipboardItem({ [blob.type]: blob });
                await navigator.clipboard.write([item]);

                // 성공 알림
                const notification = document.createElement('div');
                notification.style.position = 'fixed';
                notification.style.top = '20px';
                notification.style.left = '50%';
                notification.style.transform = 'translateX(-50%)';
                notification.style.padding = '10px 20px';
                notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                notification.style.color = 'white';
                notification.style.borderRadius = '5px';
                notification.style.zIndex = '999999';
                notification.style.fontFamily = 'sans-serif';
                notification.style.fontSize = '14px';
                notification.textContent =
                  '영상 캡처가 클립보드에 복사되었습니다.';

                document.body.appendChild(notification);
                setTimeout(() => {
                  notification.style.opacity = '0';
                  notification.style.transition = 'opacity 0.5s';
                  setTimeout(() => {
                    document.body.removeChild(notification);
                  }, 500);
                }, 2500);

                console.log('클립보드 복사 성공');
              } catch (error) {
                console.error('클립보드 복사 실패:', error);
                alert('클립보드 복사에 실패했습니다: ' + error.message);
              }
            },
            'image/png',
            1.0,
          );
        };

        img.onerror = (error) => {
          console.error('이미지 로드 실패:', error);
          alert('이미지 로드에 실패했습니다.');
        };

        // 이미지 로드 시작
        img.src = imageData;
      },
      args: [dataUrl, area],
    });
  } catch (error) {
    console.error('영역 캡처 실패:', error);
    alert('캡처 과정에서 오류가 발생했습니다: ' + error.message);
  }
}

function detectVideoInPage(tabId, url) {
  chrome.scripting.executeScript({
    target: { tabId },
    function: (pageUrl) => {
      // 비디오 요소 감지
      console.log('페이지에서 비디오 감지 시작');

      // 감지된 비디오 정보 저장 배열
      const detectedVideos = [];
      const seenUrls = new Set(); // 중복 URL 추적

      // 1. HTML5 비디오 태그 확인 - 더 심층적으로 검색
      document.querySelectorAll('video').forEach((video, index) => {
        console.log(`비디오 요소 ${index} 발견:`, video);
        let videoUrl = '';
        let videoTitle = '';

        // 더 다양한 속성 확인
        if (video.src) {
          videoUrl = video.src;
          console.log('직접 src 속성 발견:', videoUrl);
        } else {
          // source 태그 확인
          const sources = video.querySelectorAll('source');
          if (sources.length > 0) {
            for (const source of sources) {
              if (source.src) {
                videoUrl = source.src;
                console.log('source 태그에서 src 발견:', videoUrl);
                break;
              }
            }
          }

          // 추가: data-src 같은 커스텀 속성 확인
          if (!videoUrl) {
            const dataSrc = video.getAttribute('data-src');
            if (dataSrc) {
              videoUrl = dataSrc;
              console.log('data-src 속성 발견:', videoUrl);
            }
          }

          // currentSrc 확인 (브라우저가 선택한 실제 소스)
          if (!videoUrl && video.currentSrc) {
            videoUrl = video.currentSrc;
            console.log('currentSrc 발견:', videoUrl);
          }
        }

        // 제목 추출 시도 (더 다양한 소스에서 찾기)
        // 1. 인접한 heading 요소 확인
        let parent = video.parentElement;
        let found = false;

        while (parent && !found && parent !== document.body) {
          // heading 태그 확인
          const headings = parent.querySelectorAll('h1, h2, h3, h4, h5, h6');
          if (headings.length > 0) {
            videoTitle = headings[0].textContent.trim();
            found = true;
            console.log('제목 발견 (headings):', videoTitle);
            break;
          }

          // 특정 클래스나 ID를 가진 제목 요소 확인
          const titleElements = parent.querySelectorAll(
            '.title, .video-title, [id*="title"]',
          );
          if (titleElements.length > 0) {
            videoTitle = titleElements[0].textContent.trim();
            found = true;
            console.log('제목 발견 (클래스/ID):', videoTitle);
            break;
          }

          parent = parent.parentElement;
        }

        // 제목을 못 찾았으면 페이지 제목 사용
        if (!videoTitle) {
          videoTitle = document.title + ' - 비디오 ' + (index + 1);
          console.log('기본 제목 사용:', videoTitle);
        }

        if (videoUrl && !seenUrls.has(videoUrl)) {
          console.log(`비디오 ${index} 감지 성공:`, {
            url: videoUrl,
            title: videoTitle,
          });
          detectedVideos.push({
            url: videoUrl,
            title: videoTitle,
            type: 'html5',
          });
          seenUrls.add(videoUrl);
        } else {
          console.log(`비디오 ${index}에 URL이 없거나 이미 감지됨`);
        }
      });

      // 2. iframe 확인 - 더 많은 비디오 서비스 지원
      document.querySelectorAll('iframe').forEach((iframe, index) => {
        const src = iframe.src;
        console.log(`iframe ${index} 발견:`, src);

        if (!src || seenUrls.has(src)) return;

        let type = 'iframe';
        let videoId = null;

        // 지원하는 비디오 서비스 목록 확장
        if (src.includes('youtube.com/embed/')) {
          type = 'youtube-embed';
          videoId = new URL(src).pathname.split('/').pop();
        } else if (src.includes('player.vimeo.com')) {
          type = 'vimeo';
          videoId = new URL(src).pathname.split('/').pop();
        } else if (src.includes('dailymotion.com/embed')) {
          type = 'dailymotion';
          videoId = new URL(src).pathname.split('/').pop();
        } else if (src.includes('naver.com/embed')) {
          type = 'naver';
        } else if (src.includes('vlive.tv/embed')) {
          type = 'vlive';
        } else if (src.includes('kakao.com/embed')) {
          type = 'kakao';
        } else if (
          // 기타 비디오 서비스 확인
          src.includes('video') ||
          src.includes('player') ||
          src.includes('embed')
        ) {
          type = 'unknown-video';
        } else {
          // 비디오 서비스가 아닌 iframe은 건너뛰기
          return;
        }

        // iframe 제목 추출
        const iframeTitle =
          iframe.title || document.title + ' - 임베디드 비디오 ' + (index + 1);
        console.log(`iframe ${index} 감지 성공:`, {
          type,
          url: src,
          title: iframeTitle,
        });

        detectedVideos.push({
          url: src,
          title: iframeTitle,
          type: type,
          videoId: videoId,
        });

        seenUrls.add(src);
      });

      // 3. YouTube 특별 처리
      if (pageUrl.includes('youtube.com/watch')) {
        const videoId = new URL(pageUrl).searchParams.get('v');
        if (videoId && !seenUrls.has(pageUrl)) {
          let title = document.title.replace(' - YouTube', '');
          console.log('YouTube 페이지 감지:', { videoId, title });

          detectedVideos.push({
            url: pageUrl,
            title: title,
            type: 'youtube',
            videoId: videoId,
          });

          seenUrls.add(pageUrl);
        }
      }

      // 4. 네이버/다음 동영상 특별 처리
      if (
        pageUrl.includes('tv.naver.com') ||
        pageUrl.includes('tv.kakao.com')
      ) {
        console.log('네이버/카카오 비디오 페이지 감지');
        // 페이지 자체를 비디오 소스로 추가
        if (!seenUrls.has(pageUrl)) {
          detectedVideos.push({
            url: pageUrl,
            title: document.title,
            type: pageUrl.includes('naver') ? 'naver' : 'kakao',
          });
          seenUrls.add(pageUrl);
        }
      }

      // 결과 확인
      console.log(
        `총 ${detectedVideos.length}개 비디오 감지됨:`,
        detectedVideos,
      );

      if (detectedVideos.length > 0) {
        // 알림 표시
        showDetectionResult(detectedVideos);

        // 결과 반환
        return {
          success: true,
          videos: detectedVideos,
        };
      } else {
        console.log('비디오가 감지되지 않음');

        // 사용자에게 알림
        alert('이 페이지에서 비디오를 찾을 수 없습니다.');

        return {
          success: false,
          error: '비디오가 감지되지 않음',
        };
      }

      // 감지 결과 표시 함수는 이전과 동일
      function showDetectionResult(videos) {
        // 기존 코드 유지
      }
    },
    args: [url],
  });
}

// 앱에서 비디오 열기 핸들러 추가
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openVideoInApp') {
    // YouTube 비디오 URL 추출 시도
    let videoId;
    let url = message.videoUrl;

    try {
      const urlObj = new URL(url);

      // YouTube 동영상인 경우
      if (url.includes('youtube.com/watch')) {
        videoId = urlObj.searchParams.get('v');
        chrome.tabs.create({
          url: `http://localhost:3000/watch?v=${videoId}`,
        });
      }
      // YouTube 단축 URL
      else if (url.includes('youtu.be')) {
        videoId = urlObj.pathname.substring(1);
        chrome.tabs.create({
          url: `http://localhost:3000/watch?v=${videoId}`,
        });
      }
      // 기타 비디오인 경우
      else {
        chrome.tabs.create({
          url: `http://localhost:3000/watch?url=${encodeURIComponent(url)}`,
        });
      }
    } catch (error) {
      console.error('URL 파싱 오류:', error);
      // 오류 발생 시 기본 방식으로 전달
      chrome.tabs.create({
        url: `http://localhost:3000/watch?url=${encodeURIComponent(url)}`,
      });
    }
  }
  return true;
});
