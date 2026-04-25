import { createClient } from '@supabase/supabase-js';
import type { InquiryData, ReplyData } from '../types/inquiry';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const saveInquiry = async (data: InquiryData) => {
  const { data: result, error } = await supabase
    .from('inquiries')
    .insert([data])
    .select();
  if (error) throw new Error(`문의 저장 오류: ${error.message}`);
  return result;
};

// 문의와 답변을 함께 가져오기
export const fetchInquiries = async () => {
  const { data, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      replies (*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(`데이터 조회 오류: ${error.message}`);
  return data as InquiryData[];
};

// 전용 답변 테이블(replies)에 저장
export const saveReply = async (inquiryId: number, replyText: string) => {
  const { data, error } = await supabase
    .from('replies')
    .insert([{ inquiry_id: inquiryId, reply_text: replyText }])
    .select();
    
  if (error) throw new Error(`답변 저장 오류: ${error.message}`);
  return data[0] as ReplyData;
};
