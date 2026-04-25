import { createClient } from '@supabase/supabase-js';
import type { InquiryData } from '../types/inquiry';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase 환경변수가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const checkConnection = async () => {
  try {
    const { error } = await supabase.from('inquiries').select('id').limit(1);
    if (error) return { success: false, message: error.message };
    return { success: true, message: '연결 성공' };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
};

export const saveInquiry = async (data: InquiryData) => {
  const { data: result, error } = await supabase
    .from('inquiries')
    .insert([data])
    .select();
  if (error) throw new Error(`데이터 저장 오류: ${error.message}`);
  return result;
};

export const fetchInquiries = async () => {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`데이터 조회 오류: ${error.message}`);
  return data as InquiryData[];
};

export const updateReply = async (id: number, reply: string) => {
  const { error } = await supabase
    .from('inquiries')
    .update({ reply, replied_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`답변 저장 오류: ${error.message}`);
};
