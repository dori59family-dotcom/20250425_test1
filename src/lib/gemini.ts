import { GoogleGenAI } from '@google/genai';
import type { GeminiResponse, InquiryData } from '../types/inquiry';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

// 문의 분류
export const classifyInquiry = async (inquiryText: string): Promise<GeminiResponse> => {
  if (!apiKey) throw new Error('환경변수 VITE_GEMINI_API_KEY가 설정되지 않았습니다.');

  const prompt = `
당신은 KB금융그룹의 고객 문의 분류 전문가입니다. 아래 고객의 문의 내용을 분석하여 정해진 JSON 형식으로 응답하세요.

[분류 규칙]
1. 카테고리: 보험금청구, 계약변경, 해지, 상품문의, 대출, 카드, 기타 중 하나 선택
2. 긴급도:
   - 높음: 사고, 분실, 도난, 긴급 의료, 해외 사고 등 즉시 처리 필요
   - 보통: 일반 문의, 상품 가입, 변경 요청
   - 낮음: 단순 확인, 정보 요청
3. 담당부서:
   - 보험금 관련 -> 보상심사팀
   - 대출 관련 -> 여신심사팀
   - 카드 분실/도난 -> 카드관리팀
   - 적금/예금 -> 수신팀
   - 그 외 일반 -> 고객지원팀

[문의 내용]
"${inquiryText}"

응답은 아래 JSON 형식으로만. 마크다운 코드블록이나 설명 텍스트 없이 순수 JSON만 출력.

{
  "category": "카테고리",
  "urgency": "높음|보통|낮음",
  "summary": "한 줄 요약",
  "department": "담당부서",
  "script": "응대 스크립트(3문장 이내)"
}
`;

  const result = await genAI.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  let text = result.text;
  if (!text) throw new Error('Gemini로부터 빈 응답을 받았습니다.');
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(text) as GeminiResponse;
  } catch (e) {
    throw new Error(`JSON 파싱 실패: ${String(e)}\nRaw: ${text.substring(0, 200)}`);
  }
};

// 계열사별 AI 추천 질문 3개 생성
export const generateQuestions = async (affiliateName: string): Promise<string[]> => {
  if (!apiKey) return [];

  const prompt = `KB금융그룹의 "${affiliateName}" 부문에서 고객들이 가장 자주 하는 대표적인 문의 질문 3가지를 생성해주세요.
실제 고객이 할 법한 자연스러운 질문 형식으로 작성하세요.
응답은 순수 JSON만 출력 (마크다운 없이):
{"questions": ["질문1", "질문2", "질문3"]}`;

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    let text = result.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);
    return parsed.questions || [];
  } catch {
    return [];
  }
};

// AI 답변 생성
export const generateReply = async (inquiry: InquiryData): Promise<string> => {
  if (!apiKey) throw new Error('API 키가 설정되지 않았습니다.');

  const prompt = `KB금융그룹 고객센터 담당자로서 아래 고객 문의에 대한 정중하고 전문적인 이메일 답변을 작성해주세요.

[계열사]: ${inquiry.business_area}
[문의내용]: ${inquiry.inquiry}
[카테고리]: ${inquiry.category}
[요약]: ${inquiry.summary}
[담당부서]: ${inquiry.department}
[접수번호]: ${inquiry.receipt_number}

작성 조건:
- 친절한 인사말로 시작
- 접수번호 언급
- 문의 내용에 대한 구체적인 안내
- 마무리 인사 포함
- 이메일 본문만 출력 (제목 없이)`;

  const result = await genAI.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  return result.text?.trim() || '답변을 생성하지 못했습니다.';
};
