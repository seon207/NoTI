import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageData, metadata } = body;

    if (!imageData) {
      return NextResponse.json(
        { success: false, error: '이미지 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    // Base64 데이터에서 실제 이미지 데이터 추출
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 파일 저장을 위한 고유 ID 생성
    const captureId = uuidv4();
    
    // 파일 경로 설정
    const publicDir = path.join(process.cwd(), 'public');
    const capturesDir = path.join(publicDir, 'captures');
    
    // captures 디렉토리가 없으면 생성
    if (!fs.existsSync(capturesDir)) {
      fs.mkdirSync(capturesDir, { recursive: true });
    }
    
    // 이미지 파일명 생성 (ID + 확장자)
    const filename = `${captureId}.png`;
    const filePath = path.join(capturesDir, filename);
    
    // 이미지 저장
    fs.writeFileSync(filePath, buffer);
    
    // 메타데이터도 함께 저장 (나중에 DB로 대체할 수 있음)
    const metadataWithId = {
      id: captureId,
      ...metadata,
      imagePath: `/captures/${filename}`,
      createdAt: new Date().toISOString(),
    };
    
    const metadataPath = path.join(capturesDir, `${captureId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadataWithId, null, 2));

    // YouTube URL에서 videoId 추출
    let videoId = null;
    if (metadata.url) {
      const urlObj = new URL(metadata.url);
      const searchParams = new URLSearchParams(urlObj.search);
      videoId = searchParams.get('v');
    }
    
    return NextResponse.json({
      success: true,
      id: captureId,
      imagePath: `/captures/${filename}`,
      videoId,
      message: '캡처가 성공적으로 저장되었습니다.',
    });
    
  } catch (error) {
    console.error('캡처 저장 오류:', error);
    return NextResponse.json(
      { success: false, error: '캡처 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}