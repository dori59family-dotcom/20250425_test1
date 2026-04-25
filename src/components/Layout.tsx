import React, { useState } from 'react';
import { LayoutDashboard, History, ShieldCheck } from 'lucide-react';
import InquiryForm from './InquiryForm';
import InquiryList from './InquiryList';

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'input' | 'history'>('input');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-100">
              <ShieldCheck className="text-amber-950 w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              KB금융 <span className="text-amber-500">문의 자동 분류 시스템</span>
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('input')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'input' 
                  ? 'bg-white text-amber-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutDashboard size={18} />
              문의 입력
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'history' 
                  ? 'bg-white text-amber-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <History size={18} />
              문의 내역
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {activeTab === 'input' ? <InquiryForm /> : <InquiryList />}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden bg-white border-t border-slate-100 p-2 flex justify-around sticky bottom-0 z-50">
        <button
          onClick={() => setActiveTab('input')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'input' ? 'text-amber-500' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-xs font-bold">문의 입력</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'history' ? 'text-amber-500' : 'text-slate-400'
          }`}
        >
          <History size={20} />
          <span className="text-xs font-bold">문의 내역</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="bg-slate-50 py-8 border-t border-slate-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 KB Financial Group Customer AI Lab. 모든 권리 보유.
          </p>
          <p className="text-slate-300 text-[10px] mt-1">
            Powered by Gemini 3 Flash & Supabase
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
