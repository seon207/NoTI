// service/aiSuggestionService.ts
import { AIGenerateFunction } from '@/types/aiType';

// 목데이터: AI 제안 (실제로는 API 호출로 대체)
const mockAISuggestions: Record<string, string> = {
  '여기에 필기를 시작하세요...': '이 노트에 중요한 내용을 기록해보세요. AI가 더 나은 문장을 제안해드립니다.',
  '슬래시(/) 키를 눌러 다양한 서식을 추가해보세요!': '슬래시(/) 키를 사용하면 다양한 서식과 AI 제안 기능을 활용할 수 있습니다.',
  'Welcome to this demo!': 'Welcome to this interactive BlockNote demo with AI assistance!',
  'This is a heading block': 'Creating Dynamic Content with BlockNote',
  'This is a paragraph block': 'This paragraph demonstrates how BlockNote can be extended with custom AI suggestions to enhance your writing experience.',
  '와우': '놀라운 기능이 추가되었습니다! 이제 AI의 도움을 받아 더 풍부한 콘텐츠를 작성할 수 있습니다.',
};

// AI 제안을 시뮬레이션하는 함수
export const generateAISuggestion: AIGenerateFunction = async (text: string) => 
  // 실제로는 API 호출을 통해 AI 제안을 받아옴
    new Promise((resolve) => {
    setTimeout(() => {
      // 목데이터에 해당 텍스트에 대한 제안이 있으면 반환
      if (mockAISuggestions[text]) {
        resolve(mockAISuggestions[text]);
      } else {
        // 없으면 기본 제안 생성
        resolve(`${text} (AI가 개선한 콘텐츠)`);
      }
    }, 500); // 서버 응답 지연 시뮬레이션
  })
;

// 블록 텍스트 추출 유틸리티 함수
export function getBlockText(block: any): string {
  if (!block.content || !Array.isArray(block.content)) {
    return '';
  }
  
  return block.content
    .filter((item: any) => item.type === 'text')
    .map((item: any) => item.text)
    .join('');
}