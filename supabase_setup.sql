-- KB금융 고객 문의 자동 분류 시스템 (Inquiries Table Setup)
-- 이 SQL을 Supabase SQL Editor에서 실행하세요.

-- 1. 기존 테이블 삭제 (초기화용)
DROP TABLE IF EXISTS inquiries CASCADE;

-- 2. 문의 내역 테이블 생성
CREATE TABLE inquiries (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamptz DEFAULT now(),
    receipt_number text NOT NULL,        -- 자동 생성 접수번호 (예: KBABC1234)
    business_area text NOT NULL,         -- 계열사 (은행, 카드, 보험, 증권, 라이프)
    inquiry text NOT NULL,               -- 고객 문의 원문
    customer_email text NOT NULL,        -- 고객 이메일
    category text NOT NULL,              -- AI 분류 카테고리
    urgency text NOT NULL,               -- 긴급도 (높음/보통/낮음)
    summary text NOT NULL,               -- AI 문의 요약
    department text NOT NULL,            -- 담당 부서
    script text NOT NULL,                -- AI 응대 스크립트
    reply text,                          -- 담당자 이메일 답변 내용
    replied_at timestamptz               -- 답변 시각
);

-- 3. RLS 비활성화 (테스트용 - 실서비스에서는 보안정책 설정 필요)
ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;

-- 4. 인덱스 추가 (최신순 정렬 최적화)
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_receipt_number ON inquiries(receipt_number);

-- 실행 방법:
-- Supabase 대시보드 -> SQL Editor -> '+ New query' -> 본 파일 복사/붙여넣기 -> Run 클릭
