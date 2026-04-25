import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Search, Loader2, AlertCircle, Inbox, Mail, Sparkles, X, CheckCircle } from 'lucide-react';

import { fetchInquiries, saveReply } from '../lib/supabase';
import { generateReply } from '../lib/gemini';
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

  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [modalReply, setModalReply] = useState('');
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [replySaved, setReplySaved] = useState(false);

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

  useEffect(() => { loadData(); }, []);

  const openDetail = (inquiry: InquiryData) => {
    setSelectedInquiry(inquiry);
    // 가장 최근 답변이 있으면 보여줌
    const latestReply = inquiry.replies && inquiry.replies.length > 0 
      ? inquiry.replies[inquiry.replies.length - 1].reply_text 
      : '';
    setModalReply(latestReply);
    setReplySaved(!!latestReply);
  };

  const handleGenerateReply = async () => {
    if (!selectedInquiry) return;
    setIsGeneratingReply(true);
    setModalReply('');
    setReplySaved(false);
    try {
      const replyText = await generateReply(selectedInquiry);
      setModalReply(replyText);
      
      setIsSavingReply(true);
      const newReply = await saveReply(selectedInquiry.id!, replyText);
      
      // 상태 업데이트
      setInquiries(prev => prev.map(q => 
        q.id === selectedInquiry.id 
          ? { ...q, replies: [...(q.replies || []), newReply] } 
          : q
      ));
      setReplySaved(true);
    } catch (err) {
      console.error('답변 생성/저장 오류:', err);
    } finally {
      setIsGeneratingReply(false);
      setIsSavingReply(false);
    }
  };

  const handleGmailSend = () => {
    if (!selectedInquiry || !modalReply) return;
    const subject = encodeURIComponent(`[KB금융] 문의 답변 (접수번호: ${selectedInquiry.receipt_number})`);
    const body = encodeURIComponent(modalReply);
    const to = encodeURIComponent(selectedInquiry.customer_email);
    window.open(`https://mail.google.com/mail/?view=cm&to=${to}&su=${subject}&body=${body}`, '_blank');
  };

  const downloadCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ['접수번호', '계열사', '시간', '문의내용', '카테고리', '이메일', '답변여부'];
    const rows = inquiries.map(q => [
      q.receipt_number,
      q.business_area,
      new Date(q.created_at!).toLocaleString(),
      `"${q.inquiry.replace(/"/g, '""')}"`,
      q.category,
      q.customer_email,
      (q.replies && q.replies.length > 0) ? '답변완료' : '미답변',
    ]);
    const csv = ['\uFEFF' + headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KB_문의내역_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = inquiries.filter(q =>
    q.receipt_number?.includes(searchTerm) ||
    q.inquiry.includes(searchTerm) ||
    q.customer_email?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="접수번호, 내용, 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={loadData} disabled={isLoading} className="btn-kb btn-secondary flex-1 md:flex-none">
            <RefreshCw className={cn(isLoading && 'animate-spin')} size={18} />
            <span className="hidden md:inline">새로고침</span>
          </button>
          <button onClick={downloadCSV} disabled={inquiries.length === 0} className="btn-kb btn-primary flex-1 md:flex-none">
            <Download size={18} />CSV 다운로드
          </button>
        </div>
      </div>

      <div className="card-kb">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">접수번호</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">계열사</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">시간</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">문의 요약</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">답변 상태</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" size={32} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400">내역이 없습니다.</td></tr>
              ) : (
                filtered.map((inquiry) => (
                  <tr key={inquiry.id} onClick={() => openDetail(inquiry)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">{inquiry.receipt_number}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{inquiry.business_area}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {new Date(inquiry.created_at!).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-4 min-w-[180px]">
                      <p className="text-sm text-slate-600 line-clamp-1">{inquiry.summary}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {(inquiry.replies && inquiry.replies.length > 0) ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          <CheckCircle size={12} />완료
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">미답변</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">상세보기</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 및 답변 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Mail className="text-amber-500" size={18} />이메일 답변</h3>
                <p className="text-xs text-slate-400 mt-0.5">접수번호: {selectedInquiry.receipt_number} · 수신: {selectedInquiry.customer_email}</p>
              </div>
              <button onClick={() => setSelectedInquiry(null)}><X size={20} /></button>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-b grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">문의 원문</p>
                <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border italic">"{selectedInquiry.inquiry}"</p>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1"><Sparkles size={14} className="text-amber-500" />답변 내용</p>
                {replySaved && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">별도 테이블 저장됨</span>}
              </div>
              {modalReply || isGeneratingReply ? (
                <textarea
                  value={modalReply}
                  onChange={(e) => setModalReply(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-amber-400 resize-none shadow-inner"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-2xl border border-dashed">
                  <Sparkles size={32} className="mb-3 text-amber-300 animate-pulse" />
                  <p className="text-sm text-slate-400">AI 답변 생성을 시작하세요</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button onClick={handleGenerateReply} disabled={isGeneratingReply} className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                {isGeneratingReply ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}AI 답변 생성 및 저장
              </button>
              <button onClick={handleGmailSend} disabled={!modalReply} className="flex-1 py-3 rounded-xl bg-amber-400 text-amber-950 font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                <Mail size={16} />Gmail 발송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryList;
