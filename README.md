# KB금융 고객 문의 자동 분류 시스템

AI(Gemini 3 Flash)를 활용하여 고객 문의를 자동으로 분류하고 관리하는 시스템입니다.

## 주요 기능
- **문의 자동 분류**: Gemini 3 Flash가 문의 내용을 분석하여 카테고리, 긴급도, 담당부서를 자동으로 지정합니다.
- **응대 스크립트 생성**: 분석 결과에 따른 최적의 고객 응대 스크립트를 제공합니다.
- **실시간 저장**: 분석된 데이터는 Supabase 데이터베이스에 즉시 저장됩니다.
- **내역 관리**: 저장된 모든 문의 내역을 조회하고 CSV 파일로 다운로드할 수 있습니다.

## 기술 스택
- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4
- **AI**: Google Gemini 3 Flash (@google/genai)
- **Backend/DB**: Supabase (@supabase/supabase-js)

## 시작하기

### 1. 환경 변수 설정
`.env` 파일을 생성하고 아래 항목을 입력하세요:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 2. 데이터베이스 설정
`supabase_setup.sql` 파일의 내용을 Supabase SQL Editor에서 실행하여 `inquiries` 테이블을 생성하세요.

### 3. 로컬 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## Vercel 배포 방법
1. GitHub 저장소에 푸시합니다.
2. Vercel 대시보드에서 프로젝트를 Import 합니다.
3. Environment Variables 섹션에 위 3가지 환경 변수를 입력합니다.
4. 'Deploy' 버튼을 클릭합니다.
