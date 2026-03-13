'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ADMIN_EMAIL, adminMenuItems } from '@/lib/adminConfig';
import { Loader2, Download, ExternalLink } from 'lucide-react';
import * as XLSX from 'xlsx';

type ResultRow = {
    institution: string;
    email: string;
    respondent_name: string;
    question_text: string;
    question_type: string;
    answer: string;
    keterangan: string;
    progress: number;
    updated_at: string;
};

type Props = {
    status: 'complete' | 'on_progress' | 'no_progress';
    title: string;
    description: string;
};

export default function ResultClassifiedTable({ status, title, description }: Props) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [results, setResults] = useState<ResultRow[]>([]);
    const [institutions, setInstitutions] = useState<string[]>([]);
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.email !== ADMIN_EMAIL) {
                router.replace('/login');
                return;
            }
            setIsAuthorized(true);
        };
        checkAuth();
    }, [router]);

    const fetchData = useCallback(async () => {
        if (!isAuthorized) return;
        setIsLoading(true);

        try {
            const params = new URLSearchParams({ status });
            if (selectedInstitution) params.set('institution', selectedInstitution);

            const res = await fetch(`/api/admin/survey-results-classified?${params.toString()}`);
            const json = await res.json();

            if (json.success) {
                setResults(json.data || []);
                if (!selectedInstitution && json.institutions) {
                    setInstitutions(json.institutions);
                }
            } else {
                setResults([]);
            }
        } catch (err) {
            console.error('Failed to fetch classified results:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthorized, status, selectedInstitution]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleExport = () => {
        if (results.length === 0) return;
        setIsExporting(true);

        const excelData = results.map((row, idx) => ({
            'No.': idx + 1,
            'Nama Instansi': row.institution,
            'Email Responden': row.email,
            'Nama Responden': row.respondent_name,
            'Pertanyaan': row.question_text,
            'Tipe Input Pertanyaan': row.question_type,
            'Jawaban Pertanyaan': row.answer,
            'Keterangan': row.keterangan || '',
            'Persentase Progress': `${row.progress}%`,
            'Tanggal Update Survei': row.updated_at
                ? new Date(row.updated_at).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                })
                : '-',
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        ws['!cols'] = [
            { wch: 6 },  // No.
            { wch: 35 }, // Nama Instansi
            { wch: 30 }, // Email
            { wch: 25 }, // Nama Responden
            { wch: 60 }, // Pertanyaan
            { wch: 20 }, // Tipe Input
            { wch: 40 }, // Jawaban
            { wch: 40 }, // Keterangan
            { wch: 15 }, // Persentase
            { wch: 25 }, // Tanggal
        ];

        const wb = XLSX.utils.book_new();
        const sheetName = title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        const statusLabel = status.replace(/_/g, '-');
        XLSX.writeFile(wb, `${statusLabel}_survey_${new Date().toISOString().split('T')[0]}.xlsx`);
        setIsExporting(false);
    };

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#10b981]" size={40} />
            </div>
        );
    }

    // Count unique respondents
    const uniqueRespondents = new Set(results.map(r => `${r.email}_${r.institution}`)).size;

    return (
        <DashboardLayout menuItems={adminMenuItems} title="Admin Panel" roleLabel="Administrator">
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        <p className="text-gray-500 text-sm mt-1">{description}</p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={results.length === 0 || isExporting}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10b981] text-white rounded-xl font-semibold text-sm hover:bg-[#059669] transition-all shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        Unduh Excel
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Filter Nama Instansi</label>
                        <select
                            value={selectedInstitution}
                            onChange={(e) => setSelectedInstitution(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#10b981] outline-none"
                        >
                            <option value="">Semua Instansi</option>
                            {institutions.map((inst, idx) => (
                                <option key={idx} value={inst}>{inst}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <div className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">{uniqueRespondents}</span> responden &middot;{' '}
                            <span className="font-semibold text-gray-900">{results.length}</span> baris
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-4 whitespace-nowrap w-12">No.</th>
                                    <th className="px-4 py-4 whitespace-nowrap">Nama Instansi</th>
                                    <th className="px-4 py-4 whitespace-nowrap">Email Responden</th>
                                    <th className="px-4 py-4 whitespace-nowrap">Nama Responden</th>
                                    <th className="px-4 py-4 whitespace-nowrap">Pertanyaan</th>
                                    <th className="px-4 py-4 whitespace-nowrap">Tipe Input</th>
                                    <th className="px-4 py-4 whitespace-nowrap">Jawaban</th>
                                    <th className="px-4 py-4 whitespace-nowrap">Keterangan</th>
                                    <th className="px-4 py-4 whitespace-nowrap">Progress</th>
                                    <th className="px-4 py-4 whitespace-nowrap">Tanggal Update</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={10} className="px-5 py-8 text-center text-gray-500">
                                            <div className="flex justify-center mb-2">
                                                <Loader2 className="animate-spin text-[#10b981]" size={24} />
                                            </div>
                                            Memuat data...
                                        </td>
                                    </tr>
                                ) : results.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-5 py-8 text-center text-gray-500">
                                            Tidak ada data ditemukan untuk filter tersebut.
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                                            <td className="px-4 py-3 min-w-[180px]">
                                                <span className="font-semibold text-gray-900 text-xs">{row.institution}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{row.email}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-800">{row.respondent_name}</td>
                                            <td className="px-4 py-3 min-w-[250px] text-xs leading-relaxed text-gray-800 bg-amber-50/30">{row.question_text}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-semibold uppercase">{row.question_type}</span>
                                            </td>
                                            <td className="px-4 py-3 min-w-[200px] text-xs font-medium text-emerald-700">
                                                {row.answer && row.answer.startsWith('http') ? (
                                                    <a
                                                        href={row.answer}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 border border-blue-200 transition-colors"
                                                    >
                                                        <ExternalLink size={13} />
                                                        Buka Link
                                                    </a>
                                                ) : (
                                                    row.answer || <span className="text-gray-300 italic">Belum dijawab</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 min-w-[180px] text-xs text-gray-500 italic">
                                                {row.keterangan || <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2 w-28">
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                row.progress === 100
                                                                    ? 'bg-emerald-500'
                                                                    : row.progress > 0
                                                                    ? 'bg-orange-500'
                                                                    : 'bg-red-300'
                                                            }`}
                                                            style={{ width: `${row.progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-700">{row.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                                {row.updated_at
                                                    ? new Date(row.updated_at).toLocaleString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!isLoading && results.length > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                            <span>Menampilkan total <b>{results.length}</b> baris jawaban dari <b>{uniqueRespondents}</b> responden.</span>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
