import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Search, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { fetchInquiries } from '../lib/supabase';
import type { InquiryData } from '../types/inquiry';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const InquiryList: React.FC = () => {
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchInquiries();
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const downloadCSV = () => {
    if (inquiries.length === 0) return;

    const headers = ['시간', '이름', '문의내용', '카테고리', '긴급도', '요약', '담당부서'];
    const rows = inquiries.map(q => [
      new Date(q.created_at!).toLocaleString(),
      q.customer_name,
      `"${q.inquiry.replace(/"/g, '""')}"`,
      q.category,
      q.urgency,
      `"${q.summary.replace(/"/g, '""')}"`,
      q.department
    ]);

    const csvContent = [
      '\uFEFF' + headers.join(','), // UTF-8 BOM for Excel
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KB_문의내역_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInquiries = inquiries.filter(q => 
    q.customer_name.includes(searchTerm) || 
    q.inquiry.includes(searchTerm) ||
    q.category.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="이름, 내용, 카테고리로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="btn-kb btn-secondary flex-1 md:flex-none"
            title="새로고침"
          >
            <RefreshCw className={cn(isLoading && "animate-spin")} size={18} />
            <span className="hidden md:inline">새로고침</span>
          </button>
          <button
            onClick={downloadCSV}
            disabled={inquiries.length === 0}
            className="btn-kb btn-primary flex-1 md:flex-none"
          >
            <Download size={18} />
            CSV 다운로드
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl flex items-center gap-4">
          <AlertCircle size={24} />
          <div>
            <p className="font-bold">데이터 로드 실패</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      <div className="card-kb">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">시간</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">이름</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">요약</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">카테고리</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">긴급도</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">담당부서</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-amber-500 mb-4" size={32} />
                    <p className="text-slate-400 font-medium">데이터를 불러오는 중입니다...</p>
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Inbox className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400 font-medium">내역이 없습니다.</p>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(inquiry.created_at!).toLocaleString('ko-KR', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                      {inquiry.customer_name}
                    </td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <p className="text-sm text-slate-600 line-clamp-1 group-hover:line-clamp-none transition-all">
                        {inquiry.summary}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                        {inquiry.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={cn(
                        "inline-flex px-2.5 py-1 rounded-lg text-xs font-bold",
                        inquiry.urgency === '높음' ? "bg-red-100 text-red-600" :
                        inquiry.urgency === '보통' ? "bg-amber-100 text-amber-600" :
                        "bg-emerald-100 text-emerald-600"
                      )}>
                        {inquiry.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-600">
                        {inquiry.department}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="text-center text-xs text-slate-400">
        전체 {filteredInquiries.length}건의 문의 내역이 조회되었습니다.
      </p>
    </div>
  );
};

export default InquiryList;
