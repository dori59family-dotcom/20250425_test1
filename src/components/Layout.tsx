import React from 'react';
import { Globe, BookOpen, Activity, UserCircle } from 'lucide-react';
import SSKResearchAgent from './SSKResearchAgent';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfe]">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
              <Activity className="text-emerald-400 w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                SSK <span className="text-emerald-600">Global Agenda</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                AI Research Intelligence Platform
              </p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {[
                { name: 'Research Center', icon: <BookOpen size={16} />, active: true },
                { name: 'Global Network', icon: <Globe size={16} />, active: false },
              ].map((item) => (
                <button
                  key={item.name}
                  className={`flex items-center gap-2 text-sm font-bold transition-all px-2 py-1 ${
                    item.active 
                      ? 'text-slate-900 border-b-2 border-emerald-500' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </nav>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3 pl-4">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">Dr. Lee Sang-yun</p>
                <p className="text-[10px] text-slate-400 font-medium">Senior Researcher</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <UserCircle className="text-slate-400 w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <SSKResearchAgent />
      </main>

      {/* Modern Academic Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-black text-slate-900">SSK Global Agenda</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                우리는 기후 기술 혁신과 사회적 수용성 사이의 관계를 연구하여 지속 가능한 미래를 위한 학술적 토대를 마련합니다. 인내자본의 역할과 글로벌 기후 거버넌스의 발전을 위해 데이터를 분석합니다.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">Resources</h4>
                <ul className="space-y-2 text-slate-500 font-medium">
                  <li><a href="#" className="hover:text-emerald-600">Research Papers</a></li>
                  <li><a href="#" className="hover:text-emerald-600">Policy Briefs</a></li>
                  <li><a href="#" className="hover:text-emerald-600">Data Repositories</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">Contact</h4>
                <p className="text-slate-500 font-medium">info@ssk-global.org</p>
                <div className="flex gap-4 mt-4">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                    <Globe size={14} className="text-slate-400" />
                  </div>
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                    <Activity size={14} className="text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center text-[11px] text-slate-300 font-bold uppercase tracking-wider">
            <p>© 2026 SSK GLOBAL AGENDA RESEARCH GROUP. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
