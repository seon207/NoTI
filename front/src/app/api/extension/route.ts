import { NextRequest, NextResponse } from 'next/server';

// 간단한 메모리 저장소 (실제 프로덕션에서는 DB 사용 필요)
const captureStore: Record<string, any> = {};

export async function POST(request: NextRequest) {
  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const data = await request.json();
    const { imageData, metadata } = data;
    
    // 이미지 데이터 처리 및 저장 로직
    const id = `capture-${Date.now()}`;
    
    // 메모리에 저장 (실제로는 DB에 저장해야 함)
    captureStore[id] = { imageData, metadata };
    
    console.log('Received capture data', { id, timestamp: metadata.timestamp });
    
    return NextResponse.json(
      { success: true, id },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error processing capture:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process capture' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}