'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, LayoutList, Layers } from 'lucide-react';

interface MultipleInputBuilderProps {
    value: string;
    onChange: (value: string) => void;
}

type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'file_upload' | 'url_website' | 'url_youtube' | 'url_gdrive' | 'url_social_media';

interface SchemaField {
    type: FieldType;
    label: string;
    description?: string;
}

interface SchemaItem {
    type: 'group' | 'dynamic_list';
    label: string;
    item_label?: string;
    fields: SchemaField[];
}

export default function MultipleInputBuilder({ value, onChange }: MultipleInputBuilderProps) {
    const [schema, setSchema] = useState<SchemaItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Initialize from string value
    useEffect(() => {
        if (!value) {
            setSchema([]);
            return;
        }
        try {
            const parsed = JSON.parse(value);
            if (parsed && Array.isArray(parsed.schema)) {
                setSchema(parsed.schema);
                setError(null);
            } else if (Array.isArray(parsed)) {
                // Backward compatibility if they saved directly as array
                setSchema(parsed);
                setError(null);
            } else {
                setError("Format JSON tidak dikenali. Schema harus memiliki array di properti 'schema'.");
            }
        } catch (err) {
            setError("Gagal mem-parsing isi JSON dari opsi.");
        }
    }, [value]);

    // Dispatch changes upstream
    const updateParent = (newSchema: SchemaItem[]) => {
        const payload = { schema: newSchema };
        onChange(JSON.stringify(payload, null, 2));
    };

    const handleAddRoot = (type: 'group' | 'dynamic_list') => {
        const newItem: SchemaItem = {
            type,
            label: type === 'group' ? 'Grup Baru' : 'Daftar Dinamis Baru',
            ...(type === 'dynamic_list' ? { item_label: 'Item' } : {}),
            fields: []
        };
        const updated = [...schema, newItem];
        setSchema(updated);
        updateParent(updated);
    };

    const handleUpdateRoot = (index: number, key: keyof SchemaItem, val: string) => {
        const updated = [...schema];
        // @ts-ignore
        updated[index][key] = val;
        setSchema(updated);
        updateParent(updated);
    };

    const handleMoveRoot = (index: number, dir: 'up' | 'down') => {
        if (dir === 'up' && index === 0) return;
        if (dir === 'down' && index === schema.length - 1) return;

        const updated = [...schema];
        const targetIndex = dir === 'up' ? index - 1 : index + 1;
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        setSchema(updated);
        updateParent(updated);
    };

    const handleDeleteRoot = (index: number) => {
        const updated = schema.filter((_, i) => i !== index);
        setSchema(updated);
        updateParent(updated);
    };

    // Field Management
    const handleAddField = (rootIndex: number) => {
        const updated = [...schema];
        if (!updated[rootIndex].fields) updated[rootIndex].fields = [];
        updated[rootIndex].fields.push({
            type: 'text',
            label: 'Label Input Baru',
            description: ''
        });
        setSchema(updated);
        updateParent(updated);
    };

    const handleUpdateField = (rootIndex: number, fieldIndex: number, key: keyof SchemaField, val: string) => {
        const updated = [...schema];
        // @ts-ignore
        updated[rootIndex].fields[fieldIndex][key] = val;
        setSchema(updated);
        updateParent(updated);
    };

    const handleDeleteField = (rootIndex: number, fieldIndex: number) => {
        const updated = [...schema];
        updated[rootIndex].fields = updated[rootIndex].fields.filter((_, i) => i !== fieldIndex);
        setSchema(updated);
        updateParent(updated);
    };

    const handleMoveField = (rootIndex: number, fieldIndex: number, dir: 'up' | 'down') => {
        const fields = schema[rootIndex].fields;
        if (dir === 'up' && fieldIndex === 0) return;
        if (dir === 'down' && fieldIndex === fields.length - 1) return;

        const updated = [...schema];
        const targetIndex = dir === 'up' ? fieldIndex - 1 : fieldIndex + 1;
        const temp = updated[rootIndex].fields[fieldIndex];
        updated[rootIndex].fields[fieldIndex] = updated[rootIndex].fields[targetIndex];
        updated[rootIndex].fields[targetIndex] = temp;

        setSchema(updated);
        updateParent(updated);
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-base font-bold text-slate-800">Visual Schema Builder</h3>
                    <p className="text-xs text-slate-500">Bangun struktur form kompleks untuk pertanyaan multiple input tanpa menulis JSON.</p>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-200">
                    {error} <br />Silakan hapus isi raw JSON, atau timpa dengan membuat blok baru.
                </div>
            )}

            <div className="space-y-4">
                {schema.map((item, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        {/* Root Item Header */}
                        <div className={`p-4 border-b flex flex-col sm:flex-row gap-3 sm:items-start justify-between ${item.type === 'group' ? 'bg-blue-50/50 border-blue-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase flex items-center gap-1 ${item.type === 'group' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {item.type === 'group' ? <Layers size={12} /> : <LayoutList size={12} />}
                                        {item.type === 'group' ? 'Statis Group' : 'Dynamic List'}
                                    </span>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Label / Judul {item.type === 'group' ? 'Grup' : 'Daftar'}</label>
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => handleUpdateRoot(index, 'label', e.target.value)}
                                        className="w-full text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-md px-3 py-1.5 focus:border-[#10b981] outline-none"
                                        placeholder="Contoh: Dokumen Laporan 2024"
                                    />
                                </div>

                                {item.type === 'dynamic_list' && (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Alias Nama Item (Misal: "Bukti Konten" untuk tombol + Tambah Bukti Konten)</label>
                                        <input
                                            type="text"
                                            value={item.item_label || ''}
                                            onChange={(e) => handleUpdateRoot(index, 'item_label', e.target.value)}
                                            className="w-full text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-md px-3 py-1.5 focus:border-[#10b981] outline-none"
                                            placeholder="Contoh: Jawaban Bukti Konten"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Root Actions */}
                            <div className="flex gap-1 items-center bg-white p-1 rounded-lg border border-slate-200">
                                <button onClick={() => handleMoveRoot(index, 'up')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30"><ArrowUp size={16} /></button>
                                <button onClick={() => handleMoveRoot(index, 'down')} disabled={index === schema.length - 1} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30"><ArrowDown size={16} /></button>
                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                <button onClick={() => handleDeleteRoot(index)} className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        {/* Fields List */}
                        <div className="p-4 bg-slate-50/50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-slate-700">Input Fields (Kolom Isian)</h4>
                                <button onClick={() => handleAddField(index)} className="text-[10px] font-bold bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-50 flex items-center gap-1 shadow-sm">
                                    <Plus size={12} /> Tambah Field
                                </button>
                            </div>

                            {item.fields && item.fields.length > 0 ? (
                                <div className="space-y-3">
                                    {item.fields.map((field, fIndex) => (
                                        <div key={fIndex} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm flex gap-3">
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-slate-500 mb-1 block">Label Kolom</label>
                                                    <input
                                                        type="text"
                                                        value={field.label}
                                                        onChange={(e) => handleUpdateField(index, fIndex, 'label', e.target.value)}
                                                        className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-[#10b981]"
                                                        placeholder="Cth: File PDF"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-500 mb-1 block">Tipe Input</label>
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) => handleUpdateField(index, fIndex, 'type', e.target.value)}
                                                        className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-[#10b981]"
                                                    >
                                                        <option value="text">Teks Pendek</option>
                                                        <option value="textarea">Teks Panjang (TextArea)</option>
                                                        <option value="file_upload">Upload File</option>
                                                        <option value="number">Angka (Number)</option>
                                                        <option value="date">Tanggal</option>
                                                        <option value="url_website">Link Website</option>
                                                        <option value="url_youtube">Link YouTube</option>
                                                        <option value="url_gdrive">Link Google Drive</option>
                                                        <option value="url_social_media">Link Sosial Media</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-2 lg:col-span-1">
                                                    <label className="text-[10px] text-slate-500 mb-1 block">Deskripsi (Opsional)</label>
                                                    <input
                                                        type="text"
                                                        value={field.description || ''}
                                                        onChange={(e) => handleUpdateField(index, fIndex, 'description', e.target.value)}
                                                        className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-[#10b981]"
                                                        placeholder="Cth: Hanya menerima pdf"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center justify-start gap-1">
                                                <button onClick={() => handleDeleteField(index, fIndex)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                                                <button onClick={() => handleMoveField(index, fIndex, 'up')} disabled={fIndex === 0} className="text-slate-300 hover:text-slate-600 p-1 disabled:opacity-0"><ArrowUp size={14} /></button>
                                                <button onClick={() => handleMoveField(index, fIndex, 'down')} disabled={fIndex === item.fields.length - 1} className="text-slate-300 hover:text-slate-600 p-1 disabled:opacity-0"><ArrowDown size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                                    Belum ada kolom isian. Tambahkan field untuk grup ini.
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {schema.length === 0 && !error && (
                    <div className="text-center py-10 bg-white border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-slate-500 text-sm mb-4">Mulai bangun format dengan menambahkan blok layout pertama.</p>
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-3">
                <button onClick={() => handleAddRoot('group')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors border border-blue-200">
                    <Layers size={16} /> Tambah Grup Statis
                </button>
                <button onClick={() => handleAddRoot('dynamic_list')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition-colors border border-emerald-200">
                    <LayoutList size={16} /> Tambah Daftar Dinamis (+ Tambah Item)
                </button>
            </div>
        </div>
    );
}
