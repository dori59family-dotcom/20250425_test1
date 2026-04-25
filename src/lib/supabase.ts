import { createClient } from '@supabase/supabase-js';
import type { InquiryData } from '../types/inquiry';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase 환경변수(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)가 설정되지 않았습니다. .env 파일을 확인해 주세요.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Supabase 연결 상태를 확인하는 함수
 */
export const checkConnection = async () => {
  try {
    const { error } = await supabase.from('inquiries').select('id').limit(1);
    if (error) {
      console.error('Supabase 연결 오류:', error.message);
      return { success: false, message: error.message };
    }
    return { success: true, message: '연결 성공' };
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 연결 오류';
    console.error('Supabase 연결 체크 실패:', message);
    return { success: false, message };
  }
};

export const saveInquiry = async (data: InquiryData) => {
  const { data: result, error } = await supabase
    .from('inquiries')
    .insert([data])
    .select();
  
  if (error) {
    console.error('저장 실패:', error);
    throw new Error(`데이터 저장 중 오류가 발생했습니다: ${error.message}`);
  }
  return result;
};

export const fetchInquiries = async () => {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('조회 실패:', error);
    throw new Error(`데이터 조회 중 오류가 발생했습니다: ${error.message}`);
  }
  return data as InquiryData[];
};
