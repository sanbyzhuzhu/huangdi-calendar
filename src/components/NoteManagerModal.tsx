import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NoteEntry } from '../hooks/usePersonalNotes';
import { X, Download, Upload, Cloud, ArrowDownUp, BookText, FileJson } from 'lucide-react';

interface NoteManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    getAllNotes: () => (NoteEntry & { date: string })[];
    exportData: () => string;
    importData: (json: string) => boolean;
}

export const NoteManagerModal: React.FC<NoteManagerModalProps> = ({
    isOpen,
    onClose,
    getAllNotes,
    exportData,
    importData
}) => {
    const [isAscending, setIsAscending] = useState(false);
    const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const allNotes = getAllNotes();

    const handleClose = () => {
        setImportStatus(null);
        onClose();
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setImportStatus(null);
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const sortedNotes = isAscending
        ? [...allNotes].reverse()
        : allNotes;

    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `time_capsule_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        setImportStatus(null);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setImportStatus({ type: 'error', message: '导入失败：备份文件不能超过 5 MB。' });
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
                if (window.confirm('导入数据将覆盖当前的所有时空印记，确定要继续吗？')) {
                    const success = importData(result);
                    if (success) {
                        setImportStatus({ type: 'success', message: '备份已导入，当前记录已更新。' });
                    } else {
                        setImportStatus({ type: 'error', message: '导入失败：备份文件的日期或记录格式不正确。' });
                    }
                }
            }
        };
        reader.onerror = () => {
            setImportStatus({ type: 'error', message: '导入失败：无法读取该文件。' });
        };
        reader.readAsText(file);

        // 清空 input 状态以允许重复导入同一文件
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-24 pb-6 md:pt-28 md:pb-10"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) handleClose();
                    }}
                    role="presentation"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#1a1a1a] border border-amber-500/30 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden mt-8"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="note-manager-title"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/40">
                            <div className="flex items-center gap-3">
                                <BookText className="text-amber-500" size={28} />
                                <div>
                                    <h2 id="note-manager-title" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-orange-400">
                                        时空印记总管
                                    </h2>
                                    <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Time Capsule Manager</p>
                                </div>
                            </div>
                            <button type="button" onClick={handleClose} aria-label="关闭时空印记管理" className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                                <X size={24} className="text-stone-400 group-hover:text-white" />
                            </button>
                        </div>

                        {/* Toolbar */}
                        <div className="px-6 py-4 bg-white/5 flex flex-wrap gap-4 items-center justify-between border-b border-white/5 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-stone-400 text-sm">共收录 <strong className="text-amber-500 text-lg">{allNotes.length}</strong> 条生命印记</span>
                                <button
                                    type="button"
                                    onClick={() => setIsAscending(!isAscending)}
                                    className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-lg text-sm text-stone-300 transition-colors"
                                >
                                    <ArrowDownUp size={16} className="text-amber-500" />
                                    {isAscending ? '按时间正序 (旧→新)' : '按时间逆序 (新→旧)'}
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-xs text-stone-500 mr-2 flex items-center gap-1 cursor-help" title="数据仅保存在当前设备，请定期导出备份">
                                    <Cloud size={14} /> 云端同步（开发中）
                                </div>
                                <input
                                    type="file"
                                    accept="application/json,.json"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <button
                                    type="button"
                                    onClick={handleImportClick}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg text-sm transition-all"
                                >
                                    <Upload size={16} /> 导入数据
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExport}
                                    title="导出所有数据。如果没有数据，会导出一份标准的可编辑模版。"
                                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm transition-all"
                                >
                                    <Download size={16} /> 导出备份
                                </button>
                            </div>
                        </div>

                        {importStatus && (
                            <div
                                role="status"
                                aria-live="polite"
                                className={`px-6 py-3 text-sm border-b ${importStatus.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                                    }`}
                            >
                                {importStatus.message}
                            </div>
                        )}

                        {/* Notes List */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-transparent to-black/40">
                            {sortedNotes.length > 0 ? (
                                <div className="space-y-6">
                                    {sortedNotes.map((note) => (
                                        <div key={note.id} className="relative group pl-8">
                                            {/* Timeline dot */}
                                            <div className="absolute left-0 top-2 w-3 h-3 rounded-full border-2 border-amber-500 bg-black z-10 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                            {/* Timeline line */}
                                            <div className="absolute left-[5px] top-4 bottom-[-24px] w-[2px] bg-amber-500/20 group-last:bg-transparent"></div>

                                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-amber-500/30 transition-all">
                                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                                                    <div className="flex items-baseline gap-3">
                                                        <span className="text-xl font-bold text-amber-500">{note.year}年</span>
                                                        <span className="text-lg font-mono text-stone-300">{note.date.replace('-', '月')}日</span>
                                                    </div>
                                                    <span className="text-xs text-stone-500 bg-black/40 px-2 py-1 rounded">
                                                        {new Date(note.timestamp).toLocaleString([], { hour12: false })}
                                                    </span>
                                                </div>
                                                <p className="text-stone-300 whitespace-pre-wrap leading-relaxed">
                                                    {note.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                    <FileJson size={64} className="text-stone-700 mb-4" />
                                    <p className="text-xl text-stone-400 mb-2">时空记忆暂为空白</p>
                                    <p className="text-stone-500">快去为日历添加属于您的那年今日吧</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
