# KB금융그룹 고객 문의 자동 분류 시스템 구축 계획서

본 프로젝트는 KB금융그룹의 고객 문의를 효율적으로 처리하기 위해 AI(Gemini 3 Flash)를 활용하여 자동으로 분류, 요약, 응대 스크립트를 생성하고 Supabase에 저장하는 웹 애플리케이션입니다.

## User Review Required

> [!IMPORTANT]
> **모델 버전 확인**: 사용자의 요청에 따라 `gemini-3-flash` 모델을 사용합니다. 2026년 기준 최신 모델 명칭을 적용하며, 화면에도 동일하게 표기합니다.
> **환경 변수**: 제공해주신 Supabase URL과 Key, Gemini API Key를 `.env` 파일에 즉시 설정합니다.
> **보안**: 실습용으로 RLS(Row Level Security)를 비활성화(`DISABLE ROW LEVEL SECURITY`)하는 SQL을 작성합니다.

## Proposed Changes

### 1. 생성할 파일 목록

| 파일명 | 역할 |
| :--- | :--- |
| `supabase_setup.sql` | Supabase `inquiries` 테이블 생성 및 설정 SQL |
| `.env` / `.env.example` | Gemini 및 Supabase 환경 변수 설정 |
| `src/types/inquiry.ts` | 문의 데이터 및 Gemini 응답 포맷 인터페이스 정의 |
| `src/lib/supabase.ts` | Supabase 클라이언트 초기화 및 설정 |
| `src/lib/gemini.ts` | Gemini 3 Flash 호출 로직 및 JSON 파싱 처리 |
| `src/components/Layout.tsx` | 메인 레이아웃 및 상단 탭 내비게이션 |
| `src/components/InquiryForm.tsx` | 문의 입력, 분류 요청, 결과 표시 및 저장 (화면 1) |
| `src/components/InquiryList.tsx` | 문의 내역 조회, 테이블 표시 및 CSV 다운로드 (화면 2) |
| `src/index.css` | Tailwind CSS v4 스타일링 및 전역 스타일 |
| `vite.config.ts` | Tailwind CSS v4 플러그인 설정 및 빌드 최적화 |

---

### 2. 설치할 npm 패키지 목록

- **핵심**: `react`, `react-dom`, `typescript`, `vite`
- **스타일**: `tailwindcss`, `@tailwindcss/vite`, `lucide-react` (아이콘), `clsx`, `tailwind-merge`
- **라이브러리**: `@google/genai`, `@supabase/supabase-js`, `tslib` (Supabase 빌드 대응)

---

### 3. 구현 순서

1.  **환경 구성**: Vite 프로젝트 생성 및 Tailwind CSS v4 설정, `.env` 파일 생성.
2.  **데이터베이스 준비**: `supabase_setup.sql` 작성 및 Supabase 연결 테스트.
3.  **핵심 로직 구현**:
    - Gemini 3 Flash 호출 및 JSON 파싱 로직 (`src/lib/gemini.ts`).
    - Supabase CRUD 로직 (`src/lib/supabase.ts`).
4.  **UI 컴포넌트 개발**:
    - 상단 탭 시스템 및 레이아웃.
    - 문의 입력 폼 및 결과 카드 (로딩 상태 포함).
    - 문의 내역 테이블 및 CSV 다운로드 기능.
5.  **에러 핸들링 및 폴리싱**: API 키 누락, 파싱 실패, 네트워크 에러 처리 및 반응형 디자인 적용.

---

### 4. 핵심 로직 개요

#### Gemini 호출 및 파싱 (`src/lib/gemini.ts`)
- `gemini-3-flash` 모델 사용.
- 시스템 프롬프트: 카테고리(7종), 긴급도(3단계), 담당부서 할당 규칙 포함.
- 후처리: `replace(/```json|```/g, "")`를 통해 마크다운 코드블록 제거 후 `JSON.parse`.
- 실패 시 에러 메시지와 함께 raw 응답의 앞 200자 표시.

#### Supabase 연동 (`src/lib/supabase.ts`)
- `inquiries` 테이블에 자동 분류된 데이터 저장.
- 전체 내역 조회 시 `created_at` 기준 내림차순 정렬.

---

### 5. 예상되는 주요 리스크

- **JSON 파싱 에러**: LLM이 간혹 JSON 형식을 완벽하게 지키지 않을 수 있으므로, 엄격한 프롬프트 제어와 유연한 전처리가 필요합니다.
- **API 할당량**: Gemini 3 Flash는 효율적이지만, 잦은 호출 시 할당량 초과 가능성이 있으므로 에러 메시지를 명확히 표시합니다.
- **Supabase 연결**: 네트워크 환경에 따른 연결 지연 및 실패에 대비한 재시도 버튼을 구현합니다.

## Verification Plan

### Automated Tests (Browser-based)
- `npm run dev` 실행 후 로컬 환경에서 기능 확인.
- 문의 입력 후 분류 결과가 올바른 카테고리와 부서로 할당되는지 확인.
- 저장 후 '문의 내역' 탭에서 데이터가 즉시 나타나는지 확인.
- CSV 다운로드 파일의 내용 정합성 확인.

### Manual Verification
- 환경 변수 미설정 시 안내 메시지 출력 확인.
- 모바일 뷰포트에서 레이아웃 깨짐 현상 확인.
