// app/api/video-proxy/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new Response('URL is required', { status: 400 });
  }

  try {
    const response = await fetch(url);

    // 원본 응답의 헤더와 상태 유지
    const headers = new Headers();

    // CORS 헤더 추가
    headers.set('Access-Control-Allow-Origin', '*');

    // Content-Type 및 기타 필요한 헤더 복사
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'access-control-allow-origin') {
        headers.set(key, value);
      }
    });

    // 스트림 방식으로 데이터 전송
    return new Response(response.body, {
      headers,
      status: response.status,
    });
  } catch (error) {
    console.error('프록시 오류:', error);
    return new Response('비디오 프록시 오류', { status: 500 });
  }
}
