// utils/videoUtils.ts

export type VideoType =
  | 'youtube'
  | 'youtube-live'
  | 'vimeo'
  | 'dailymotion'
  | 'naver'
  | 'kakao'
  | 'html5'
  | 'unknown';

export interface VideoInfo {
  platform: VideoType;
  videoId: string;
  isLive?: boolean;
}

export interface EmbedUrlOptions {
  platform: VideoType | string;
  videoId?: string;
  url?: string;
  timestamp?: number;
  autoPlay?: boolean;
  muted?: boolean;
  isLive?: boolean;
}

/**
 * URL에서 비디오 플랫폼과 ID 추출
 */
export function extractVideoInfo(url: string): VideoInfo {
  if (!url) return { platform: 'unknown', videoId: '' };

  try {
    // URL 정규화 (프로토콜 추가)
    let normalizedUrl = url; // 새로운 변수 선언
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // URL 파싱
    const parsedUrl = new URL(url);

    // YouTube 감지
    if (
      parsedUrl.hostname.includes('youtube.com') ||
      parsedUrl.hostname === 'youtu.be'
    ) {
      // 1. youtube.com/watch?v=ID
      if (parsedUrl.pathname === '/watch') {
        const videoId = parsedUrl.searchParams.get('v');
        // 라이브 스트림 확인
        const isLive = url.includes('&live=1') || url.includes('?live=1');

        if (videoId) {
          return {
            platform: isLive ? 'youtube-live' : 'youtube',
            videoId,
            isLive,
          };
        }
      }

      // 2. youtu.be/ID (단축 URL)
      else if (parsedUrl.hostname === 'youtu.be') {
        const videoId = parsedUrl.pathname.substring(1);
        if (videoId) {
          return { platform: 'youtube', videoId };
        }
      }

      // 3. youtube.com/embed/ID (임베드)
      else if (parsedUrl.pathname.startsWith('/embed/')) {
        const videoId = parsedUrl.pathname.split('/')[2];
        // 라이브 확인
        const isLive = url.includes('&live=1') || url.includes('?live=1');

        if (videoId) {
          return {
            platform: isLive ? 'youtube-live' : 'youtube',
            videoId,
            isLive,
          };
        }
      }

      // 4. youtube.com/live/ID (라이브 스트림)
      else if (parsedUrl.pathname.startsWith('/live/')) {
        const videoId = parsedUrl.pathname.split('/')[2];
        if (videoId) {
          return { platform: 'youtube-live', videoId, isLive: true };
        }
      }
    }

    // Vimeo 감지
    else if (parsedUrl.hostname.includes('vimeo.com')) {
      // vimeo.com/ID
      const matches = parsedUrl.pathname.match(/^\/(\d+)(?:\/|\?|$)/);
      if (matches && matches[1]) {
        return { platform: 'vimeo', videoId: matches[1] };
      }

      // player.vimeo.com/video/ID
      if (parsedUrl.pathname.startsWith('/video/')) {
        const videoId = parsedUrl.pathname.split('/')[2];
        if (videoId) {
          return { platform: 'vimeo', videoId };
        }
      }
    }

    // Dailymotion 감지
    else if (
      parsedUrl.hostname.includes('dailymotion.com') ||
      parsedUrl.hostname.includes('dai.ly')
    ) {
      // dailymotion.com/video/ID
      if (parsedUrl.pathname.startsWith('/video/')) {
        const videoId = parsedUrl.pathname.split('/')[2].split('_')[0];
        if (videoId) {
          return { platform: 'dailymotion', videoId };
        }
      }

      // dai.ly/ID (단축 URL)
      if (parsedUrl.hostname === 'dai.ly') {
        const videoId = parsedUrl.pathname.substring(1);
        if (videoId) {
          return { platform: 'dailymotion', videoId };
        }
      }
    }

    // 네이버 TV 감지
    else if (parsedUrl.hostname.includes('tv.naver.com')) {
      if (
        parsedUrl.pathname.includes('/v/') ||
        parsedUrl.pathname.includes('/l/')
      ) {
        // tv.naver.com/v/ID 또는 tv.naver.com/l/ID (라이브)
        const isLive = parsedUrl.pathname.includes('/l/');
        const pathParts = parsedUrl.pathname.split('/');
        const videoId = pathParts[pathParts.length - 1];

        if (videoId) {
          return {
            platform: 'naver',
            videoId,
            isLive,
          };
        }
      }
    }

    // 카카오 TV 감지
    else if (parsedUrl.hostname.includes('tv.kakao.com')) {
      // tv.kakao.com/v/ID
      if (parsedUrl.pathname.startsWith('/v/')) {
        const videoId = parsedUrl.pathname.split('/')[2];
        if (videoId) {
          return { platform: 'kakao', videoId };
        }
      }

      // tv.kakao.com/channel/ID/cliplink/ID
      if (parsedUrl.pathname.includes('/cliplink/')) {
        const videoId = parsedUrl.pathname.split('/').pop();
        if (videoId) {
          return { platform: 'kakao', videoId };
        }
      }
    }

    // 일반 HTML5 비디오인 경우 URL 자체를 ID로 사용
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return { platform: 'html5', videoId: url };
    }

    // 플랫폼을 감지할 수 없는 경우
    return { platform: 'unknown', videoId: url };
  } catch (error) {
    console.error('비디오 URL 파싱 오류:', error);
    return { platform: 'unknown', videoId: url };
  }
}

