import React, { useState } from 'react';
import { Send, Loader2, Save, User, FileText, CheckCircle2, AlertCircle, Building2, Sparkles } from 'lucide-react';
import { classifyInquiry } from '../lib/gemini';
import { saveInquiry } from '../lib/supabase';
import type { GeminiResponse } from '../types/inquiry';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AFFILIATES = [
  { id: 'bank', name: '은행', keywords: ['계좌 개설 방법', '직장인 신용대출 금리', '인터넷뱅킹 이체한도', '환전 수수료 우대', '카드 발급 현황'] },
  { id: 'card', name: '카드', keywords: ['결제일 변경 방법', '카드 한도 상향', '분실 신고 및 재발급', 'KB포인트리 사용처', '연체료 조회'] },
  { id: 'insurance', name: '보험', keywords: ['실손보험 청구 서류', '자동차보험 사고접수', '보험계약대출 신청', '해지 환급금 조회', '암보험 가입 내역'] },
  { id: 'securities', name: '증권', keywords: ['주식 계좌 개설', '공모주 청약 일정', '타사 주식 입고', 'HTS/MTS 이용 안내', '증권사 수수료'] },
  { id: 'life', name: '라이프', keywords: ['부동산 시세 조회', '헬스케어 서비스', '여행자 보험 가입', 'KB 상조 서비스', '구독 서비스 혜택'] },
];

const InquiryForm: React.FC = () => {
  const [customerName, setCustomerName] = useState('');
  const [businessArea, setBusinessArea] = useState(AFFILIATES[0].name);
  const [inquiryText, setInquiryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !inquiryText) {
      alert('고객 이름과 문의 내용을 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSaveSuccess(false);

    try {
      const data = await classifyInquiry(inquiryText);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '분류 도중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    setIsSaving(true);
    setError(null);

    try {
      await saveInquiry({
        customer_name: customerName,
        business_area: businessArea,
        inquiry: inquiryText,
        ...result
      });
      setSaveSuccess(true);
      setCustomerName('');
      setInquiryText('');
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 도중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="card-kb p-8">
        <form onSubmit={handleClassify} className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Building2 size={16} className="text-amber-500" />
              계열사 선택
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AFFILIATES.map((aff) => (
                <button
                  key={aff.id}
                  type="button"
                  onClick={() => setBusinessArea(aff.name)}
                  className={cn(
                    "py-3 rounded-xl text-sm font-bold transition-all border",
                    businessArea === aff.name
                      ? "bg-amber-400 border-amber-400 text-amber-950 shadow-md shadow-amber-100"
                      : "bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:bg-amber-50"
                  )}
                >
                  {aff.name}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="w-full flex items-center gap-2 text-[11px] text-slate-400 font-bold mb-1">
                <Sparkles size={12} className="text-amber-400" />
                AI 추천 문의
              </div>
              {AFFILIATES.find(a => a.name === businessArea)?.keywords.map((kw, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInquiryText(kw)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 transition-colors animate-in fade-in zoom-in duration-300"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700" htmlFor="name">
              <User size={16} className="text-amber-500" />
              고객 이름
            </label>
            <input
              id="name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              placeholder="예: 홍길동"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700" htmlFor="inquiry">
              <FileText size={16} className="text-amber-500" />
              문의 내용
            </label>
            <textarea
              id="inquiry"
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
              placeholder="분류할 문의 내용을 입력해 주세요..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-kb btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                AI 분석 중...
              </>
            ) : (
              <>
                <Send size={20} />
                분류하기
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3 animate-in shake duration-500">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-bold">분류 에러 발생</p>
            <pre className="mt-2 text-[10px] bg-white/50 p-2 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 animate-bounce-short">
          <CheckCircle2 size={18} />
          <p className="text-sm font-bold">성공적으로 저장되었습니다.</p>
        </div>
      )}

      {result && (
        <div className="card-kb animate-in zoom-in-95 duration-500">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldCheck className="text-amber-400" />
              AI 분류 결과
            </h3>
            <div className="flex gap-2">
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
                Gemini 3 Flash
              </span>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap gap-3">
              <div className="bg-slate-100 px-4 py-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">카테고리</span>
                <span className="text-slate-800 font-bold">{result.category}</span>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-xl border",
                result.urgency === '높음' ? "bg-red-50 border-red-100 text-red-700" :
                result.urgency === '보통' ? "bg-amber-50 border-amber-100 text-amber-700" :
                "bg-emerald-50 border-emerald-100 text-emerald-700"
              )}>
                <span className="text-[10px] opacity-60 block font-bold uppercase tracking-wider">긴급도</span>
                <span className="font-bold">{result.urgency}</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl text-indigo-700">
                <span className="text-[10px] opacity-60 block font-bold uppercase tracking-wider">담당부서</span>
                <span className="font-bold">{result.department}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-bold">문의 요약</span>
              <p className="text-lg font-bold text-slate-800 leading-snug">
                "{result.summary}"
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
              <span className="text-xs text-slate-400 font-bold block mb-2">권장 응대 스크립트</span>
              <p className="text-slate-600 italic leading-relaxed">
                {result.script}
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-kb bg-slate-900 text-white hover:bg-black w-full shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  저장 중...
                </>
              ) : (
                <>
                  <Save size={20} />
                  시스템에 저장하기
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryForm;

// ShieldCheck icon import fix
import { ShieldCheck as ShieldCheckIcon } from 'lucide-react';
const ShieldCheck = ShieldCheckIcon;
