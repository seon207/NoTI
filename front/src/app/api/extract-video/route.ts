// app/api/extract-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log('비디오 정보 추출 시작:', url);

    // 프로젝트 루트 기준 바이너리 경로
    const ytdlpPath = path.join(process.cwd(), 'bin', 'yt-dlp.exe');
    console.log('yt-dlp 경로:', ytdlpPath);

    try {
      // 먼저 바이너리가 실행 가능한지 테스트
      await execPromise(`"${ytdlpPath}" --version`);
      console.log('yt-dlp 버전 확인 성공');
    } catch (versionError) {
      console.error('yt-dlp 버전 확인 실패:', versionError);
      return NextResponse.json(
        { error: `yt-dlp 실행 오류: ${(versionError as Error).message}` },
        { status: 500 },
      );
    }

    // 메타데이터 가져오기 (JSON 형식)
    try {
      // 메타데이터 가져오기
      const { stdout: metadataOutput } = await execPromise(
        `"${ytdlpPath}" -j "${url}"`,
      );

      const metadata = JSON.parse(metadataOutput);
      console.log('메타데이터 추출 성공');

      // 라이브 스트림 확인
      const isLive = metadata.is_live || metadata.live_status === 'is_live';
      console.log('라이브 스트림 여부:', isLive);

      let videoUrlCmd;

      if (isLive) {
        // 라이브 스트림에 적합한 포맷
        videoUrlCmd = `"${ytdlpPath}" -g -f "best" "${url}"`;
      } else {
        // 일반 영상
        videoUrlCmd = `"${ytdlpPath}" -g -f "best[height<=720]/best" "${url}"`;
      }

      const { stdout: videoUrlOutput } = await execPromise(videoUrlCmd);
      const videoUrl = videoUrlOutput.trim();

      return NextResponse.json({
        videoUrl,
        title: metadata.title || '제목 없음',
        thumbnail: metadata.thumbnail,
        duration: metadata.duration,
        isLive,
      });
    } catch (ytdlpError) {
      console.error('yt-dlp 실행 오류:', ytdlpError);

      // 명령어 실행 결과의 stderr 확인
      const errorDetail =
        (ytdlpError as any).stderr || (ytdlpError as Error).message;

      return NextResponse.json(
        { error: `영상 정보 추출 실패: ${errorDetail}` },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('전체 오류:', error);
    return NextResponse.json(
      { error: `서버 오류: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