/**
 * 플랫폼별 임베드 URL 생성
 */
export function generateEmbedUrl(options: EmbedUrlOptions): string {
  const {
    platform,
    videoId,
    url,
    timestamp = 0,
    autoPlay = true,
    muted = false,
    isLive = false,
  } = options;

  // 플랫폼에 따른 임베드 URL 생성
  switch (platform) {
    case 'youtube':
    case 'youtube-live': {
      if (!videoId) return '';

      const youtubeParams = new URLSearchParams({
        autoplay: autoPlay ? '1' : '0',
        mute: muted ? '1' : '0',
        rel: '0',
        modestbranding: '1',
        enablejsapi: '1',
        origin: typeof window !== 'undefined' ? window.location.origin : '',
      });

      // 라이브가 아닌 경우에만 시작 시간 추가
      if (!isLive && timestamp > 0) {
        youtubeParams.append('start', Math.floor(timestamp).toString());
      }

      return `https://www.youtube.com/embed/${videoId}?${youtubeParams.toString()}`;
    }

    case 'vimeo': {
      if (!videoId) return '';

      const vimeoParams = new URLSearchParams({
        autoplay: autoPlay ? '1' : '0',
        muted: muted ? '1' : '0',
        transparent: '0',
        app_id: '58479',
      });

      // 시작 시간 설정 (Vimeo는 다른 방식 사용)
      const vimeoUrl = `https://player.vimeo.com/video/${videoId}?${vimeoParams.toString()}`;
      return timestamp > 0 ? `${vimeoUrl}#t=${timestamp}s` : vimeoUrl;
    }

    case 'dailymotion': {
      if (!videoId) return '';

      const dailymotionParams = new URLSearchParams({
        autoplay: autoPlay ? '1' : '0',
        mute: muted ? '1' : '0',
        'sharing-enable': '0',
        'ui-start-screen-info': '0',
      });

      if (timestamp > 0) {
        dailymotionParams.append('start', Math.floor(timestamp).toString());
      }

      return `https://www.dailymotion.com/embed/video/${videoId}?${dailymotionParams.toString()}`;
    }

    case 'naver': {
      if (!videoId) return '';

      // 네이버 TV는 파라미터 제한적
      const naverParams = new URLSearchParams({
        autoPlay: autoPlay ? 'true' : 'false',
      });

      // 라이브인지 일반 비디오인지에 따라 다른 URL 사용
      const naverBaseUrl = isLive
        ? `https://tv.naver.com/l/${videoId}/live`
        : `https://tv.naver.com/embed/${videoId}`;

      return `${naverBaseUrl}?${naverParams.toString()}`;
    }

    case 'kakao': {
      if (!videoId) return '';

      // 카카오 TV는 파라미터 제한적
      return `https://tv.kakao.com/embed/player/cliplink/${videoId}?autoplay=${autoPlay ? '1' : '0'}`;
    }

    case 'html5':
      // 직접 HTML5 비디오 URL인 경우 그대로 사용
      return videoId || url || '';

    default:
      // 알 수 없는 플랫폼이지만 URL이 있는 경우 시도
      return url || '';
  }
}
/**
 * 초 단위 시간을 00:00:00 형식으로 변환
 */
export function formatTime(seconds: number): string {
  if (Number.isNaN(seconds)) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  // 시간이 있는 경우 00:00:00, 없는 경우 00:00 형식
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 00:00:00 형식 문자열을 초 단위로 변환
 */
export function parseTime(timeString: string): number {
  if (!timeString) return 0;

  const parts = timeString.split(':').map((part) => parseInt(part, 10));

  if (parts.length === 3) {
    // 00:00:00 형식
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    // 00:00 형식
    return parts[0] * 60 + parts[1];
  }

  return 0;
}
