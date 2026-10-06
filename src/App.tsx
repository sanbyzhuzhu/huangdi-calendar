import { lazy, Suspense, useState } from 'react';
import { CalendarView } from './components/CalendarView';
import { getCalendarData } from './utils/calendarCore';

const CulturePage = lazy(() => import('./components/CulturePage').then(({ CulturePage }) => ({ default: CulturePage })));
const TianPage = lazy(() => import('./components/TianPage').then(({ TianPage }) => ({ default: TianPage })));
const MayanPage = lazy(() => import('./components/MayanPage').then(({ MayanPage }) => ({ default: MayanPage })));
const AboutPage = lazy(() => import('./components/AboutPage').then(({ AboutPage }) => ({ default: AboutPage })));

const PageLoading = () => (
  <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite">
    <div className="flex items-center gap-3 text-stone-400">
      <span className="w-5 h-5 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" aria-hidden="true" />
      <span className="text-sm">正在载入...</span>
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'info' | 'tian' | 'mayan' | 'about'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  // 背景氛围计算逻辑
  const getAtmosphere = () => {
    const data = getCalendarData(currentDate);
    const month = currentDate.getMonth() + 1;

    // 1. 玛雅光束优先级 (基于 KIN 色调)
    const colorMap: Record<string, string> = {
      '红': 'from-rose-900/40 via-stone-950 to-stone-950',
      '白': 'from-stone-800/40 via-stone-950 to-stone-950',
      '蓝': 'from-sky-900/40 via-stone-950 to-stone-950',
      '黄': 'from-amber-900/40 via-stone-950 to-stone-950',
      '绿': 'from-emerald-900/40 via-stone-950 to-stone-950'
    };

    // 提取玛雅主色 (假设 CN 中包含色)
    let mayaColorClass = 'from-stone-900/40';
    for (const color in colorMap) {
      if (data.mayan.tzolkinCN.includes(color)) {
        mayaColorClass = colorMap[color];
        break;
      }
    }

    // 2. 季节兜底
    // 春: 3-5, 夏: 6-8, 秋: 9-11, 冬: 12-2
    let seasonOverlay = 'shadow-[inset_0_0_100px_rgba(16,185,129,0.05)]'; // 春
    if (month >= 6 && month <= 8) seasonOverlay = 'shadow-[inset_0_0_100px_rgba(244,63,94,0.05)]'; // 夏
    else if (month >= 9 && month <= 11) seasonOverlay = 'shadow-[inset_0_0_100px_rgba(245,158,11,0.05)]'; // 秋
    else if (month >= 12 || month <= 2) seasonOverlay = 'shadow-[inset_0_0_100px_rgba(14,165,233,0.05)]'; // 冬

    return { mayaColorClass, seasonOverlay };
  };

  const { mayaColorClass, seasonOverlay } = getAtmosphere();

  return (
    <div className={`min-h-screen text-stone-100 font-sans selection:bg-amber-500/30 transition-colors duration-1000 bg-stone-950 relative overflow-x-hidden`}>
      {/* 动态背景层 */}
      <div className={`fixed inset-0 bg-gradient-to-tr ${mayaColorClass} -z-50`}></div>
      <div className={`fixed inset-0 ${seasonOverlay} pointer-events-none -z-50`}></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none -z-50"></div>

      {/* 核心装饰背景 - 采用轻量模糊圆环 - 强制置底 */}
      <div className="fixed inset-0 flex items-center justify-center opacity-5 pointer-events-none -z-[100] overflow-hidden">
        <div className="w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] border-[2px] border-white/5 rounded-full scale-125 blur-3xl shadow-[0_0_100px_rgba(255,255,255,0.05)]"></div>
      </div>

      {/* Version Header */}
      <div className="fixed top-4 left-6 z-[60] flex flex-col pointer-events-none">
        <h1 className="text-xl font-black tracking-tighter italic text-white/90">古历法</h1>
        <span className="text-[8px] text-stone-500 tracking-[0.3em] font-light -mt-1">V 0.10.07</span>
      </div>


      {/* Navigation */}
      <nav className="fixed top-12 md:top-4 left-1/2 -translate-x-1/2 z-50 glass-panel px-1 md:px-2 py-1 flex items-center justify-center gap-1 rounded-full shadow-2xl w-[95%] md:w-auto overflow-x-auto no-scrollbar scale-95 md:scale-100">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${activeTab === 'calendar' ? 'bg-amber-500/20 text-amber-500 font-bold' : 'hover:bg-white/10 text-stone-300'}`}
        >
          <span className="text-base md:text-lg tracking-widest">历法</span>
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${activeTab === 'info' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'hover:bg-white/10 text-stone-300'}`}
        >
          <span className="text-base md:text-lg tracking-widest">科普</span>
        </button>
        <button
          onClick={() => setActiveTab('tian')}
          className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${activeTab === 'tian' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'hover:bg-white/10 text-stone-300'}`}
        >
          <span className="text-base md:text-lg tracking-widest">天历</span>
        </button>
        <button
          onClick={() => setActiveTab('mayan')}
          className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${activeTab === 'mayan' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'hover:bg-white/10 text-stone-300'}`}
        >
          <span className="text-base md:text-lg tracking-widest">玛雅</span>
        </button>

        <div className="w-[1px] h-5 bg-white/20 mx-0.5"></div>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${activeTab === 'about' ? 'bg-amber-500/20 text-amber-500 font-bold' : 'hover:bg-white/10 text-stone-300'}`}
        >
          <span className="text-base md:text-lg tracking-widest">说明</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="pt-32 md:pt-24 pb-12 relative z-10">
        <Suspense fallback={<PageLoading />}>
          {activeTab === 'calendar' && (
            <CalendarView
              onDateChange={setCurrentDate}
            />
          )}
          {activeTab === 'info' && <CulturePage />}
          {activeTab === 'tian' && <TianPage />}
          {activeTab === 'mayan' && <MayanPage />}
          {activeTab === 'about' && <AboutPage />}
        </Suspense>
      </main>

    </div>
  );
}

export default App;
