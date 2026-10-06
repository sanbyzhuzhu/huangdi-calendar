import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, ChevronRight, Orbit, Search, Activity, Milestone, Flag, Zap, Anchor } from 'lucide-react';
import { syncCalendars, fromGregorian } from '../utils/tianCalendar';
import { getAssetUrl } from '../utils/assetUtils';

interface TianEvent {
    year: number;
    era: string;
    event: string;
    description: string;
    full_title: string;
}

const ERA_NAMES = ["太易", "太初", "太始", "太素", "太统"];
const GREAT_NUMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const ELEMENTS = ["水", "火", "木", "金", "土"];
const POSITIONS = ["元", "上", "中", "下", "末"];
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const getCycleIndexes = (year: number) => {
    const yearOffset = Math.max(0, year - 1);
    const offsetInEra = yearOffset % 3000;
    const offsetInGreatNumber = offsetInEra % 300;

    return {
        eraIdx: Math.min(4, Math.floor(yearOffset / 3000)),
        gnIdx: Math.min(9, Math.floor(offsetInEra / 300)),
        eleIdx: Math.min(4, Math.floor(offsetInGreatNumber / 60)),
        posIdx: Math.min(4, Math.floor((offsetInGreatNumber % 60) / 12)),
        yearOffset: yearOffset % 12
    };
};

