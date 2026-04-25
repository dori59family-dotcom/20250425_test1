import React, { useState, useEffect } from 'react';
import { Send, Loader2, Save, FileText, CheckCircle2, AlertCircle, Building2, Sparkles, Mail, X, ShieldCheck } from 'lucide-react';
import { classifyInquiry, generateQuestions } from '../lib/gemini';
import { saveInquiry } from '../lib/supabase';
import type { GeminiResponse } from '../types/inquiry';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AFFILIATES = [
  { id: 'bank', name: '은행' },
  { id: 'card', name: '카드' },
  { id: 'insurance', name: '보험' },
  { id: 'securities', name: '증권' },
  { id: 'life', name: '라이프' },
];

function generateReceiptNumber(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  let code = 'KB';
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 4; i++) code += digits[Math.floor(Math.random() * digits.length)];
  return code;
}

const InquiryForm: React.FC = () => {
  const [businessArea, setBusinessArea] = useState(AFFILIATES[0].name);
  const [inquiryText, setInquiryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoadingQuestions(true);
      setQuestions([]);
      try {
        const qs = await generateQuestions(businessArea);
        setQuestions(qs);
      } catch {
        setQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    load();
  }, [businessArea]);

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) { alert('문의 내용을 입력해 주세요.'); return; }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSaveSuccess(null);
    try {
      const data = await classifyInquiry(inquiryText);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '분류 도중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfirm = async () => {
    if (!result || !customerEmail.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      alert('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    setIsSaving(true);
    setError(null);
    const receiptNumber = generateReceiptNumber();
    try {
      await saveInquiry({
        receipt_number: receiptNumber,
        business_area: businessArea,
        customer_email: customerEmail,
        inquiry: inquiryText,
        ...result,
      });
      setSaveSuccess(receiptNumber);
      setShowEmailModal(false);
      setInquiryText('');
      setCustomerEmail('');
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
          {/* 계열사 선택 */}
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
                    'py-3 rounded-xl text-sm font-bold transition-all border',
                    businessArea === aff.name
                      ? 'bg-amber-400 border-amber-400 text-amber-950 shadow-md shadow-amber-100'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:bg-amber-50'
                  )}
                >
                  {aff.name}
                </button>
              ))}
            </div>

            {/* AI 추천 질문 */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold">
                <Sparkles size={12} className="text-amber-400" />
                AI 추천 질문
                {isLoadingQuestions && <Loader2 size={12} className="animate-spin text-amber-400 ml-1" />}
              </div>
              {isLoadingQuestions ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                questions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInquiryText(q)}
                    className="bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 transition-all text-left"
                  >
                    <span className="text-amber-500 font-bold mr-2">Q{i + 1}.</span>{q}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 문의 내용 */}
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
              <><Loader2 className="animate-spin" size={20} />AI 분석 중...</>
            ) : (
              <><Send size={20} />분류하기</>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-bold">에러 발생</p>
            <pre className="mt-2 text-[10px] bg-white/50 p-2 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap">{error}</pre>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-5 rounded-2xl flex items-center gap-3">
          <CheckCircle2 size={20} />
          <div>
            <p className="font-bold text-sm">저장 완료!</p>
            <p className="text-xs mt-0.5">접수번호: <span className="font-mono font-bold">{saveSuccess}</span></p>
          </div>
        </div>
      )}

      {result && (
        <div className="card-kb animate-in zoom-in-95 duration-500">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldCheck className="text-amber-400" size={18} />
              AI 분류 결과
            </h3>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">Gemini AI</span>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap gap-3">
              <div className="bg-slate-100 px-4 py-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">카테고리</span>
                <span className="text-slate-800 font-bold">{result.category}</span>
              </div>
              <div className={cn(
                'px-4 py-2 rounded-xl border',
                result.urgency === '높음' ? 'bg-red-50 border-red-100 text-red-700' :
                result.urgency === '보통' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                'bg-emerald-50 border-emerald-100 text-emerald-700'
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
              <p className="text-lg font-bold text-slate-800 leading-snug">"{result.summary}"</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
              <span className="text-xs text-slate-400 font-bold block mb-2">권장 응대 스크립트</span>
              <p className="text-slate-600 italic leading-relaxed">{result.script}</p>
            </div>
            <button
              onClick={() => setShowEmailModal(true)}
              className="btn-kb bg-slate-900 text-white hover:bg-black w-full shadow-lg shadow-slate-200"
            >
              <Mail size={20} />
              이메일 입력 후 저장하기
            </button>
          </div>
        </div>
      )}

      {/* 이메일 입력 모달 */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Mail className="text-amber-500" size={20} />
                답변받을 이메일 입력
              </h3>
              <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-5">입력하신 이메일로 담당자가 답변을 발송합니다.</p>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveConfirm()}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent mb-5 transition-all"
              placeholder="example@email.com"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveConfirm}
                disabled={isSaving || !customerEmail.trim()}
                className="flex-1 py-3 rounded-xl bg-amber-400 text-amber-950 font-bold hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryForm;
