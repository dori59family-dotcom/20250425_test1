export interface InquiryData {
  id?: number;
  created_at?: string;
  customer_name: string;
  business_area: string;
  inquiry: string;
  category: string;
  urgency: '높음' | '보통' | '낮음';
  summary: string;
  department: string;
  script: string;
}

export interface GeminiResponse {
  category: string;
  urgency: '높음' | '보통' | '낮음';
  summary: string;
  department: string;
  script: string;
}
