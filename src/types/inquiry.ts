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
  reply?: string | null;
  replied_at?: string | null;
}

export interface GeminiResponse {
  category: string;
  urgency: '높음' | '보통' | '낮음';
  summary: string;
  department: string;
  script: string;
}