export const TianInteractiveDeduction: React.FC<{ onDateChange?: (y: number, m: number, d: number) => void }> = ({ onDateChange }) => {
    const [initialTianDate] = useState(() => fromGregorian(new Date()));
    const initialCycle = getCycleIndexes(initialTianDate.year);

    // 基础纪元状态
    const [eraIdx, setEraIdx] = useState(initialCycle.eraIdx);
    const [gnIdx, setGnIdx] = useState(initialCycle.gnIdx);
    const [eleIdx, setEleIdx] = useState(initialCycle.eleIdx);
    const [posIdx, setPosIdx] = useState(initialCycle.posIdx);
    const [month, setMonth] = useState(initialTianDate.month);
    const [day, setDay] = useState(initialTianDate.day);
    const [yearOffset, setYearOffset] = useState(initialCycle.yearOffset);

    // 查询器状态
    const [queryDate, setQueryDate] = useState(() => {
        const today = new Date();
        return { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() };
    });

    const [events, setEvents] = useState<TianEvent[]>([]);
    const [activeEvent, setActiveEvent] = useState<TianEvent | null>(null);

    const currentYear = useMemo(() => {
        // V0.27 精度修正: 大轮 + 大数 + 五行 + 岁位 + 周年零头 + 1(元年起点)
        return (eraIdx * 3000) + (gnIdx * 300) + (eleIdx * 60) + (posIdx * 12) + yearOffset + 1;
    }, [eraIdx, gnIdx, eleIdx, posIdx, yearOffset]);

    const maxDays = useMemo(() => {
        if (month % 2 !== 0) return 36;
        return 37;
    }, [month]);
    const effectiveDay = Math.min(day, maxDays);

    useEffect(() => {
        fetch(getAssetUrl('/data/tian_events.json'))
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error("加载事件失败:", err));
    }, []);

    useEffect(() => {
        // V0.35: 优化匹配逻辑，如果不处于“强制锁定”状态，则自动跟随当前年份
        onDateChange?.(currentYear, month, effectiveDay);
    }, [currentYear, month, effectiveDay, onDateChange]);

    const matchedEvent = useMemo(
        () => events.find(e => Math.abs(e.year - currentYear) <= 5) ?? null,
        [events, currentYear]
    );
    const visibleEvent = activeEvent ?? matchedEvent;

    // 核心工具：同步指定公历日期到网格
    const syncFromGregorian = (date: Date) => {
        const tian = fromGregorian(date);

        // 解析天历年份到网格索引
        const y = tian.year;
        const eIdx = Math.floor((y - 1) / 3000);
        const offsetInEra = (y - 1) % 3000;
        const gIdx = Math.floor(offsetInEra / 300);
        const offsetInGn = offsetInEra % 300;
        const elIdx = Math.floor(offsetInGn / 60);
        const pIdx = Math.floor((offsetInGn % 60) / 12);

        setEraIdx(Math.min(4, eIdx));
        setGnIdx(Math.min(9, gIdx));
        setEleIdx(Math.min(4, elIdx));
        setPosIdx(Math.min(4, pIdx));
        setMonth(tian.month);
        setDay(tian.day);

        // V0.27 精度补偿：补足 12年周期（岁次下）未被网格涵盖的流年零头 (0-11)
        const exactRemainder = (y - 1) % 12;
        setYearOffset(exactRemainder);
    };

    const sync = syncCalendars(currentYear);

    // V0.34: 根据事件内容动态分配图标
    const getEventIcon = (e: TianEvent) => {
        const text = e.event + e.description;
        if (text.includes("纪元") || text.includes("元年") || text.includes("大轮")) return <Orbit size={14} className="text-blue-400" />;
        if (text.includes("祭天") || text.includes("礼仪") || text.includes("正式")) return <Flag size={14} className="text-emerald-400" />;
        if (text.includes("演易") || text.includes("发明") || text.includes("突破")) return <Zap size={14} className="text-amber-400" />;
        if (text.includes("里程碑") || text.includes("复兴") || text.includes("重新")) return <Anchor size={14} className="text-rose-400" />;
        return <Milestone size={14} className="text-sky-400" />;
    };

    // V0.30 模式切换：从网格矩阵切换为底部选择器模式 (下拉/轮播感)
    const renderSelectMode = (label: string, items: Array<string | number>, current: number, setter: (i: number) => void) => (
        <div className="flex flex-col gap-2 relative z-10 group/select">
            <span className="text-[10px] text-stone-500 font-bold tracking-[0.4em] text-center mb-1 select-none uppercase group-hover/select:text-blue-500 transition-colors">{label}</span>
            <div className="relative flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl p-1 shadow-inner group-hover/select:border-blue-500/30 transition-all">
                <button
                    onPointerDown={(e) => { e.stopPropagation(); setter((current - 1 + items.length) % items.length); setYearOffset(0); }}
                    className="p-2 hover:text-blue-400 text-stone-600 active:scale-90 transition-all"
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="flex-1 text-center font-black text-sm tracking-widest text-white py-1">
                    {typeof items[current] === 'number' && items[current] < 10 ? `0${items[current]}` : items[current]}
                </div>
                <button
                    onPointerDown={(e) => { e.stopPropagation(); setter((current + 1) % items.length); setYearOffset(0); }}
                    className="p-2 hover:text-blue-400 text-stone-600 active:scale-90 transition-all"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="w-full space-y-6 lg:space-y-10 pb-24 relative px-4 text-stone-200">
            {/* V0.25 全量矩阵推演面板 - V0.30 间距紧减与重构 */}
            <div className="glass-panel p-6 lg:p-8 border-blue-500/10 bg-blue-500/[0.005] shadow-[0_0_100px_rgba(0,0,0,0.7)] relative z-40 pointer-events-auto ring-1 ring-white/5 mx-auto max-w-7xl">
                <div className="flex flex-col gap-6 lg:gap-8">

                    {/* 第一排：纪元推演核心 (V0.30 选择模式) */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
                        {renderSelectMode("五始大轮", ERA_NAMES, eraIdx, setEraIdx)}
                        {renderSelectMode("大轮之数", GREAT_NUMS, gnIdx, setGnIdx)}
                        {renderSelectMode("大数之行", ELEMENTS, eleIdx, setEleIdx)}
                        {renderSelectMode("岁次位置", POSITIONS, posIdx, setPosIdx)}
                        {renderSelectMode("月度选择", MONTHS, month - 1, (i) => setMonth(i + 1))}

                        {/* V0.30 精确日子步进调节 */}
                        <div className="flex flex-col gap-2 relative z-10 group/day-adjust">
                            <span className="text-[10px] text-blue-500/70 font-bold tracking-[0.4em] text-center mb-1 select-none uppercase group-hover/day-adjust:text-blue-400 transition-colors">精确日子</span>
                            <div className="relative flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl p-1 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover/day-adjust:border-blue-500/40 transition-all">
                                <button
                                    onPointerDown={(e) => { e.stopPropagation(); setDay(d => Math.max(1, d - 1)); }}
                                    className="p-2 text-blue-400 hover:text-white active:scale-90 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="flex-1 text-center font-black text-sm tracking-widest text-white py-1 font-mono">
                                    {effectiveDay < 10 ? `0${effectiveDay}` : effectiveDay}
                                </div>
                                <button
                                    onPointerDown={(e) => { e.stopPropagation(); setDay(d => Math.min(maxDays, d + 1)); }}
                                    className="p-2 text-blue-400 hover:text-white active:scale-90 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                    {/* 第二排：复合控制中心 */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
                        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Search size={12} className="text-blue-500/50" />
                                    <span className="text-[10px] text-stone-600 font-black tracking-[0.4em] uppercase">坐标跳变反查</span>
                                </div>
                                <div className="flex gap-1 items-center">
                                    <input
                                        type="number"
                                        value={queryDate.y}
                                        onChange={(e) => setQueryDate({ ...queryDate, y: parseInt(e.target.value) })}
                                        className="w-16 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs font-mono focus:border-blue-500/50 outline-none"
                                    />
                                    <span className="text-stone-700 text-[9px] font-bold">年</span>
                                    <input
                                        type="number"
                                        value={queryDate.m}
                                        onChange={(e) => setQueryDate({ ...queryDate, m: parseInt(e.target.value) })}
                                        className="w-10 bg-white/5 border border-white/10 rounded-lg py-1.5 px-1 text-xs font-mono text-center focus:border-blue-500/50 outline-none"
                                    />
                                    <span className="text-stone-700 text-[9px] font-bold">月</span>
                                    <input
                                        type="number"
                                        value={queryDate.d}
                                        onChange={(e) => setQueryDate({ ...queryDate, d: parseInt(e.target.value) })}
                                        className="w-10 bg-white/5 border border-white/10 rounded-lg py-1.5 px-1 text-xs font-mono text-center focus:border-blue-500/50 outline-none"
                                    />
                                    <button
                                        onPointerDown={(e) => {
                                            e.stopPropagation();
                                            syncFromGregorian(new Date(queryDate.y, queryDate.m - 1, queryDate.d));
                                        }}
                                        className="ml-2 p-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-400 rounded-lg transition-all"
                                    >
                                        <Activity size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 md:col-span-2">
                                <button
                                    onPointerDown={(e) => { e.stopPropagation(); syncFromGregorian(new Date()); }}
                                    className="flex-1 py-2.5 glass-panel border-white/5 bg-blue-600/10 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all flex items-center justify-center gap-2 group/today active:scale-95"
                                >
                                    <RotateCcw size={12} className="group-hover/today:rotate-[-45deg] transition-transform" />
                                    <span className="text-[10px] font-black tracking-widest uppercase text-center">回归今日坐标</span>
                                </button>
                                <button
                                    onPointerDown={(e) => { e.stopPropagation(); setEraIdx(2); setGnIdx(0); setEleIdx(0); setPosIdx(0); setMonth(1); setDay(1); setYearOffset(0); }}
                                    className="flex-1 py-2.5 glass-panel border-white/5 bg-white/5 hover:bg-stone-800 text-stone-500 rounded-xl transition-all flex items-center justify-center gap-2 group/zero active:scale-95"
                                >
                                    <RotateCcw size={12} className="group-hover/zero:rotate-[-180deg] transition-transform duration-700" />
                                    <span className="text-[10px] font-black tracking-widest uppercase opacity-70 text-center">回归元典</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 同步对照面板 - V0.30 居中与移动端字体优化 */}
            <div className="space-y-4 lg:space-y-8 pt-4">
                <div className="flex items-center justify-center gap-4 text-stone-700 pb-2">
                    <div className="h-px w-12 lg:w-32 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                    <h4 className="text-[10px] font-black tracking-[0.5em] uppercase text-stone-600 text-center">多历法时空对照</h4>
                    <div className="h-px w-12 lg:w-32 bg-gradient-to-l from-transparent via-blue-500/20 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 px-2">
                    <div className="glass-panel p-5 bg-blue-600/10 border-blue-500/30 flex flex-col items-center justify-center space-y-1 shadow-2xl relative overflow-hidden text-center">
                        <span className="text-[9px] text-blue-400 font-black tracking-widest uppercase mb-1">圣太一天历</span>
                        <span className="text-2xl lg:text-3xl font-black text-white font-mono tracking-tighter">{currentYear} <span className="text-[10px] opacity-40">载</span></span>
                        <div className="mt-1 text-[9px] lg:text-[10px] text-blue-400/60 font-serif border-t border-blue-400/10 pt-1">万历之母 · 时空锚点</div>
                    </div>

                    <div className="glass-panel p-5 bg-white/[0.01] border-white/5 flex flex-col items-center justify-center space-y-1 text-center">
                        <span className="text-[9px] text-stone-600 font-bold tracking-widest uppercase mb-1">黄帝纪元</span>
                        <span className="text-2xl lg:text-3xl font-black text-stone-300 font-mono tracking-tight">{sync.yellowEmperor}</span>
                        <span className="text-[9px] text-stone-700 font-serif mt-1 opacity-50 border-t border-white/5 pt-1 uppercase">华夏溯源</span>
                    </div>

                    <div className="glass-panel p-5 bg-white/[0.01] border-white/5 flex flex-col items-center justify-center space-y-1 text-center">
                        <span className="text-[9px] text-stone-600 font-bold tracking-widest uppercase mb-1">汉历干支</span>
                        <span className="text-lg lg:text-2xl font-black text-stone-300 tracking-[0.3em] font-serif">{sync.sexagenary}</span>
                        <span className="text-[9px] text-stone-700 mt-1 opacity-50 border-t border-white/5 pt-1 uppercase">甲子流转</span>
                    </div>

                    <div className="glass-panel p-5 bg-white/[0.01] border-white/5 flex flex-col items-center justify-center space-y-1 text-center opacity-70">
                        <span className="text-[9px] text-stone-700 font-bold tracking-widest uppercase mb-1 italic">西历对齐</span>
                        <span className="text-lg lg:text-2xl font-black text-stone-500 font-mono tracking-normal italic">{sync.gregorian}</span>
                        <span className="text-[9px] text-stone-800 font-mono mt-1 opacity-30 uppercase tracking-[0.2em]">Gregorian</span>
                    </div>
                </div>
            </div>

            {/* 视觉看板区 - V0.30 文字描述对齐与移动端适配 */}
            <div className="text-center pt-8 lg:pt-14 relative z-20">
                <div className="inline-block px-8 lg:px-20 py-10 lg:py-16 glass-panel border-white/5 bg-white/[0.01] relative group shadow-[0_40px_150px_rgba(0,0,0,0.8)] overflow-hidden rounded-[30px] lg:rounded-[40px] max-w-full mx-auto">
                    <div className="absolute -inset-20 bg-blue-600/5 blur-[100px] rounded-full opacity-20"></div>
                    <span className="text-[9px] lg:text-[10px] text-stone-600 uppercase tracking-[0.6em] block mb-6 lg:mb-10 font-black opacity-30 select-none text-center">时空探测全反馈</span>

                    <div className="flex flex-col items-center relative z-10 w-full text-center">
                        <motion.div
                            key={currentYear + effectiveDay}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center w-full space-y-4 lg:space-y-8"
                        >
                            <span className="text-2xl md:text-3xl lg:text-6xl font-black text-white tracking-[0.2em] font-serif bg-gradient-to-b from-white to-stone-600 bg-clip-text text-transparent break-words leading-relaxed px-4 text-center">
                                {ERA_NAMES[eraIdx]}{GREAT_NUMS[gnIdx]}数行{ELEMENTS[eleIdx]}{POSITIONS[posIdx]}
                            </span>

                            <div className="h-px w-24 lg:w-64 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-40"></div>

                            <span className="text-3xl md:text-5xl lg:text-7xl font-black text-blue-500 tracking-tighter font-mono drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                {currentYear}<span className="text-lg lg:text-2xl mx-1 lg:mx-3 opacity-20">·</span>{month < 10 ? `0${month}` : month}<span className="text-lg lg:text-2xl mx-1 lg:mx-3 opacity-20">·</span>{effectiveDay < 10 ? `0${effectiveDay}` : effectiveDay}
                            </span>
                        </motion.div>

                        <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
                            <Orbit size={12} className="text-stone-500" />
                            <span className="text-[8px] font-black tracking-[0.4em] lg:tracking-[0.8em] text-stone-600 uppercase">与文明元典坐标绝对对齐</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 时空脉冲 · 事件隧道 (V0.30 新增事件同步联动) */}
            <section className="mt-16 lg:mt-24 space-y-8 relative z-10">
                <div className="flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Activity className="text-blue-500/40" size={16} />
                        <h4 className="text-[10px] lg:text-[11px] font-black text-stone-600 tracking-[0.5em] lg:tracking-[0.8em] uppercase">时空脉冲 · 事件隧道</h4>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent mx-8 opacity-20"></div>
                </div>

                {/* 隧道式横轴 - V0.34 图标多元化与选中光效 */}
                <div className="flex items-center gap-6 overflow-x-auto pb-6 px-6 no-scrollbar">
                    {events.map((e, idx) => (
                        <div key={idx} className="relative group">
                            <button
                                onClick={(evt) => {
                                    evt.stopPropagation();
                                    const y = e.year;
                                    // 精确计算格点索引
                                    const yOffset = (y - 1);
                                    setEraIdx(Math.floor(yOffset / 3000));
                                    setGnIdx(Math.floor((yOffset % 3000) / 300));
                                    setEleIdx(Math.floor((yOffset % 300) / 60));
                                    setPosIdx(Math.floor((yOffset % 60) / 12));
                                    setYearOffset(yOffset % 12);
                                    setDay(1);
                                    // 强制锁定当前点击的事件
                                    setActiveEvent(e);
                                }}
                                className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative z-50 ${visibleEvent?.year === e.year
                                    ? 'bg-blue-600/20 border-blue-400 text-white scale-125 shadow-[0_0_25px_rgba(59,130,246,0.6)]'
                                    : 'bg-white/[0.02] border-white/10 text-stone-700 hover:border-blue-500/40 hover:text-stone-300'
                                    }`}
                            >
                                {visibleEvent?.year === e.year ? (
                                    <motion.div
                                        layoutId="activeIcon"
                                        className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"
                                    />
                                ) : null}
                                {getEventIcon(e)}
                            </button>
                            <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-tighter opacity-40 transition-opacity group-hover:opacity-100 ${visibleEvent?.year === e.year ? 'opacity-100 text-blue-400 font-bold' : ''}`}>
                                {e.year}
                            </span>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {visibleEvent ? (
                        <motion.div
                            key={visibleEvent.year}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-6 lg:p-10 glass-panel border-white/5 bg-blue-900/[0.03] rounded-3xl mx-2 text-center"
                        >
                            <div className="text-[9px] font-black text-blue-500/50 uppercase tracking-[0.4em] mb-4">{visibleEvent.full_title}</div>
                            <h5 className="text-xl lg:text-4xl font-black text-white tracking-tight font-serif mb-6">{visibleEvent.event}</h5>
                            <p className="text-stone-400 leading-relaxed text-sm lg:text-lg font-serif italic max-w-2xl mx-auto">{visibleEvent.description}</p>
                        </motion.div>
                    ) : (
                        <div className="h-40 border border-dashed border-white/5 rounded-3xl flex items-center justify-center text-stone-800">
                            <span className="text-[9px] tracking-[1em] font-black uppercase opacity-20">脉冲扫描中...</span>
                        </div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
};
