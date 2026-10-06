import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCalendarData } from '../utils/calendarCore';
import { CalendarCard } from './CalendarCard';
import { FullCalendarModal } from './FullCalendarModal';
import { TraditionalPanel } from './TraditionalPanel';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lightbulb, Plus, Book, Globe, X, Trash2, Edit2 } from 'lucide-react';
import { ChronologyConverter } from './ChronologyConverter';
import { usePersonalNotes } from '../hooks/usePersonalNotes';
import historyDataRaw from '../assets/data/history_today.json';
import { NoteManagerModal } from './NoteManagerModal';

const historyData: Record<string, string> = historyDataRaw;



export const CalendarView: React.FC<{ onDateChange?: (d: Date) => void }> = ({ onDateChange }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
    const data = useMemo(() => getCalendarData(selectedDate), [selectedDate]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeModalType, setActiveModalType] = useState<'gregorian' | 'lunar' | 'huangdi' | 'tian' | 'mayan'>('gregorian');
    const [activeModalTitle, setActiveModalTitle] = useState('');
    const [localYear, setLocalYear] = useState(() => selectedDate.getFullYear().toString());
    const [currentPage, setCurrentPage] = useState(1);
    const NOTES_PER_PAGE = 20;

    const selectDate = (date: Date) => {
        setSelectedDate(date);
        setLocalYear(date.getFullYear().toString());
        setCurrentPage(1);
        onDateChange?.(date);
    };

    // Notes system
    const {
        addNote,
        updateNote,
        deleteNote,
        getMMDD,
        getNotesForDayAcrossYears,
        getAllNotes,
        exportData,
        importData
    } = usePersonalNotes();
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const currentDateMMDD = getMMDD(data.gregorian.dateStr);

    // 跨年今日：获取所有年份中这一天的记录
    const todaysNotes = getNotesForDayAcrossYears(getMMDD(data.gregorian.dateStr));
    const historicalEvent = currentDateMMDD && historyData[currentDateMMDD] ? historyData[currentDateMMDD] : null;

    const openNoteModal = (noteId?: string, existingContent?: string) => {
        if (noteId && existingContent) {
            setEditingNoteId(noteId);
            setNoteContent(existingContent);
        } else {
            setEditingNoteId(null);
            setNoteContent('');
        }
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = () => {
        if (noteContent.trim() && data) {
            if (editingNoteId) {
                updateNote(data.gregorian.dateStr, editingNoteId, noteContent);
            } else {
                addNote(data.gregorian.dateStr, noteContent);
            }
            setNoteContent('');
            setEditingNoteId(null);
            setIsNoteModalOpen(false);
        }
    }

    const handleDeleteNote = (id: string) => {
        if (confirmDeleteId === id) {
            if (data) deleteNote(data.gregorian.dateStr, id);
            setConfirmDeleteId(null);
        } else {
            setConfirmDeleteId(id);
            // 3秒后如果没有再次点击确认，则自动取消待删除状态
            setTimeout(() => setConfirmDeleteId(null), 3000);
        }
    };


    const addDays = (days: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        selectDate(d);
    };

    const totalPages = Math.ceil(todaysNotes.length / NOTES_PER_PAGE);
    const paginatedNotes = todaysNotes.slice((currentPage - 1) * NOTES_PER_PAGE, currentPage * NOTES_PER_PAGE);

    return (
        <div className="min-h-screen px-4 py-8 md:p-12 text-white max-w-7xl mx-auto space-y-12">
            {/* Header Section */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <CalendarIcon size={28} className="text-white" />
                    </div>
                    <div>
                        <div className="flex flex-col">
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent tracking-widest" style={{ backgroundImage: 'linear-gradient(90deg, #f87171, #fb923c, #facc15, #4ade80, #38bdf8, #818cf8, #e879f9)' }}>
                                古历法
                            </h1>
                            <p className="text-sm text-stone-400 font-medium tracking-wider mt-1">时空同步生活系统</p>
                            <div className="flex flex-col mt-2 space-y-1">
                                <span className="text-xs font-medium text-emerald-400/90 tracking-widest">
                                    因中国八千年文明历史而自信
                                </span>
                                <span className="text-xs font-medium text-sky-400/90 tracking-widest">
                                    在自然农耕与时空同步中生活
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date Controller */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-4 glass-panel px-6 py-3 rounded-full">
                        <button type="button" onClick={() => addDays(-1)} aria-label="前一天" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="text-center w-40">
                            <div className="text-xl font-medium tracking-wider">{data.gregorian.dateStr}</div>
                        </div>
                        <button type="button" onClick={() => addDays(1)} aria-label="后一天" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronRight size={20} />
                        </button>
                        <button type="button" onClick={() => selectDate(new Date())} aria-label="回到今天" className="ml-4 text-xs bg-amber-600/20 text-amber-500 px-3 py-1 rounded-full border border-amber-500/30 hover:bg-amber-600/40 transition-colors">
                            TODAY
                        </button>
                    </div>
                    {/* Year Quick Jump */}
                    <div className="flex items-center gap-2">
                        {[-10, -1].map(d => (
                            <button key={d} onClick={() => { const nd = new Date(selectedDate); nd.setFullYear(nd.getFullYear() + d); selectDate(nd); }}
                                className="text-xs bg-white/5 hover:bg-white/15 text-stone-300 px-3 py-1 rounded-full border border-white/10 transition-colors">
                                {d}年
                            </button>
                        ))}
                        <input
                            type="text"
                            aria-label="跳转到年份"
                            value={localYear}
                            onChange={(e) => setLocalYear(e.target.value)}
                            onBlur={() => {
                                const val = parseInt(localYear, 10);
                                if (isNaN(val)) {
                                    setLocalYear(selectedDate.getFullYear().toString());
                                    return;
                                }
                                let targetYear = val;
                                if (targetYear < -5000) targetYear = -5000;
                                if (targetYear > 9999) targetYear = 9999;
                                const nd = new Date(selectedDate);
                                nd.setFullYear(targetYear);
                                selectDate(nd);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                            className="text-sm text-amber-400 font-medium px-2 py-1 mx-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:border-amber-500/50 text-center w-24"
                        />
                        {[1, 10].map(d => (
                            <button key={d} onClick={() => { const nd = new Date(selectedDate); nd.setFullYear(nd.getFullYear() + d); selectDate(nd); }}
                                className="text-xs bg-white/5 hover:bg-white/15 text-stone-300 px-3 py-1 rounded-full border border-white/10 transition-colors">
                                +{d}年
                            </button>
                        ))}
                    </div>
                </div>
            </motion.header>

            {/* Hero Section - The Ancient Mother & Branch Calendars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CalendarCard
                    title="天历"
                    subtitle="十月太阳历 / 阴阳交替"
                    mainInfo={`天历 ${data.tian.year} 年 ${data.tian.month} 月 ${data.tian.day} 日`}
                    secondaryInfo={`当月属性: ${data.tian.isYang ? '阳月 (37天)' : '阴月 (36天)'}`}
                    gradientFrom="#3b82f6"
                    gradientTo="#1d4ed8"
                    delay={0.1}
                    iconType="dragon"
                    onClick={() => { setActiveModalType('tian'); setActiveModalTitle('天历'); setIsModalOpen(true); }}
                />
                <CalendarCard
                    title="黄帝纪元历"
                    subtitle="以冬至为岁首的黄帝纪元历"
                    mainInfo={`${data.huangdi.yearStr}${data.huangdi.monthStr}${data.huangdi.dayStr}`}
                    secondaryInfo={`黄道节气: ${data.huangdi.wuhouFull}`}
                    gradientFrom="#f59e0b"
                    gradientTo="#b45309"
                    delay={0.2}
                    iconType="emperor"
                    onClick={() => { setActiveModalType('huangdi'); setActiveModalTitle('黄帝纪元历'); setIsModalOpen(true); }}
                />
            </div>

            {/* Grid Section - Other Calendars in chronological order */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CalendarCard
                    title="汉历 (农历)"
                    subtitle="传统阴阳合历"
                    mainInfo={`汉历${data.lunar.yearGan}${data.lunar.yearZhi}(${data.lunar.zodiac})年${data.lunar.monthStr}${data.lunar.dayStr}`}
                    secondaryInfo={`甲子历: ${data.jiazi.cycle}，${data.jiazi.yearZhu} ${data.jiazi.monthZhu} ${data.jiazi.monthGua} ${data.jiazi.dayZhu}`}
                    gradientFrom="#10b981"
                    gradientTo="#047857"
                    delay={0.3}
                    iconType="wall"
                    onClick={() => { setActiveModalType('lunar'); setActiveModalTitle('汉历'); setIsModalOpen(true); }}
                />
                <CalendarCard
                    title="玛雅历 (Mayan)"
                    subtitle="银河同步时刻"
                    mainInfo={data.mayan.tzolkinCN}
                    secondaryInfo={`长计历: ${data.mayan.longCount} | 哈布历: ${data.mayan.haabCN}`}
                    gradientFrom="#ec4899"
                    gradientTo="#be185d"
                    delay={0.4}
                    iconType="pyramid"
                    onClick={() => { setActiveModalType('mayan'); setActiveModalTitle('玛雅历'); setIsModalOpen(true); }}
                />
                <CalendarCard
                    title="西历 (Gregorian)"
                    subtitle="现行国际公历"
                    mainInfo={data.gregorian.dateStr}
                    secondaryInfo={data.lunar.jieqi ? `🌿 今日节气：${data.lunar.jieqi}` : `农历${data.lunar.monthStr}${data.lunar.dayStr}`}
                    gradientFrom="#8b5cf6"
                    gradientTo="#6d28d9"
                    delay={0.5}
                    iconType="cross"
                    onClick={() => { setActiveModalType('gregorian'); setActiveModalTitle('西历'); setIsModalOpen(true); }}
                />
            </div>

            <FullCalendarModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentDate={selectedDate}
                onSelectDate={selectDate}
                activeCalendarType={activeModalType}
                calendarTitle={activeModalTitle}
            />

            {/* Traditional Details Panel */}
            <TraditionalPanel data={data} selectedDate={selectedDate} />

            {/* Chronology Conversion Tool */}
            <ChronologyConverter
                currentYear={data.gregorian.year}
                onYearSelect={(y) => {
                    const nd = new Date(selectedDate);
                    nd.setFullYear(y);
                    selectDate(nd);
                }}
            />

            {/* History Timeline & Notes Panel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="glass-panel p-6 border-t-2 border-amber-500/30 space-y-6"
            >
                {/* 1. 公共历史区 */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="text-amber-400" size={20} />
                        <h2 className="text-lg font-bold text-stone-100 italic">历史上的今天</h2>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[80px] flex items-center">
                        {historicalEvent ? (
                            <p className="text-stone-300 text-sm md:text-base leading-relaxed">{historicalEvent}</p>
                        ) : (
                            <p className="text-stone-500 text-sm">历史上的今天静谧无声。点击页面右下角，记下您今日的史诗。</p>
                        )}
                    </div>
                </div>

                {/* 2. 私人笔记区 */}
                <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Book className="text-amber-400" size={20} />
                            <h2
                                onClick={() => setIsManagerModalOpen(true)}
                                className="text-lg font-bold text-stone-100 italic cursor-pointer hover:text-amber-400 transition-colors"
                                title="点击全览我的所有时空印记"
                            >
                                我的时空印记 <span className="text-xs text-amber-500 ml-1">↗</span>
                            </h2>
                            <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">{todaysNotes.length}</span>
                        </div>
                    </div>

                    {todaysNotes.length > 0 ? (
                        <div className="space-y-3">
                            {paginatedNotes.map(note => (
                                <div key={note.id} className="group bg-black/20 border border-amber-500/10 rounded-xl p-4 hover:border-amber-500/30 transition-all relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-amber-500 font-bold">{note.year}年</span>
                                            <span className="text-[10px] text-stone-500">{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        {/* 操作区 (悬浮展示) */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button
                                                onClick={() => openNoteModal(note.id, note.content)}
                                                className="p-1.5 bg-white/10 hover:bg-white/20 text-stone-300 rounded-md transition-colors" title="修改回忆"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className={`p-1.5 rounded-md transition-all ${confirmDeleteId === note.id ? 'bg-red-500 hover:bg-red-600 text-white shadow-md' : 'bg-rose-500/20 hover:bg-rose-500/40 text-rose-400'}`} title={confirmDeleteId === note.id ? "再次点击彻底抹除" : "抹除印记"}
                                            >
                                                {confirmDeleteId === note.id ? <span className="text-xs font-bold px-1 tracking-widest">确认?</span> : <Trash2 size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-stone-300 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                </div>
                            ))}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/5">
                                    <button
                                        type="button"
                                        aria-label="上一页时空印记"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div className="text-sm text-stone-400 font-medium">
                                        <span className="text-amber-500">{currentPage}</span> / {totalPages} 页
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="下一页时空印记"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-6 flex flex-col items-center justify-center text-center gap-3 opacity-60">
                            <Book size={32} className="text-stone-600" />
                            <p className="text-stone-400 text-sm">在这漫长的岁月中，您尚未在这一天留下足迹。</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Closing Statement */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="glass-panel p-6 flex gap-4 text-stone-300 text-sm leading-relaxed border border-amber-500/20"
            >
                <Lightbulb size={24} className="text-amber-500 shrink-0 mt-0.5" />
                <p>
                    自伏羲仰观俯察、黄帝授时立极，中华先民将对天地运行的深刻洞察凝铸为历法。
                    从圣太一天历的十月阴阳、黄帝纪元六十甲子的时空密码，到汉历阴阳合历的生活智慧，
                    再到玛雅长计历对宇宙纪元的宏大构想——每一套历法都是一个文明与天地对话的语言。
                    揭开历法，便是揭开人类文明最深邃的时间哲学。
                </p>
            </motion.div>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8 z-[60]">
                <button
                    type="button"
                    aria-label="添加时空印记"
                    onClick={() => openNoteModal()}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center hover:scale-110 hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all"
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* Note Editor Modal */}
            <AnimatePresence>
                {isNoteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pt-24 pb-6 md:pt-28 md:pb-10"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) setIsNoteModalOpen(false);
                        }}
                        role="presentation"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-stone-900 border border-amber-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl mt-8"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="note-editor-title"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 id="note-editor-title" className="text-xl font-bold text-amber-500 flex items-center gap-2">
                                    <Book size={20} /> {editingNoteId ? '修改时空印记' : '添加时空印记'}
                                </h3>
                                <button type="button" onClick={() => setIsNoteModalOpen(false)} aria-label="关闭时空印记编辑" className="text-stone-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="mb-4 text-sm text-stone-400">
                                {editingNoteId ? '正在重新编辑' : '为'} <span className="text-amber-400 font-bold">{data.gregorian.dateStr}</span> 留下您的记录：
                            </div>
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-stone-200 focus:outline-none focus:border-amber-500/50 resize-none"
                                placeholder="写下今日的感悟或重大事件..."
                                autoFocus
                            />
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-stone-400 hover:bg-white/5 transition-colors">取消</button>
                                <button onClick={handleSaveNote} className="px-4 py-2 rounded-lg text-sm bg-amber-500 text-stone-900 font-bold hover:bg-amber-400 transition-colors">保存印记</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Note Manager Modal */}
            <NoteManagerModal
                isOpen={isManagerModalOpen}
                onClose={() => setIsManagerModalOpen(false)}
                getAllNotes={getAllNotes}
                exportData={exportData}
                importData={importData}
            />

        </div>
    );
};
