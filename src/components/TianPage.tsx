import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fromGregorian } from '../utils/tianCalendar';
import type { TianDate } from '../utils/tianCalendar';
import { TianCelestialCompass } from './TianCelestialCompass';
import { TianInteractiveDeduction } from './TianInteractiveDeduction';
import { BookOpen, History, X, Shield, Sparkles } from 'lucide-react';

export const TianPage: React.FC = () => {
    const [tianDate, setTianDate] = useState<TianDate>(fromGregorian(new Date()));
    const [overrideDate, setOverrideDate] = useState<Partial<TianDate> | null>(null);
    const [showScripture, setShowScripture] = useState(false);

    useEffect(() => {
        if (!overrideDate) {
            const timer = setInterval(() => {
                setTianDate(fromGregorian(new Date()));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [overrideDate]);

    // 当推演中心发生变化时更新全局日期
    const handleDeductionChange = useCallback((year: number, month: number, day: number) => {
        setTianDate((currentDate) => {
            if (currentDate.year === year && currentDate.month === month && currentDate.day === day) {
                return currentDate;
            }
            return { ...currentDate, year, month, day };
        });

        const currentTianDate = fromGregorian(new Date());
        setOverrideDate((currentOverride) => {
            const isCurrentDate = currentTianDate.year === year
                && currentTianDate.month === month
                && currentTianDate.day === day;
            if (isCurrentDate) return null;
            if (currentOverride?.year === year && currentOverride.month === month && currentOverride.day === day) {
                return currentOverride;
            }
            return { year, month, day };
        });
    }, []);

    // 完整的《圣太一天历》原文材料
    const scriptureText = `
        《圣太一天历》全文
        
        元始太一，始起大轮，阴阳主合，紫斗主分；
        元生太一，然有太易、太初、太始、太素、太统；
        大轮三千，大数三百，五行轮合，末有干支。
        
        紫斗主宗，阳主干行：春夏秋冬寒，五时轮；
        阴分月轮：甲乙丙丁戊己庚辛壬癸，十月正；
        天轮月三十六，末合阳多一。
        
        阴阳合为一时轮，时时合为一全；
        十二全合为一行，五行合为一数；
        五行轮合为一大数，阴阳大合为一大始；
        五始大合，或升太华，或堕混沌。
    `;

    return (
        <div className="relative min-h-screen pb-32 bg-[#02020a] selection:bg-blue-500/30 overflow-x-hidden">
            {/* 背景层：更加明亮、多彩的极光与星空 */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                {/* 基础星空渐变 */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,80,220,0.25)_0%,rgba(10,30,80,0.15)_40%,transparent_100%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(100,50,255,0.1)_0%,transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,180,255,0.1)_0%,transparent_50%)]"></div>

                {/* 动态流光 (极光感) */}
                <motion.div
                    animate={{
                        opacity: [0.2, 0.4, 0.2],
                        x: [-20, 20, -20],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.15)_0%,transparent_70%)] blur-[80px] rotate-[-5deg]"
                />

                {/* 更加丰富的动态星点 */}
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-[15%] left-[15%] w-1 h-1 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"></motion.div>
                <motion.div animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute top-[40%] right-[10%] w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.6)]"></motion.div>
                <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} className="absolute bottom-[20%] left-[30%] w-[2px] h-[2px] bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.6)]"></motion.div>
                <div className="absolute top-[30%] right-[30%] w-[1px] h-[1px] bg-blue-300 rounded-full animate-pulse opacity-50"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
                {/* 序章：闭环逻辑引入 */}
                <section className="relative space-y-12">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 flex flex-col items-center text-center space-y-4">
                            <h2 className="text-4xl md:text-6xl font-black tracking-widest leading-tight transition-all duration-700">
                                <span className="bg-gradient-to-r from-rose-500 via-amber-500 via-emerald-500 via-sky-500 to-violet-500 bg-clip-text text-transparent animate-gradient-x drop-shadow-[0_4px_20px_rgba(255,255,255,0.15)]">
                                    圣太一天历
                                </span>
                                <div className="text-sky-400/80 text-xl md:text-2xl font-light italic mt-2 tracking-[0.2em]">万历之母的时空闭环</div>
                            </h2>
                            <p className="text-stone-400 leading-relaxed text-lg text-justify font-light">
                                “元始太一，始起大轮，阴阳主合，紫斗主分。” 圣太一天历不以月相定长短，而以地球公转角度平分全年。奇月36天，偶月37天，通过精准的十月律动，完美解决了太阳回归年与地球生态命脉的对应关系，形成了一个自洽圆满的时空闭环。
                                <button
                                    onClick={() => setShowScripture(true)}
                                    className="ml-4 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-500/30 hover:border-blue-500 pb-0.5 text-base font-bold"
                                >
                                    <BookOpen size={16} /> 天历全文
                                </button>
                            </p>
                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-center flex flex-col items-center justify-center">
                                    <div className="text-blue-400 text-lg md:text-xl font-black italic">阴阳平衡波动</div>
                                    <div className="text-stone-500 text-xs tracking-widest">36 / 37</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-center flex flex-col items-center justify-center">
                                    <div className="text-blue-400 text-lg md:text-xl font-black italic">太阳回归整律</div>
                                    <div className="text-stone-500 text-xs tracking-widest">十月制</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* 第一部分：视觉灵魂 - 行星视觉罗盘 */}
                <section className="flex flex-col items-center justify-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        {/* 增强背景发光 */}
                        <div className="absolute -inset-40 bg-blue-600/20 blur-[120px] -z-10 rounded-full animate-pulse"></div>
                        <div className="absolute -inset-20 bg-indigo-500/10 blur-[80px] -z-10 rounded-full"></div>
                        <TianCelestialCompass tianDate={tianDate} />
                    </motion.div>

                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center h-8 mb-4">
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-[0.3em] font-serif transition-all duration-700">
                            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(59,130,246,0.2)]">
                                天历罗盘
                            </span>
                        </h1>
                        <p className="text-stone-400 text-sm md:text-base tracking-[0.15em] max-w-lg mx-auto italic leading-relaxed font-light">
                            <span className="bg-gradient-to-r from-stone-500 via-stone-300 to-stone-500 bg-clip-text text-transparent italic">
                                “阴阳大合为一大始，五始大合，或升太华，或堕混沌。”
                            </span>
                        </p>
                    </div>
                </section>

                {/* 第二部分：核心交互 - 独立转动推演模块 */}
                <section className="space-y-4">
                    <TianInteractiveDeduction onDateChange={handleDeductionChange} />
                </section>

                {/* 第三部分：文化底色 - 哲学解析区块 */}
                <section className="grid md:grid-cols-3 gap-8 px-2">
                    <div className="glass-panel p-8 space-y-6 bg-gradient-to-b from-white/5 to-transparent">
                        <Shield className="text-blue-400" size={32} />
                        <h3 className="text-xl font-bold text-white tracking-wider">元始太一</h3>
                        <p className="text-stone-400 text-sm leading-relaxed">
                            天历以太阳回归年为绝对锚点，不仅是一套计时体系，更是华夏先民对宇宙能量脉冲的测控手稿。每一个纪元（大轮）都在推演文明的升华与回归。
                        </p>
                    </div>

                    <div className="glass-panel p-8 space-y-6 bg-gradient-to-b from-white/5 to-transparent border-white/5 group hover:border-emerald-500/30 transition-all duration-500">
                        <Sparkles className="text-emerald-400 group-hover:scale-110 transition-transform" size={32} />
                        <h3 className="text-xl font-bold text-white tracking-wider">阴阳月律</h3>
                        <p className="text-stone-400 text-sm leading-relaxed">
                            一年十月，阴阳交错。这种独特的非十二进制结构，通过高精度的自然律动，实现了对地球生命周期与太阳运行规律的深度平衡。
                        </p>
                    </div>

                    <div className="glass-panel p-8 space-y-6 bg-gradient-to-b from-white/5 to-transparent border-white/5 group hover:border-blue-500/30 transition-all duration-500">
                        <History className="text-blue-400 group-hover:scale-110 transition-transform" size={32} />
                        <h3 className="text-xl font-bold text-white tracking-wider">文明时间锚点</h3>
                        <p className="text-stone-400 text-sm leading-relaxed">
                            从文明曙光初现到今日，时间脉络从未间断。推演中心集成了多维度的历史关键坐标，让漫长的文明足迹在您的转动中清晰呈现。
                        </p>
                    </div>
                </section>
            </div>

            {/* 全屏典籍阅读体验 */}
            <AnimatePresence>
                {showScripture && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-24 pb-6 md:pt-28 md:pb-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowScripture(false)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            className="glass-panel w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border-blue-500/40 shadow-[0_0_100px_rgba(59,130,246,0.2)] mt-12"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-blue-500/10 shrink-0">
                                <div className="space-y-1">
                                    <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-400">
                                        圣太一天历 全文
                                    </h2>
                                    <p className="text-xs text-blue-400/60 font-mono tracking-widest uppercase">Ancient Solar Calendar Scripture</p>
                                </div>
                                <button
                                    onClick={() => setShowScripture(false)}
                                    className="p-2 md:p-3 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 rounded-full transition-all group active:scale-90 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                    title="关闭"
                                >
                                    <X size={24} className="text-white group-hover:text-blue-200 transition-colors drop-shadow-md" />
                                </button>
                            </div>
                            <div className="p-12 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] opacity-90">
                                <div className="max-w-2xl mx-auto space-y-12">
                                    {scriptureText.split('\n\n').map((para, i) => (
                                        <p key={i} className="text-xl md:text-2xl font-serif text-blue-50 text-center leading-[2.5] tracking-widest whitespace-pre-line drop-shadow-sm">
                                            {para.trim()}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
