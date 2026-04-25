export interface InquiryData {
  id?: number;
  created_at?: string;
  receipt_number: string;
  business_area: string;
  inquiry: string;
  customer_email: string;
  category: string;
  urgency: '높음' | '보통' | '낮음';
  summary: string;
  department: string;
  script: string;
  // 답변 데이터는 이제 별도 인터페이스로 관리하거나 조인해서 가져옴
  replies?: ReplyData[]; 
}

export interface ReplyData {
  id?: number;
  inquiry_id: number;
  created_at?: string;
  reply_text: string;
}

export interface GeminiResponse {
  category: string;
  urgency: '높음' | '보통' | '낮음';
  summary: string;
  department: string;
  script: string;
}
