import React, { useState } from 'react';
import { MessageSquare, List, Building2, ShieldCheck } from 'lucide-react';
import InquiryForm from './InquiryForm';
import InquiryList from './InquiryList';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-amber-400 p-2.5 rounded-2xl shadow-lg shadow-amber-100">
                <Building2 className="text-amber-950 w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800">
                  KB <span className="text-amber-500 underline decoration-4 underline-offset-4">AI Inquiry</span> System
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  KB Financial Customer Service Intelligence
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveTab('form')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeTab === 'form' 
                    ? "bg-white text-amber-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <MessageSquare size={18} />
                문의하기
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeTab === 'list' 
                    ? "bg-white text-amber-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <List size={18} />
                문의 내역
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-700">관리자 모드</p>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  System Active
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <ShieldCheck size={20} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {activeTab === 'form' ? '고객 문의 자동 분류' : '전체 문의 관리 대시보드'}
          </h2>
          <p className="text-slate-500 font-medium">
            {activeTab === 'form' 
              ? 'Gemini AI가 문의 내용을 분석하여 담당 부서와 응대 스크립트를 즉시 생성합니다.' 
              : '접수된 모든 문의 사항을 모니터링하고 이메일 답변을 발송합니다.'}
          </p>
        </div>

        {activeTab === 'form' ? <InquiryForm /> : <InquiryList />}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200 text-center">
        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
          © 2026 KB Financial Group AI Intelligence Center. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
