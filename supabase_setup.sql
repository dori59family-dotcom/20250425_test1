-- KB금융 고객 문의 자동 분류 시스템 (Inquiries Table Setup)
-- 이 SQL을 Supabase SQL Editor에서 실행하세요.

-- 1. 기존 테이블 삭제 (초기화용)
DROP TABLE IF EXISTS inquiries CASCADE;

-- 2. 문의 내역 테이블 생성
CREATE TABLE inquiries (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamptz DEFAULT now(),
    customer_name text NOT NULL,
    business_area text NOT NULL,
    inquiry text NOT NULL,
    category text NOT NULL,
    urgency text NOT NULL,
    summary text NOT NULL,
    department text NOT NULL,
    script text NOT NULL
);

-- 3. RLS 비활성화 (실습 및 테스트용)
ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;

-- 4. 인덱스 추가 (조회 성능 최적화)
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- 실행 방법:
-- Supabase 대시보드 -> SQL Editor -> '+ New query' 클릭 -> 본 파일 내용을 복사/붙여넣기 -> 'Run' 클릭
