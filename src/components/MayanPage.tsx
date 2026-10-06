import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCalendarData } from '../utils/calendarCore';
import { Lunar } from 'lunar-javascript';
import { getAssetUrl } from '../utils/assetUtils';

// ─── 20 个日符/图腾数据 ───────────────────────────────────────────────────────
const TOTEMS = [
    { id: 1, name: "红龙", en: "Imix (Dragon)", glyph: "🐊", img: getAssetUrl("/assets/mayan/红龙.jpg"), element: "水", direction: "东", keyword: "原初创造·滋养", power: "哺育", color: "#ef4444", family: "基本家族", desc: "宇宙的起始点，一切创造力的源头。象征大海与混沌的原始力量，赋予生命以滋养。拥有此图腾的人往往有强大的哺育本能。" },
    { id: 2, name: "白风", en: "Ik (Wind)", glyph: "🌬️", img: getAssetUrl("/assets/mayan/白风.jpg"), element: "气", direction: "北", keyword: "灵感·沟通·气息", power: "沟通", color: "#8b5cf6", family: "核心家族", desc: "无形却无处不在的风，象征神圣的气息与灵感的传递。是心灵与神圣之间的桥梁，也代表言语和思想的力量。" },
    { id: 3, name: "蓝夜", en: "Akbal (Night)", glyph: "🌑", img: getAssetUrl("/assets/mayan/蓝夜.jpg"), element: "土", direction: "西", keyword: "梦境·直觉·神圣封印", power: "直觉", color: "#1e293b", family: "门户家族", desc: "深邃的夜晚，内心世界的圣所。拥有深刻的直觉能力，能够访问梦境领域获取智慧。象征内在的丰盛与神圣的黑暗。" },
    { id: 4, name: "黄种子", en: "Kan (Seed)", glyph: "🌽", img: getAssetUrl("/assets/mayan/黄种子.jpg"), element: "土", direction: "南", keyword: "种子·成长·性力", power: "繁茂", color: "#f59e0b", family: "信号家族", desc: "生命力的种子，潜能的象征。代表所有形态的种子——物质的、精神的、创造的。拥有强大的生殖力能量和成长的潜质。" },
    { id: 5, name: "红蛇", en: "Chicchan (Serpent)", glyph: "🐍", img: getAssetUrl("/assets/mayan/红蛇.jpg"), element: "火", direction: "东", keyword: "昆达里尼·性命本能", power: "生命力", color: "#dc2626", family: "极性家族", desc: "盘绕的生命力量，象征脊柱能量（昆达里尼）的觉醒。掌握身体的本能智慧，也代表神圣转化的契机。" },
    { id: 6, name: "白世界桥", en: "Cimi (WorldBridger)", glyph: "💀", img: getAssetUrl("/assets/mayan/白世界桥.jpg"), element: "气", direction: "北", keyword: "死亡·转化·超越", power: "平等", color: "#6b7280", family: "基本家族", desc: "生死之间的桥梁。将死亡视为通往新维度的转化，而非终点。象征对旧模式的放手与对新可能的接纳。" },
    { id: 7, name: "蓝手", en: "Manik (Hand)", glyph: "🦌", img: getAssetUrl("/assets/mayan/蓝手.jpg"), element: "水", direction: "西", keyword: "完成·治愈·灵巧", power: "治愈", color: "#059669", family: "核心家族", desc: "神之手，具备出色的治愈与完成事务的能力。以优雅完成生命使命，象征丰盛的工具与技巧的结合。" },
    { id: 8, name: "黄星星", en: "Lamat (Star)", glyph: "⭐", img: getAssetUrl("/assets/mayan/黄星星.jpg"), element: "土", direction: "南", keyword: "和谐·星光·繁盛", power: "优雅", color: "#eab308", family: "门户家族", desc: "金星的标志，代表繁盛、美丽与和谐。有着内在的优雅与艺术感，天生擅长创造美好与富足。" },
    { id: 9, name: "红月", en: "Muluc (Moon)", glyph: "🌊", img: getAssetUrl("/assets/mayan/红月.jpg"), element: "水", direction: "东", keyword: "情感·月亮·记忆", power: "净化", color: "#3b82f6", family: "信号家族", desc: "月亮的能量与水的流动，代表情感世界的深邃与记忆的库存。具备强烈的共情能力与净化力量。" },
    { id: 10, name: "白狗", en: "Oc (Dog)", glyph: "🐕", img: getAssetUrl("/assets/mayan/白狗.jpg"), element: "土", direction: "北", keyword: "忠诚·爱·指引", power: "心之爱", color: "#d97706", family: "极性家族", desc: "无条件的爱与忠诚的象征。作为灵魂的向导穿越黑暗，象征人与神圣之间的亲密连结与信任。" },
    { id: 11, name: "蓝猴", en: "Chuen (Monkey)", glyph: "🐒", img: getAssetUrl("/assets/mayan/蓝猴.jpg"), element: "气", direction: "西", keyword: "创造·游戏·幽默", power: "魔术", color: "#8b5cf6", family: "基本家族", desc: "神圣织工与宇宙的艺术家。将一切视为游戏的神圣嬉戏，象征无限的创造力与时间轴的编织者。" },
    { id: 12, name: "黄人", en: "Eb (Human)", glyph: "🌾", img: getAssetUrl("/assets/mayan/黄人.jpg"), element: "水", direction: "南", keyword: "自由意志·智慧·丰盛", power: "影响", color: "#65a30d", family: "核心家族", desc: "人类之路的象征。拥有全然的自由意志，在丰盛与挑战并存的旅途中前行，承载集体人类的记忆与智慧。" },
    { id: 13, name: "红天行者", en: "Ben (Skywalker)", glyph: "🌵", img: getAssetUrl("/assets/mayan/红天行者.jpg"), element: "天", direction: "东", keyword: "空间·预言·探索", power: "觉醒", color: "#0ea5e9", family: "门户家族", desc: "天地之间的行者。连结天界与人间，是人类意识进化的先锋。拥有与更高维度连结的天赋，擅长开拓未知领域。" },
    { id: 14, name: "白巫师", en: "Ix (Wizard)", glyph: "🐆", img: getAssetUrl("/assets/mayan/白巫师.jpg"), element: "土", direction: "北", keyword: "接受·无时间·魔法", power: "附魔", color: "#7c3aed", family: "信号家族", desc: "掌握魔法与时间奥秘的神秘巫师。能够超越时空，整合所有时间平行线，集通灵、治愈、魔法于一身。" },
    { id: 15, name: "蓝鹰", en: "Men (Eagle)", glyph: "🦅", img: getAssetUrl("/assets/mayan/蓝鹰.jpg"), element: "气", direction: "西", keyword: "心智·视野·创造", power: "宏图", color: "#0891b2", family: "极性家族", desc: "翱翔高空的鹰击长空，俯瞰全局。代表全球视野和更高意识形态，擅长从制高点看清生命全貌，引领愿景实现。" },
    { id: 16, name: "黄战士", en: "Cib (Warrior)", glyph: "🦅", img: getAssetUrl("/assets/mayan/黄战士.jpg"), element: "土", direction: "南", keyword: "追问·无畏·智力", power: "探求", color: "#78716c", family: "基本家族", desc: "身经百战的智慧武士。承载着祖先的记忆与宇宙法则，带着神圣的使命感前行，能够宽恕并超越业力。" },
    { id: 17, name: "红地球", en: "Caban (Earth)", glyph: "🌍", img: getAssetUrl("/assets/mayan/红地球.jpg"), element: "土", direction: "东", keyword: "共时·演化·导航", power: "共时发生", color: "#92400e", family: "核心家族", desc: "与大地脉动共振的导航者。感知地球能量场，能在混沌中找到方向。象征智能地球与人类意识进化的合一。" },
    { id: 18, name: "白镜子", en: "Etznab (Mirror)", glyph: "🔮", img: getAssetUrl("/assets/mayan/白镜子.jpg"), element: "气", direction: "北", keyword: "秩序·无限·反射", power: "照见", color: "#1d4ed8", family: "门户家族", desc: "折射真相之光的神圣镜子。能够穿透幻象，直视本质。象征不可移动的真理力量，是宇宙智慧的见证者。" },
    { id: 19, name: "蓝风暴", en: "Cauac (Storm)", glyph: "⛈️", img: getAssetUrl("/assets/mayan/蓝风暴.jpg"), element: "水", direction: "西", keyword: "能量·自体发生·催化", power: "衍生", color: "#4f46e5", family: "信号家族", desc: "净化与催化的闪电风暴。带来激烈的能量转化，清除旧有模式，为全新的开始创造空间。是扮演催化者角色的艺术家。" },
    { id: 20, name: "黄太阳", en: "Ahau (Sun)", glyph: "☀️", img: getAssetUrl("/assets/mayan/黄太阳.jpg"), element: "火", direction: "南", keyword: "生命·开悟·宇宙之火", power: "赋闲", color: "#f97316", family: "极性家族", desc: "圆满的太阳图腾，一个银河周期的终点与起点。象征无条件的爱与神圣的整合，是光的使者和所有图腾的源与归。" },
];

// ─── 13 个调性数据 ──────────────────────────────────────────────────────────
const TONES = [
    { num: 1, name: "磁性的", img: getAssetUrl("/assets/mayan/1 磁性的.jpg"), keyword: "吸引·目标·统一", chakra: "海底轮", joint: "右脚踝", meditation: "设下清晰的意图，吸引所有支持你目标的能量。", desc: "万物归一的磁力。以目标吸引能量聚合，设定一卓尔金历年的核心意图。" },
    { num: 2, name: "月亮的", img: getAssetUrl("/assets/mayan/2 月亮的.jpg"), keyword: "两极·挑战·稳定", chakra: "脐轮", joint: "右膝盖", meditation: "识别当前的阴阳挑战，在对立中寻找平衡的基石。", desc: "月亮的二元张力。感知阴阳、光暗的对立，从中获得平衡与稳定的力量。" },
    { num: 3, name: "电力的", img: getAssetUrl("/assets/mayan/3 电力的.jpg"), keyword: "服务·激活·纽带", chakra: "太阳神经丛", joint: "右臀部", meditation: "通过服务他人的行动，激活内在深藏的创造原型。", desc: "激活高频电力能量。通过在关系中服务他人来激活自身潜能，形成三角纽带。" },
    { num: 4, name: "自我存在的", img: getAssetUrl("/assets/mayan/4 自我存在的.jpg"), keyword: "定义·形式·措施", chakra: "心轮", joint: "右腕", meditation: "审视你的行动形式，确保它符合你内在的真理定义。", desc: "给混沌赋予形式。以自律 and 精准为力量，通过反复磨砺实现自我完善。" },
    { num: 5, name: "超频的", img: getAssetUrl("/assets/mayan/5 超频的.jpg"), keyword: "光芒·核心·赋权", chakra: "喉轮", joint: "右肘", meditation: "连接各方核心，散发光芒，赋予周围人前行的力量。", desc: "星光辐射的中央力量。以五角星的辐射模式，从核心向外散发莹光，赋予他人力量。" },
    { num: 6, name: "韵律的", img: getAssetUrl("/assets/mayan/6 韵律的.jpg"), keyword: "有机·动态·平衡", chakra: "眉心轮", joint: "右肩", meditation: "跟随生命自然的韵律律动，在动态中保持内在平衡。", desc: "生命固有的节律韵脚。如心跳与潮汐般规律流动，在动态中寻求有机的平衡。" },
    { num: 7, name: "共振的", img: getAssetUrl("/assets/mayan/7 共振的.jpg"), keyword: "渠道·感召·灵感", chakra: "顶轮", joint: "颈部", meditation: "调频至宇宙的频道，允许神神圣灵感自由穿过身体。", desc: "神圣音频的共振点。作为神圣灵感的传递渠道，沉浸于内在的宇宙感召中创造。" },
    { num: 8, name: "银河的", img: getAssetUrl("/assets/mayan/8 银河的.jpg"), keyword: "和谐·完整", chakra: "运作", joint: "左肩", meditation: "保持言行一致，以正直诚廉的态度活出完整的自我。", desc: "银河系的八重和谐。以诚廉正直的内心状态将信仰与行动合一，创造神圣的和谐圆满。" },
    { num: 9, name: "太阳的", img: getAssetUrl("/assets/mayan/9 太阳的.jpg"), keyword: "意图·脉动·实现", chakra: "九维", joint: "左肘", meditation: "强化你的生命脉动，将强大的意图转化为现实的成果。", desc: "太阳的辐射意图。以全然的宇宙力量脉动，将神圣意图具体呈现为现实。" },
    { num: 10, name: "行星的", img: getAssetUrl("/assets/mayan/10 行星的.jpg"), keyword: "显化·完美", chakra: "自我", joint: "左腕", meditation: "专注显化的过程，在产出的完美中体验生命的回馈。", desc: "行星能量的显化力。通过创造性思维将意识贯注至物质层面，体验完美显化的喜悦。" },
    { num: 11, name: "光谱的", img: getAssetUrl("/assets/mayan/11 光谱的.jpg"), keyword: "解放·放下", chakra: "十一维", joint: "左臀部", meditation: "深呼吸，释放所有沉重的过往，让生命重新轻盈解放。", desc: "彩虹光谱的解脱之力。将一切压缩的业力与旧有模式彻底释放，回归生动的当下本质。" },
    { num: 12, name: "水晶的", img: getAssetUrl("/assets/mayan/12 水晶的.jpg"), keyword: "奉献·万物合一", chakra: "十二维", joint: "左膝盖", meditation: "分享你的见解，在共同体的奉献中寻找万物一体感。", desc: "水晶矩阵的合作意识。以奉献与合作为路径，于共同体中建立超越个人的宇宙意识。" },
    { num: 13, name: "宇宙的", img: getAssetUrl("/assets/mayan/13 宇宙的.jpg"), keyword: "超越·万物流动", chakra: "宇宙", joint: "左脚踝", meditation: "超越现有的界限，允许意识随万物的永恒流动而扩张。", desc: "宇宙调性的至高终结。以超越一切的宇宙智慧包容所有存在，于永恒的流动中创造新的开始。" },
];

// 13 问（调性 1~13 对应的银河提问，所有波符共用此框架）
const THIRTEEN_QUESTIONS = [
    { tone: 1, label: "磁性", question: "我的目标是什么？（吸引·统一）" },
    { tone: 2, label: "月亮", question: "我面临的挑战是什么？（两极·稳定）" },
    { tone: 3, label: "电力", question: "我要如何服务？（激活·纽带）" },
    { tone: 4, label: "自我存在", question: "我采取什么形式存在？（定义·措施）" },
    { tone: 5, label: "超频", question: "我核心的力量是什么？（光芒·赋权）" },
    { tone: 6, label: "韵律", question: "我如何在动态中达到平衡？（有机·平衡）" },
    { tone: 7, label: "共振", question: "我如何与灵感的渠道调频？（感召·灵感）" },
    { tone: 8, label: "银河", question: "我如何与灵魂的信念保持一致？（和谐·完整）" },
    { tone: 9, label: "太阳", question: "我如何完成我的意图？（意图·脉动）" },
    { tone: 10, label: "行星", question: "我如何完美显化？（显化·完美）" },
    { tone: 11, label: "光谱", question: "我如何释放和放下？（解放·放下）" },
    { tone: 12, label: "水晶", question: "我如何在共同体中奉献协作？（奉献·合一）" },
    { tone: 13, label: "宇宙", question: "我如何超越，让万物流动？（超越·流动）" },
];

// ─── 20 条波符数据 ───────────────────────────────────────────────────────────
// 波符起始 Kin: 1,14,27,40,53,66,79,92,105,118,131,144,157,170,183,196,209,222,235,248
const WAVESPELLS = [
    { id: 1, totemIdx: 0, name: "红龙波符", img: getAssetUrl("/assets/mayan/wavespell/红龙波.png"), color: "#ef4444", theme: "原初哺育 · 诞生之始", desc: "玛雅历法的第一条波符。这是一段关于起始、滋养与存在的旅程。在这个波符，适合开启新的项目，照顾好自己的身体，感受如母亲般的原始关怀。" },
    { id: 2, totemIdx: 1, name: "白风波符", img: getAssetUrl("/assets/mayan/wavespell/白风波.png"), color: "#8b5cf6", theme: "灵感沟通 · 传达真理", desc: "神圣气息流动的13天。通过呼吸连接灵感，释放表达的勇气。这是传播真理、改善沟通平衡关系的绝佳时机。" },
    { id: 3, totemIdx: 2, name: "蓝夜波符", img: getAssetUrl("/assets/mayan/wavespell/蓝夜波.png"), color: "#1e293b", theme: "梦境丰盛 · 直觉觉醒", desc: "深入潜意识与梦境深处的13天。去探索内在的圣所，访问那份与生俱来的丰盛。信任你的直觉，它会指引你发现隐藏的珍宝。" },
    { id: 4, totemIdx: 3, name: "黄种子波符", img: getAssetUrl("/assets/mayan/wavespell/黄种子波.png"), color: "#f59e0b", theme: "目标成长 · 潜能开花", desc: "播撒意识种子的13天。聚焦于你的核心意图，保持觉察与耐心。这是一个只要通过专注努力，就能看到生命力蓬勃生长的波符。" },
    { id: 5, totemIdx: 4, name: "红蛇波符", img: getAssetUrl("/assets/mayan/wavespell/红蛇波.png"), color: "#dc2626", theme: "本能生命力 · 身体转化", desc: "激活身体细胞与昆达里尼能量。关注身体的讯息，释放停滞的生命能量。这是一个充满激情、力量感与深刻转化的13天周期。" },
    { id: 6, totemIdx: 5, name: "白世界桥波符", img: getAssetUrl("/assets/mayan/wavespell/白世界桥波.png"), color: "#6b7280", theme: "死亡转化 · 机遇连接", desc: "告别旧有模式，架起通往新世界桥梁的时刻。练习平等心与放下，在终结中寻找新生。这也是连接不同资源、跨界合作的好时机。" },
    { id: 7, totemIdx: 6, name: "蓝手波符", img: getAssetUrl("/assets/mayan/wavespell/蓝手波.png"), color: "#059669", theme: "疗愈完成 · 知行合一", desc: "用行动来完成并疗愈。这是一个动手的波符，通过具体事务的落实来锚定能量。在创造的过程中，你会发现内在的和谐与完整。" },
    { id: 8, totemIdx: 7, name: "黄星星波符", img: getAssetUrl("/assets/mayan/wavespell/黄星星波.png"), color: "#eab308", theme: "艺术和谐 · 优雅生活", desc: "追寻美与艺术的13天。在生活中注入优雅的调性，通过创造美来提升频率。这是一个让才华闪耀、调整周围环境至和谐状态的周期。" },
    { id: 9, totemIdx: 8, name: "红月波符", img: getAssetUrl("/assets/mayan/wavespell/红月波.png"), color: "#3b82f6", theme: "情绪流动 · 内在净化", desc: "如同水流般清洗记忆与情感的堆叠。允许情绪自然流淌，不加评判地去感受。这也是一个净化身心、迎接宇宙之流引导的时期。" },
    { id: 10, totemIdx: 9, name: "白狗波符", img: getAssetUrl("/assets/mayan/wavespell/白狗波.png"), color: "#d97706", theme: "忠诚之爱 · 心灵觉知", desc: "这是关于爱、忠诚与人际关系的13天。回归内心的初衷，练习无条件的接纳。在这个波符，去感受并表达你对他人的深厚情感。" },
    { id: 11, totemIdx: 10, name: "蓝猴波符", img: getAssetUrl("/assets/mayan/wavespell/蓝猴波.png"), color: "#8b5cf6", theme: "幻象魔法 · 游戏人生", desc: "看穿严肃现象背后的游戏本质。保持好奇心与幽默感，去体验当下的神奇与幻变。这是一个适合用魔法师的心态去编织生活的周期。" },
    { id: 12, totemIdx: 11, name: "黄人波符", img: getAssetUrl("/assets/mayan/wavespell/黄人波.png"), color: "#65a30d", theme: "自由意志 · 智慧显现", desc: "承担身为人的责任，行使自由意志的力量。通过明智的选择来引导生命走向，并在实践中积累并分享你的智慧经验。" },
    { id: 13, totemIdx: 12, name: "红天行者波符", img: getAssetUrl("/assets/mayan/wavespell/红天行者波.png"), color: "#0ea5e9", theme: "时空探索 · 预言觉醒", desc: "拓展你的物理与精神边界。在不同的时空语境中穿梭，接收来自更高版本的指引。这是一个适合旅行、跨界交流和大胆探索的13天。" },
    { id: 14, totemIdx: 13, name: "白巫师波符", img: getAssetUrl("/assets/mayan/wavespell/白巫师波.png"), color: "#7c3aed", theme: "无时间性 · 接纳魔法", desc: "进入静默、接纳与当下的深度状态。超越线性时间的焦虑，通过全然的临在来施展你的生活魔法。保持内在的一致性，奇迹自然降临。" },
    { id: 15, totemIdx: 14, name: "蓝鹰波符", img: getAssetUrl("/assets/mayan/wavespell/蓝鹰波.png"), color: "#0891b2", theme: "格局视野 · 蓝图创造", desc: "像鹰一样高飞，观察事物的整体格局。通过宏大的视野来修正你的具体行动。这是一个制定长远计划、提升认知维度的绝佳时期。" },
    { id: 16, totemIdx: 15, name: "黄战士波符", img: getAssetUrl("/assets/mayan/wavespell/黄战士波.png"), color: "#78716c", theme: "智慧追问 · 无畏探求", desc: "带着问题去探索，勇于挑战权威与旧习。运用你的心智力量，客观无畏地寻求真理。这是一个培养内在深度与洞察力的英雄旅程。" },
    { id: 17, totemIdx: 16, name: "红地球波符", img: getAssetUrl("/assets/mayan/wavespell/红地球波.png"), color: "#92400e", theme: "共时导航 · 地球演化", desc: "感受大地的脉搏，与共时性事件同频。留意你周围的巧合，那是宇宙给你的导航。在这个波符，去回归自然，感知演化的节奏。" },
    { id: 18, totemIdx: 17, name: "白镜子波符", img: getAssetUrl("/assets/mayan/wavespell/白镜子波.png"), color: "#1d4ed8", theme: "照见真理 · 秩序反射", desc: "反思与照见的时刻。通过外部世界这面镜子来看清内在的实相。清理幻象，恢复神圣秩序，去体验无限反射的智慧光芒。" },
    { id: 19, totemIdx: 18, name: "蓝风暴波符", img: getAssetUrl("/assets/mayan/wavespell/蓝风暴波.png"), color: "#4f46e5", theme: "自体催化 · 能量转化", desc: "迎接猛烈的清理与变革。释放陈旧的能量，让内在的风暴席卷所有不符实相的部分。这是生命自体发生、加速演化的震撼过程。" },
    { id: 20, totemIdx: 19, name: "黄太阳波符", img: getAssetUrl("/assets/mayan/wavespell/黄太阳波.png"), color: "#f97316", theme: "宇宙之火 · 生命觉醒", desc: "银河循环的终章与圆满。体验无条件的爱与纯粹的光明。在这个波符，去宽恕、去接纳、去照耀，让生命在温暖中达成合一。" },
];

// 根据波符 totemIdx 计算该波符包含的13个 Kin
const getWavespellKins = (totemIdx: number) => {
    const tzolkinNames = ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界桥", "蓝手", "黄星星", "红月", "白狗", "蓝猴", "黄人", "红天行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"];
    const toneNames = ["磁性", "月亮", "电力", "自我存在", "超频", "韵律", "共振", "银河", "太阳", "行星", "光谱", "水晶", "宇宙"];
    // 波符起始 kin（1-indexed）= 第几批 × 13 + 1
    // 波符顺序：20条，第n条起始 totemIdx 为 (n-1)*0 + totemIdx（直接按图腾顺序排列）
    // 实际上波符按260天顺序，每条13天，共20条。
    // 第 wsIdx(0-based) 条波符，包含图腾 = (totemIdx + 0..19*1) % 20，调性 = 1..13
    return Array.from({ length: 13 }, (_, i) => ({
        tone: i + 1,
        toneName: toneNames[i],
        totemName: tzolkinNames[(totemIdx + i) % 20],
        totemImg: getAssetUrl(`/assets/mayan/${tzolkinNames[(totemIdx + i) % 20]}.jpg`),
    }));
};

// Helper to render Mayan Numbers (Dots and Bars)
const MayanNumber = ({ num }: { num: number }) => {
    const bars = Math.floor(num / 5);
    const dots = num % 5;

    return (
        <div className="flex flex-col items-center justify-center gap-1">
            {dots > 0 && (
                <div className="flex gap-1 mb-1">
                    {Array.from({ length: dots }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-current" />
                    ))}
                </div>
            )}
            {bars > 0 && (
                <div className="flex flex-col gap-1">
                    {Array.from({ length: bars }).map((_, i) => (
                        <div key={i} className="w-8 h-1.5 rounded-full bg-current" />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── 20 个星际原型 ─────────────────────────────────────────────────────────
const ARCHETYPES = [
    { id: 1, totemIdx: 0, name: "宇宙母亲", en: "Cosmic Mother", img: getAssetUrl("/assets/mayan/archetype/星际原型-01.png"), color: "#ef4444", desc: "滋养一切生命的原初母神，象征无限的爱与创造力。对应红龙，是所有存在的源泉与保护者。" },
    { id: 2, totemIdx: 1, name: "风中吟游者", en: "Cosmic Wind", img: getAssetUrl("/assets/mayan/archetype/星际原型-02.png"), color: "#8b5cf6", desc: "传递神圣信息与灵感的天使使者，以气息之形穿行于各个维度。对应白风，是思想与沟通的精华。" },
    { id: 3, totemIdx: 2, name: "神秘梦者", en: "Cosmic Dreamer", img: getAssetUrl("/assets/mayan/archetype/星际原型-03.png"), color: "#7dd3fc", desc: "守护梦境与内在宇宙引路人，能在无意识深海中航行。对应蓝夜，是丰盛与直觉的掌管者。" },
    { id: 4, totemIdx: 3, name: "种子播撒者", en: "Cosmic Seed", img: getAssetUrl("/assets/mayan/archetype/星际原型-04.png"), color: "#f59e0b", desc: "开创新世界的意识播种者，充满生命力与潜能。对应黄种子，是成长与蓬勃生机的象征。" },
    { id: 5, totemIdx: 4, name: "圣蛇守护者", en: "Cosmic Serpent", img: getAssetUrl("/assets/mayan/archetype/星际原型-05.png"), color: "#dc2626", desc: "掌握昆达里尼与神圣生命力的智慧守护者，连结天地的力量通道。对应红蛇，象征本能与觉醒。" },
    { id: 6, totemIdx: 5, name: "死亡持有者", en: "Cosmic WorldBridger", img: getAssetUrl("/assets/mayan/archetype/星际原型-06.png"), color: "#6b7280", desc: "平等对待生死、架设两界之桥的引渡者，以无执之心完成转化。对应白世界桥，是蜕变的使者。" },
    { id: 7, totemIdx: 6, name: "神圣疗愈者", en: "Cosmic Hand", img: getAssetUrl("/assets/mayan/archetype/星际原型-07.png"), color: "#059669", desc: "以双手传递神圣治愈能量的完成者，行动即祷告。对应蓝手，是服务与完成使命的象征。" },
    { id: 8, totemIdx: 7, name: "宇宙艺术家", en: "Cosmic Star", img: getAssetUrl("/assets/mayan/archetype/星际原型-08.png"), color: "#eab308", desc: "用美丽与和谐编织现实的创造艺术家，将星光带入日常生活。对应黄星星，是优雅与丰盛的化身。" },
    { id: 9, totemIdx: 8, name: "宇宙净化者", en: "Cosmic Moon", img: getAssetUrl("/assets/mayan/archetype/星际原型-09.png"), color: "#3b82f6", desc: "以月亮能量净化情感海洋的引导者，让记忆与感受自由流淌。对应红月，是净化与共情的象征。" },
    { id: 10, totemIdx: 9, name: "神圣忠诚者", en: "Cosmic Dog", img: getAssetUrl("/assets/mayan/archetype/星际原型-10.png"), color: "#d97706", desc: "以无条件之爱引领灵魂穿越黑暗的忠实伴侣，是心与神之间的桥梁。对应白狗，象征忠诚与信任。" },
    { id: 11, totemIdx: 10, name: "神圣织物工", en: "Cosmic Monkey", img: getAssetUrl("/assets/mayan/archetype/星际原型-11.png"), color: "#8b5cf6", desc: "在时间轴中编织魔法与游戏的宇宙艺术家，以幽默化解一切。对应蓝猴，是魔术与创造力的使者。" },
    { id: 12, totemIdx: 11, name: "宇宙旅行者", en: "Cosmic Human", img: getAssetUrl("/assets/mayan/archetype/星际原型-12.png"), color: "#65a30d", desc: "承载人类自由意志荣耀行走的旅行者，在选择与智慧间演化。对应黄人，是影响力与自由的化身。" },
    { id: 13, totemIdx: 12, name: "天地行者", en: "Cosmic Skywalker", img: getAssetUrl("/assets/mayan/archetype/星际原型-13.png"), color: "#0ea5e9", desc: "连接天界与人间传递神圣预言的先锋探索者。对应红天行者，是觉醒与空间探索的象征。" },
    { id: 14, totemIdx: 13, name: "宇宙巫师", en: "Cosmic Wizard", img: getAssetUrl("/assets/mayan/archetype/星际原型-14.png"), color: "#7c3aed", desc: "超越时间掌握无时间魔法的神秘施法者，整合所有维度的智慧。对应白巫师，象征附魔与接纳。" },
    { id: 15, totemIdx: 14, name: "宇宙之鹰", en: "Cosmic Eagle", img: getAssetUrl("/assets/mayan/archetype/星际原型-15.png"), color: "#0891b2", desc: "以全球视野俯瞰一切的先知之眼，引领集体意识进化。对应蓝鹰，是宏图与创造力的化身。" },
    { id: 16, totemIdx: 15, name: "宇宙战士", en: "Cosmic Warrior", img: getAssetUrl("/assets/mayan/archetype/星际原型-16.png"), color: "#78716c", desc: "承载宇宙智慧无畏前行的神圣战士，以追问揭示真相。对应黄战士，是探求与宽恕的象征。" },
    { id: 17, totemIdx: 16, name: "宇宙导航者", en: "Cosmic Earth", img: getAssetUrl("/assets/mayan/archetype/星际原型-17.png"), color: "#92400e", desc: "与大地同频共时导航的进化引领者，感知宇宙信号。对应红地球，是共时与演化的化身。" },
    { id: 18, totemIdx: 17, name: "宇宙之镜", en: "Cosmic Mirror", img: getAssetUrl("/assets/mayan/archetype/星际原型-18.png"), color: "#1d4ed8", desc: "反射无限真理光芒的宇宙镜子，以无序中发现秩序。对应白镜子，是照见与无限的象征。" },
    { id: 19, totemIdx: 18, name: "宇宙风暴", en: "Cosmic Storm", img: getAssetUrl("/assets/mayan/archetype/星际原型-19.png"), color: "#4f46e5", desc: "催化一切转化的宇宙风暴者，以能量涤荡旧模式。对应蓝风暴，是催化与衍生的化身。" },
    { id: 20, totemIdx: 19, name: "宇宙太阳", en: "Cosmic Sun", img: getAssetUrl("/assets/mayan/archetype/星际原型-20.png"), color: "#f97316", desc: "以无条件之爱照耀万物的宇宙之光，是所有图腾的归宿与起点。对应黄太阳，是开悟与圆满的象征。" },
];

// ─── 7 个等离子体 ─────────────────────────────────────────────────────────
const PLASMAS = [
    { id: 1, name: "DALI", nameCN: "达利", img: getAssetUrl("/assets/mayan/plasma/01-DALI.png"), color: "#ef4444", chakra: "顶轮", quality: "感知", affirmation: "我的名字是达利，我呼唤时间，时间便是艺术。" },
    { id: 2, name: "SELI", nameCN: "塞利", img: getAssetUrl("/assets/mayan/plasma/02-SELI.png"), color: "#f97316", chakra: "根轮", quality: "流动", affirmation: "我的名字是塞利，我汇聚光，光便是生命。" },
    { id: 3, name: "GAMMA", nameCN: "伽玛", img: getAssetUrl("/assets/mayan/plasma/03-GAMMA.png"), color: "#eab308", chakra: "眉心调和", affirmation: "我的名字是伽玛，我完成我的艺术，艺术便是统一。" },
    { id: 4, name: "KALI", nameCN: "卡利", img: getAssetUrl("/assets/mayan/plasma/04-KALI.png"), color: "#22c55e", chakra: "脐轮", quality: "建立", affirmation: "我的名字是卡利，我催化，催化便是我的力量。" },
    { id: 5, name: "ALPHA", nameCN: "阿尔法", img: getAssetUrl("/assets/mayan/plasma/05-ALPHA.png"), color: "#3b82f6", chakra: "喉轮", quality: "释放", affirmation: "我的名字是阿尔法，我释放，释放便是我的喜悦。" },
    { id: 6, name: "LIMI", nameCN: "丽米", img: getAssetUrl("/assets/mayan/plasma/06-LIMI.png"), color: "#8b5cf6", chakra: "胃轮", quality: "净化", affirmation: "我的名字是丽米，我消费，消费便是我的功课。" },
    { id: 7, name: "SILIO", nameCN: "西里奥", img: getAssetUrl("/assets/mayan/plasma/07-SILIO.png"), color: "#ec4899", chakra: "心轮", quality: "放射", affirmation: "我的名字是西里奥，我放射，放射便是我的服务。" },
];
// 根据13月亮历月份第几天计算等离子体（每7天一循环）
const getPlasmaIdx = (moonDay: number) => ((moonDay - 1) % 7);

// ─── 5 个生命城堡 ─────────────────────────────────────────────────────────
const CASTLES = [
    { id: 1, name: "红城堡", color: "#ef4444", bg: "from-red-900/20", waves: [1, 2, 3, 4], theme: "种植·播种意图", desc: "一切从这里开始。红城堡是播种意图的时间，是银河旋转木马的第一圈。包含：龙波·风波·夜波·种子波。" },
    { id: 2, name: "白城堡", color: "#94a3b8", bg: "from-slate-700/20", waves: [5, 6, 7, 8], theme: "精炼·穿越洞见", desc: "精炼与净化的白城堡。以纯净之心穿越挑战，深入洞见。包含：蛇波·桥波·手波·星波。" },
    { id: 3, name: "蓝城堡", color: "#3b82f6", bg: "from-blue-900/20", waves: [9, 10, 11, 12], theme: "转化·炼金蜕变", desc: "转化与炼金的蓝城堡。深度蜕变在此展开，以智慧整合过去与未来。包含：月波·狗波·猴波·人波。" },
    { id: 4, name: "黄城堡", color: "#f59e0b", bg: "from-amber-900/20", waves: [13, 14, 15, 16], theme: "成熟·收获显化", desc: "成熟与收获的黄城堡。意图已完全显化，体验并感谢丰盛。包含：行者波·巫师波·鹰波·战士波。" },
    { id: 5, name: "绿城堡", color: "#22c55e", bg: "from-green-900/20", waves: [17, 18, 19, 20], theme: "整合·超越重生", desc: "整合与超越的绿色核心城堡。以超越之心完成整合，迎接全新开始。包含：地球波·镜波·风暴波·太阳波。" },
];
const getCastleId = (kinNum: number) => Math.ceil(kinNum / 52);

// ─── 谐波与对等/镜像印记 ─────────────────────────────────────────────────────
const getHarmonic = (kinNum: number) => Math.ceil(kinNum / 4);
const getDayInHarmonic = (kinNum: number) => ((kinNum - 1) % 4) + 1;
// 对等印记：与目标Kin调性相同，图腾totemIdx相加=19（0-indexed），即(19 - totemIdx)%20
const getAntipodeKin = (kinNum: number) => {
    const toneNum = ((kinNum - 1) % 13) + 1;
    const totemIdx = (kinNum - 1) % 20;
    const antipodeTotemIdx = (totemIdx + 10) % 20;
    // 对于Kin计算，Kin = ((toneNum-1)*20 + totemIdx + 1) in Tzolkin grid
    // 简单：antipodeKinNum = kinNum + 10*13 - 10，确保在1-260
    // 实际：antipode totemIdx在260天周期中的正确Kin
    const antipodeKin = ((kinNum - 1 + 130) % 260) + 1;
    return { kin: antipodeKin, tone: toneNum, totemIdx: antipodeTotemIdx };
};
// 镜像印记（Occult Partner）：调性相加=14，图腾相加=21（1-indexed）
const getOccultKin = (kinNum: number) => {
    const toneNum = ((kinNum - 1) % 13) + 1;
    const totemIdx = (kinNum - 1) % 20;
    const occultTone = 14 - toneNum;
    const occultTotemIdx = (20 - totemIdx) % 20;
    return { kin: 0, tone: occultTone, totemIdx: occultTotemIdx };
};

// Dreamspell Kin 计算（独立函数，供生日查询使用）
const calcDreamspellKin = (y: number, m: number, d: number): number => {
    if (m === 2 && d === 29) d = 28;
    const pDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const daysCurrent = y * 365 + pDays[m - 1] + d;
    const daysBase = 2012 * 365 + pDays[11] + 21;
    let kin = (207 + daysCurrent - daysBase) % 260;
    if (kin <= 0) kin += 260;
    return kin;
};

/**
 * PSI（行星守护者 Planetary Spirit Intake）计算
 * 原理：13月亮历全年364天，分为52个7日赫普塔（Heptad）
 *        52年庅 × 每帪5个Kin色阶 = 260Kin
 * 每个日的PSI：找到属于哪个赫普塔 → 色阶起始Kin → 当天在7日内的偏移
 */
const calcPSIKin = (moon: number, day: number): number => {
    // 周内7天映射到5Kin色阶的偏移表 (0-indexed周内天)
    const heptadOffsets = [0, 1, 2, 3, 4, 3, 1];
    const heptadInMoon = Math.ceil(day / 7);         // 1-4
    const heptadOfYear = (moon - 1) * 4 + heptadInMoon; // 1-52
    const chromaticStart = (heptadOfYear - 1) * 5 + 1;  // 1,6,11,...,256
    const dayOfWeek = ((day - 1) % 7);                   // 0-6
    const offset = heptadOffsets[dayOfWeek];
    let psiKin = chromaticStart + offset;
    if (psiKin > 260) psiKin = ((psiKin - 1) % 260) + 1;
    return psiKin;
};

// Helper Component for Oracle Cross Node
const OracleNode = ({ label, tone, totemIdx, color, isCenter = false }: { label: string, tone: number, totemIdx: number, color: string, isCenter?: boolean }) => (
    <div className={`flex flex-col items-center space-y-2 ${isCenter ? 'z-10 scale-125 mx-4 sm:mx-8' : 'w-24 shrink-0'}`}>
        {!isCenter && <div className={`text-[11px] uppercase font-bold tracking-wider ${color} mb-1 drop-shadow`}>{label}</div>}
        <div className={`glass-panel p-2 flex flex-col items-center justify-center relative bg-black/50 ${isCenter ? 'border-rose-500/50 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'border-white/10 rounded-lg'}`}>
            <div className={`text-stone-300 shrink-0 transform origin-bottom ${isCenter ? 'mb-2 scale-90' : 'mb-1 scale-75'}`}>
                <MayanNumber num={tone} />
            </div>
            <img src={TOTEMS[totemIdx]?.img} alt={TOTEMS[totemIdx]?.name} className={`${isCenter ? 'w-16 h-16' : 'w-12 h-12'} object-contain rounded drop-shadow-md`} />
        </div>
        <div className={`text-center leading-tight ${isCenter ? 'font-bold text-rose-300 text-sm mt-3' : 'text-[10px] sm:text-xs text-stone-200 mt-2 break-words'}`}>
            {TONES[tone - 1]?.name}·{TOTEMS[totemIdx]?.name}
            {isCenter && <div className="text-[10px] text-rose-400/80 mt-1 uppercase">核心 / 命运</div>}
        </div>
    </div>
);

export const MayanPage: React.FC = () => {
    // 使用状态来支持任意日期查询
    const getLocalTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const [selectedDateStr, setSelectedDateStr] = useState<string>(getLocalTodayString());

    // 农历状态
    const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
    const [lunarYMD, setLunarYMD] = useState(() => {
        const t = Lunar.fromDate(new Date());
        return { y: t.getYear(), m: t.getMonth(), d: t.getDay() };
    });

    // 解析用户选择的日期进行计算，并做非法值防崩保护
    let targetDate = new Date();
    let isValidDate = true;
    if (calendarType === 'solar') {
        const parsedDate = new Date(selectedDateStr);
        if (!isNaN(parsedDate.getTime())) {
            targetDate = parsedDate;
        } else {
            isValidDate = false;
        }
    } else {
        try {
            // 解析农历换算西历 (这里默认普通月份，不考虑精细的闰月拾取，只为便捷检索)
            const lunar = Lunar.fromYmd(lunarYMD.y, lunarYMD.m, lunarYMD.d);
            const solar = lunar.getSolar();
            targetDate = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
            isValidDate = !isNaN(targetDate.getTime());
        } catch {
            isValidDate = false;
        }
    }

    // 如果输入的日期残缺（比如正在退格或者不合法的农历日），则暂且使用系统今日兜底
    const finalDate = isValidDate ? targetDate : new Date();
    const targetData = getCalendarData(finalDate);
    const { mayan } = targetData;

    // 回到今日并重置所有查询状态
    const handleResetToday = () => {
        setSelectedDateStr(getLocalTodayString());
        setCalendarType('solar');
        // 同步今日农历
        const tLunar = Lunar.fromDate(new Date());
        setLunarYMD({ y: tLunar.getYear(), m: tLunar.getMonth(), d: tLunar.getDay() });
        // 重置局部交互状态
        setShowLifeCastle(false);
        setExpandedWavespellId(null);
        setBirthYear('');
    }

    const [selectedTotem, setSelectedTotem] = useState<typeof TOTEMS[0] | null>(null);
    const [selectedTone, setSelectedTone] = useState<typeof TONES[0] | null>(null);
    const [view, setView] = useState<'today' | 'totems' | 'tones' | 'intro' | 'wavespells' | 'castle' | 'plasma' | 'archetype' | 'birthday'>('today');

    // 52年生命城堡定位状态
    const [birthYear, setBirthYear] = useState<string>('');
    const [showLifeCastle, setShowLifeCastle] = useState(false);
    const [expandedWavespellId, setExpandedWavespellId] = useState<number | null>(null);
    const [showKinPicker, setShowKinPicker] = useState(false);

    // 生日印记查询
    const [bdStr, setBdStr] = useState('');
    const [bdResult, setBdResult] = useState<{ kin: number; tone: number; totemIdx: number } | null>(null);
    const handleBdQuery = () => {
        if (!bdStr) return;
        const d = new Date(bdStr);
        if (isNaN(d.getTime())) return;
        const kin = calcDreamspellKin(d.getFullYear(), d.getMonth() + 1, d.getDate());
        const tone = ((kin - 1) % 13) + 1;
        const totemIdx = (kin - 1) % 20;
        setBdResult({ kin, tone, totemIdx });
    };

    // 跳转到波符详情的辅助函数
    const gotoWavespell = (wsTotemIdx: number) => {
        const ws = WAVESPELLS.find(w => w.totemIdx === wsTotemIdx);
        if (ws) {
            setView('wavespells');
            setExpandedWavespellId(ws.id);
        }
    };

    // 日期导航辅助函数
    const navigateDay = (delta: number) => {
        const cur = new Date(selectedDateStr);
        if (isNaN(cur.getTime())) return;
        cur.setDate(cur.getDate() + delta);
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, '0');
        const dd = String(cur.getDate()).padStart(2, '0');
        setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
    };

    // 跳转到指定Kin对应的最近日期
    const jumpToKin = (targetKin: number) => {
        if (targetKin < 1 || targetKin > 260) return;
        const curKin = mayan.kinNum; // 当前查询日期的Kin
        const diff = ((targetKin - curKin) % 260 + 260) % 260;
        // 以当前查询日期为基准，而不是 new Date()（真实今天）
        const baseDate = new Date(selectedDateStr);
        baseDate.setDate(baseDate.getDate() + diff - (diff > 130 ? 260 : 0));
        const yyyy = baseDate.getFullYear();
        const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
        const dd = String(baseDate.getDate()).padStart(2, '0');
        setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
        setShowKinPicker(false);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 pt-2">
                <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl">🏛️</span>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-pink-300 to-purple-400">
                        玛雅历法罗盘
                    </h1>
                </div>
                <p className="text-stone-400 text-sm">时间法则 · 13月亮历 · 共时性探索</p>
            </motion.div>

            {/* Nav Tabs */}
            <div className="flex gap-2 flex-wrap justify-center">
                {[
                    { key: 'today', label: '🧭 印记查询' },
                    { key: 'intro', label: '📜 历法介绍' },
                    { key: 'totems', label: '🐊 图腾原型' },
                    { key: 'tones', label: '🎵 13调性' },
                    { key: 'wavespells', label: '🌊 20波符' },
                    { key: 'castle', label: '🏰 生命城堡' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setView(tab.key as typeof view)}
                        className={`px-4 py-2 rounded-full text-sm transition-all border ${view === tab.key
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 font-bold'
                            : 'bg-white/5 text-stone-400 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* 能量查询盘 */}
                {view === 'today' && (
                    <motion.div key="today" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                        {/* 日期选择器控制台 */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 bg-stone-900/50 p-4 rounded-xl border border-white/5">
                            <label className="text-stone-300 font-bold flex items-center gap-2">
                                <span>📅</span>
                                <select
                                    className="bg-transparent border-none outline-none text-rose-300 font-bold cursor-pointer hover:bg-white/5 p-1 rounded transition-colors"
                                    value={calendarType}
                                    onChange={(e) => setCalendarType(e.target.value as 'solar' | 'lunar')}
                                >
                                    <option value="solar" className="bg-stone-800">选择查询西历日期：</option>
                                    <option value="lunar" className="bg-stone-800">选择查询农历日期：</option>
                                </select>
                            </label>

                            {calendarType === 'solar' ? (
                                <input
                                    type="date"
                                    value={selectedDateStr}
                                    onChange={(e) => setSelectedDateStr(e.target.value)}
                                    className="bg-black/40 border border-white/20 text-stone-200 rounded-md px-4 py-2 focus:outline-none focus:border-rose-500/80 transition-colors"
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number" value={lunarYMD.y} onChange={e => setLunarYMD({ ...lunarYMD, y: parseInt(e.target.value) || 0 })}
                                        className="bg-black/40 border border-white/20 text-stone-200 rounded-md px-2 py-2 w-20 text-center focus:outline-none focus:border-rose-500/80 transition-colors"
                                    /> <span className="text-stone-400 text-sm font-bold">年</span>
                                    <input
                                        type="number" value={lunarYMD.m} onChange={e => setLunarYMD({ ...lunarYMD, m: parseInt(e.target.value) || 0 })}
                                        className="bg-black/40 border border-white/20 text-stone-200 rounded-md px-2 py-2 w-16 text-center focus:outline-none focus:border-rose-500/80 transition-colors"
                                    /> <span className="text-stone-400 text-sm font-bold">月</span>
                                    <input
                                        type="number" value={lunarYMD.d} onChange={e => setLunarYMD({ ...lunarYMD, d: parseInt(e.target.value) || 0 })}
                                        className="bg-black/40 border border-white/20 text-stone-200 rounded-md px-2 py-2 w-16 text-center focus:outline-none focus:border-rose-500/80 transition-colors"
                                    /> <span className="text-stone-400 text-sm font-bold">日</span>
                                </div>
                            )}

                            {(selectedDateStr !== getLocalTodayString() || calendarType !== 'solar') && (
                                <button
                                    onClick={handleResetToday}
                                    className="text-xs px-4 py-2 bg-rose-500/20 text-rose-300 rounded hover:bg-rose-500/30 transition-colors font-bold"
                                >
                                    回到今日
                                </button>
                            )}
                        </div>

                        {/* 星系印记报告头部与 13月亮历坐标 */}
                        <div className="text-center space-y-4 py-4">
                            {/* 十三月亮历法 & 提示 */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-stone-300 font-bold mb-2 text-lg">
                                <span className="text-amber-300">🌙 十三月亮历定点：</span>
                                {mayan.thirteenMoons.isHunabKu0 ? (
                                    <span className="bg-white/20 px-4 py-1 rounded-full text-white">0 Hunab Ku (银河中心·特殊跨越日)</span>
                                ) : mayan.thirteenMoons.isDayOutOfTime ? (
                                    <span className="bg-rose-500/80 px-4 py-1 rounded-full text-white drop-shadow-md">无时间日 (Day Out of Time ✨) </span>
                                ) : (
                                    <span className="bg-stone-800/80 px-4 py-1 rounded-full border border-stone-600">
                                        第 {mayan.thirteenMoons.moon} 月 · {mayan.thirteenMoons.moonNameCN} - 第 {mayan.thirteenMoons.day} 天
                                    </span>
                                )}
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-purple-400 drop-shadow-sm pb-2">
                                {mayan.tzolkinCN}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center gap-2 text-stone-300 text-sm">
                                {/* Kin号 — 可点击展开260 Kin选择面板 */}
                                <button
                                    onClick={() => setShowKinPicker(v => !v)}
                                    className={`px-3 py-1 rounded-full border font-mono shadow-inner transition-all ${showKinPicker ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-white/10 border-white/5 text-stone-300 hover:bg-white/20'}`}
                                    title="点击自由选择260个银河印记"
                                >
                                    ⭐ Kin {mayan.kinNum} {showKinPicker ? '▲' : '▼'}
                                </button>
                                <button
                                    onClick={() => gotoWavespell(mayan.wavespell.totemIdx)}
                                    className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full border border-purple-500/20 shadow-inner hover:bg-purple-500/40 hover:border-purple-400/50 transition-all cursor-pointer active:scale-95"
                                    title="点击查看波符详情与13问"
                                >
                                    🌊 位于「{mayan.wavespell.nameCN}」第 {mayan.toneNum} 天 →
                                </button>
                                <span className="bg-sky-500/20 text-sky-200 px-3 py-1 rounded-full border border-sky-500/20 shadow-inner">
                                    🌖 月相：{mayan.moonPhaseCN}
                                </span>
                            </div>

                            {/* 260 Kin 选择面板 — 图腾+音调 双下拉 */}
                            <AnimatePresence>
                                {showKinPicker && (() => {
                                    const tzFullNames = ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界桥", "蓝手", "黄星星", "红月", "白狗", "蓝猴", "黄人", "红天行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"];
                                    const toneFullNames = ["磁性(1)", "月亮(2)", "电力(3)", "自我存在(4)", "超频(5)", "韵律(6)", "共振(7)", "银河(8)", "太阳(9)", "行星(10)", "光谱(11)", "水晶(12)", "宇宙(13)"];
                                    // 从当前Kin算出图腾和音调
                                    const curTone = ((mayan.kinNum - 1) % 13);
                                    const curTotem = (mayan.kinNum - 1) % 20;
                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-3 p-4 glass-panel border border-rose-500/20 rounded-xl space-y-3">
                                                <div className="text-xs text-stone-500 text-center">选择图腾 + 音调，直接跳转对应Kin · 当前 Kin {mayan.kinNum}</div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] text-stone-500 block mb-1">🐊 图腾 (1-20)</label>
                                                        <select
                                                            className="w-full bg-stone-900 border border-white/10 text-stone-200 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-rose-500/60"
                                                            defaultValue={curTotem}
                                                            id="kin-totem-select"
                                                        >
                                                            {tzFullNames.map((n, i) => (
                                                                <option key={i} value={i} className="bg-stone-900">{i + 1}. {n}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-stone-500 block mb-1">🎵 音调 (1-13)</label>
                                                        <select
                                                            className="w-full bg-stone-900 border border-white/10 text-stone-200 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-rose-500/60"
                                                            defaultValue={curTone}
                                                            id="kin-tone-select"
                                                        >
                                                            {toneFullNames.map((n, i) => (
                                                                <option key={i} value={i} className="bg-stone-900">{n}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const totemSel = document.getElementById('kin-totem-select') as HTMLSelectElement;
                                                        const toneSel = document.getElementById('kin-tone-select') as HTMLSelectElement;
                                                        const totemIdx = parseInt(totemSel.value);
                                                        const toneIdx = parseInt(toneSel.value);
                                                        // Kin = tone + totemIdx * 13（取260以内最小正整数）
                                                        let kin = (toneIdx + 1) + totemIdx * 13;
                                                        // 实际上Kin1-260的计算：每13个音调组成一波，图腾顺序偏移
                                                        // Kin号 = tone + (totemIdx * 13) mod 260, 校正
                                                        kin = ((toneIdx + totemIdx * 13) % 260) + 1;
                                                        jumpToKin(kin);
                                                    }}
                                                    className="w-full py-2 bg-rose-500/30 text-rose-200 rounded-lg border border-rose-500/40 hover:bg-rose-500/50 transition-all font-bold text-sm"
                                                >
                                                    跳转到该 Kin
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-stone-500 shrink-0">或直接输入 Kin:</span>
                                                    <input
                                                        type="number" min={1} max={260}
                                                        placeholder="1-260"
                                                        className="flex-1 bg-stone-900 border border-white/10 text-stone-200 text-sm rounded px-2 py-1 focus:outline-none focus:border-rose-500/60"
                                                        onKeyDown={(e) => { if (e.key === 'Enter') jumpToKin(parseInt((e.target as HTMLInputElement).value)); }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            const inp = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                                            jumpToKin(parseInt(inp.value));
                                                        }}
                                                        className="text-xs px-3 py-1 bg-white/10 rounded border border-white/15 hover:bg-white/20 text-stone-300 transition-all"
                                                    >跳转</button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })()}
                            </AnimatePresence>
                        </div>

                        {/* 神谕十字盘 Oracle Cross */}
                        <div className="relative glass-panel p-8 border border-rose-500/20 rounded-2xl bg-gradient-to-b from-stone-900/80 to-transparent overflow-hidden">
                            {/* 背景装饰纹理 */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center blur-sm">
                                <img src={TOTEMS[mayan.totemIdx]?.img} alt="bg" className="w-[120%] h-[120%] object-cover opacity-30 mix-blend-overlay" />
                            </div>
                            {/* 上/下一天导航 */}
                            <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4 z-20">
                                <button
                                    onClick={() => navigateDay(-1)}
                                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-200 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-full transition-all active:scale-95"
                                    title="上一天"
                                >
                                    ← 上一天
                                </button>
                                <span className="text-[10px] text-stone-600 font-mono">{selectedDateStr}</span>
                                <button
                                    onClick={() => navigateDay(1)}
                                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-200 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-full transition-all active:scale-95"
                                    title="下一天"
                                >
                                    下一天 →
                                </button>
                            </div>

                            <div className="relative z-10 flex flex-col items-center justify-center">
                                {/* Guide (Top) */}
                                <OracleNode label="指引 (指导力)" tone={mayan.oracle.guide.tone} totemIdx={mayan.oracle.guide.totemIdx} color="text-stone-200" />

                                <div className="flex items-center justify-center w-full gap-2 sm:gap-8 my-10 sm:my-14">
                                    {/* Antipode (Left) */}
                                    <OracleNode label="挑战/拓展" tone={mayan.oracle.antipode.tone} totemIdx={mayan.oracle.antipode.totemIdx} color="text-indigo-300" />

                                    {/* Destiny (Center) */}
                                    <OracleNode label="命运印记" tone={mayan.oracle.destiny.tone} totemIdx={mayan.oracle.destiny.totemIdx} color="text-rose-400" isCenter />

                                    {/* Analog (Right) */}
                                    <OracleNode label="支持 (互补力)" tone={mayan.oracle.analog.tone} totemIdx={mayan.oracle.analog.totemIdx} color="text-amber-300" />
                                </div>

                                {/* Occult (Bottom) */}
                                <OracleNode label="隐藏/推动" tone={mayan.oracle.occult.tone} totemIdx={mayan.oracle.occult.totemIdx} color="text-emerald-300" />
                            </div>
                        </div>

                        {/* 补充：长计历等基础历法条列 */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="glass-panel p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent text-center space-y-2">
                                <div className="text-xs text-amber-500/80 uppercase tracking-widest font-bold">哈布历 · HAAB</div>
                                <div className="text-xl font-bold text-amber-300">{mayan.haabCN}</div>
                                <div className="text-sm text-stone-500">{mayan.haab}</div>
                            </div>
                            <div className="glass-panel p-6 border border-stone-500/30 bg-gradient-to-br from-stone-500/5 to-transparent text-center space-y-2">
                                <div className="text-xs text-stone-500 uppercase tracking-widest font-bold">长计历 · LONG COUNT</div>
                                <div className="text-xl font-bold font-mono text-stone-300">{mayan.longCount}</div>
                                <div className="text-sm text-stone-500">人类文明的宏大坐标</div>
                            </div>
                        </div>

                        {/* 今日解读 */}
                        <div className="glass-panel p-6 border border-pink-500/20 space-y-3">
                            <div className="text-sm text-pink-400 uppercase tracking-wider font-bold">✨ 今日卓尔金码 · 能量解读</div>
                            <div className="flex items-center gap-3">
                                <div className="text-2xl font-bold text-stone-100">{mayan.tzolkinCN}</div>
                                {TOTEMS[mayan.totemIdx]?.family && (
                                    <span className="px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300">家族：{TOTEMS[mayan.totemIdx].family}</span>
                                )}
                            </div>
                            <div className="text-stone-400 leading-relaxed text-sm">
                                今日是银河音调历（卓尔金历）的第 <span className="text-pink-400 font-bold">{mayan.toneNum}</span> 音调 ·
                                <span className="text-rose-400 font-bold">「{mayan.toneNameCN}」</span>，
                                图腾为 <span className="text-amber-400 font-bold">「{mayan.tzolkinNameCN}」</span>。
                                <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                                        <span>🎵 {mayan.toneNameCN}调性 · 第 {mayan.toneNum} 段频率</span>
                                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[9px]">对应关节：{TONES[mayan.toneNum - 1]?.joint}</span>
                                    </div>
                                    <p className="text-stone-400 text-sm leading-relaxed">{TONES[mayan.toneNum - 1]?.desc}</p>
                                    <div className="pt-2 border-t border-white/5 text-[11px] italic text-stone-500 flex gap-2">
                                        <span className="text-rose-500/50 not-italic">🧘 静心：</span>
                                        “{TONES[mayan.toneNum - 1]?.meditation}”
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ⚡ 7等离子体 — 全部展示，点击跳转对应日期，联动整页 */}
                        {!mayan.thirteenMoons.isDayOutOfTime && !mayan.thirteenMoons.isHunabKu0 && (() => {
                            const todayPIdx = getPlasmaIdx(mayan.thirteenMoons.day);
                            const activePlasma = PLASMAS[todayPIdx];
                            // 跳转到目标等离子体对应的最近日期
                            const jumpToPlasma = (targetPIdx: number) => {
                                if (targetPIdx === todayPIdx) return;
                                const curDay = mayan.thirteenMoons.day;
                                // 每个等离子体对应 28天月中的天数：idx+1, idx+8, idx+15, idx+22
                                const candidates = [targetPIdx + 1, targetPIdx + 8, targetPIdx + 15, targetPIdx + 22];
                                let bestDiff = Infinity;
                                for (const c of candidates) {
                                    const d = c - curDay;
                                    if (Math.abs(d) < Math.abs(bestDiff)) bestDiff = d;
                                }
                                navigateDay(bestDiff);
                            };
                            return (
                                <div className="glass-panel p-5 border border-cyan-500/20 rounded-xl space-y-4">
                                    <div className="text-xs text-cyan-400 uppercase tracking-widest font-bold">
                                        ⚡ 7等离子体 <span style={{ color: activePlasma.color }}>· 今日：{activePlasma.nameCN}</span>
                                        <span className="ml-2 text-stone-600 font-normal normal-case tracking-normal">· 点击其他等离子体跳转对应日</span>
                                    </div>
                                    {/* 当前等离子体详情 */}
                                    <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: activePlasma.color + '18', border: `1px solid ${activePlasma.color}50` }}>
                                        <img src={activePlasma.img} alt={activePlasma.nameCN} className="w-14 h-14 object-contain rounded-lg shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-lg text-stone-200">{activePlasma.nameCN} <span className="text-sm font-normal text-stone-500">({activePlasma.name})</span></div>
                                            <div className="text-xs text-stone-400 mt-0.5">{activePlasma.chakra} · {activePlasma.quality}</div>
                                            <p className="text-stone-400 text-xs italic mt-1">"{activePlasma.affirmation}"</p>
                                        </div>
                                    </div>
                                    {/* 7个等离子体点击跳转 */}
                                    <div className="grid grid-cols-7 gap-1.5">
                                        {PLASMAS.map((plasma, idx) => {
                                            const isActive = idx === todayPIdx;
                                            return (
                                                <button
                                                    key={plasma.id}
                                                    onClick={() => jumpToPlasma(idx)}
                                                    disabled={isActive}
                                                    className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all ${isActive
                                                        ? 'ring-1 cursor-default'
                                                        : 'border-white/10 bg-black/20 opacity-60 hover:opacity-90 cursor-pointer hover:scale-105 active:scale-95'
                                                        }`}
                                                    style={isActive ? { borderColor: plasma.color + '80', backgroundColor: plasma.color + '18', boxShadow: `0 0 8px ${plasma.color}40` } : {}}
                                                    title={isActive ? `今日（${plasma.nameCN}）` : `跳至 ${plasma.nameCN} 对应日`}
                                                >
                                                    <img src={plasma.img} alt={plasma.nameCN} className="w-8 h-8 object-contain rounded mb-0.5 mx-auto"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                    <div className="text-[9px] font-bold leading-tight truncate w-full text-center" style={{ color: isActive ? plasma.color : '#78716c' }}>{plasma.nameCN}</div>
                                                    <div className="text-[8px] text-stone-600 leading-tight">{plasma.name}</div>
                                                    {isActive && <div className="text-[7px] mt-0.5 rounded-full px-1" style={{ background: plasma.color + '40', color: plasma.color }}>今日</div>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}



                        {/* 🌅 今日能量行动建议 */}
                        {(() => {
                            const totem = TOTEMS[mayan.totemIdx];
                            const tone = TONES[mayan.toneNum - 1];
                            // 图腾对应的适合行动建议（基于element/power/keyword）
                            const totemActions: Record<string, string[]> = {
                                "水": ["进行情感梳理或日记书写", "与信任的人深度交流", "照顾自己或他人的身体需求"],
                                "气": ["分享你的想法与创意", "学习或阅读新知识", "进行气息练习或冥想"],
                                "土": ["启动一个计划或项目的第一步", "整理物品或清洁空间", "深呼吸，感受脚踏实地的稳定感"],
                                "火": ["采取大胆行动，勇于开口", "释放内在的热情与表达欲", "锻炼身体，激活生命力"],
                                "天": ["拓展视野，探索未知", "做一件突破舒适区的小事", "仰望星空或问自己一个重大问题"],
                            };
                            const totemTips = totemActions[totem?.element ?? "土"] ?? totemActions["土"];
                            // 调性对应的提示语
                            const toneTips: Record<number, string> = {
                                1: "今天适合设定一个清晰的意图或目标，写下来。",
                                2: "注意对立面——阴与阳、给与取。今天的功课在于平衡。",
                                3: "激活！今天的能量充满推进力，适合启动停滞已久的事情。",
                                4: "今天适合做计划、整理结构、给事情定义边界与形式。",
                                5: "向外辐射你的能量，带动他人，今天是展现领导力的好时机。",
                                6: "检视你生活中的节奏是否和谐，适合调整作息或工作习惯。",
                                7: "聆听内在的声音和灵感，冥想或独处会有意外收获。",
                                8: "以诚信行动，让你的内在信念和外在行为保持一致。",
                                9: "把你的意图化为具体的行动，今天有强大的显化能量。",
                                10: "把一件事做到完美，今天的能量支持细节打磨与精益求精。",
                                11: "放下不再适合的东西——旧习惯、旧关系或旧观念。",
                                12: "参与团队合作或集体活动，贡献自己的力量。",
                                13: "超越日常的边界，允许自己做一件\"无用但美丽\"的事。",
                            };
                            return (
                                <div className="glass-panel p-5 border border-amber-500/20 bg-amber-500/5 rounded-xl space-y-3">
                                    <div className="text-xs text-amber-400 uppercase tracking-widest font-bold">🌅 今日能量行动建议</div>
                                    <div className="text-xs text-stone-500">
                                        基于今日图腾
                                        <span className="font-bold mx-1" style={{ color: totem?.color }}>{totem?.name}</span>
                                        （{totem?.element}元素·{totem?.power}）×
                                        调性
                                        <span className="font-bold mx-1 text-amber-400">{tone?.name}</span>
                                        综合推算
                                    </div>
                                    {/* 3条来自图腾的行动建议 */}
                                    <div className="space-y-2">
                                        {totemTips.map((tip, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="text-amber-500 shrink-0 text-sm mt-0.5">{['✦', '✦', '✦'][i]}</span>
                                                <span className="text-stone-300 text-sm leading-relaxed">{tip}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* 调性专属提醒 */}
                                    <div className="mt-2 p-3 rounded-lg bg-white/5 border border-amber-500/10 text-xs text-amber-200 leading-relaxed">
                                        <span className="font-bold text-amber-400">【{tone?.name}调性提醒】</span>
                                        {toneTips[mayan.toneNum] ?? tone?.desc}
                                    </div>
                                    {/* 今日关键词 */}
                                    <div className="flex gap-2 flex-wrap mt-1">
                                        {(totem?.keyword ?? '').split('・').map((kw, i) => (
                                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full border"
                                                style={{ borderColor: (totem?.color ?? '#f59e0b') + '60', color: totem?.color ?? '#f59e0b', background: (totem?.color ?? '#f59e0b') + '15' }}>
                                                {kw}
                                            </span>
                                        ))}
                                        {(tone?.keyword ?? '').split('·').map((kw, i) => (
                                            <span key={`t${i}`} className="text-[11px] px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-400 bg-amber-500/10">
                                                {kw.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 🎂 当前查询日期的银河印记解读（与主查询联动，已无需再次输入） */}
                        {(() => {
                            const kin = mayan.kinNum;
                            const tone = mayan.toneNum;
                            const totemIdx = mayan.totemIdx;
                            const totem = TOTEMS[totemIdx];
                            const arch = ARCHETYPES[totemIdx];
                            const bdAntipode = getAntipodeKin(kin);
                            const bdOccult = getOccultKin(kin);
                            const tzNames = ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界桥", "蓝手", "黄星星", "红月", "白狗", "蓝猴", "黄人", "红天行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"];
                            const toneNames = ["磁性", "月亮", "电力", "自我存在", "超频", "韵律", "共振", "银河", "太阳", "行星", "光谱", "水晶", "宇宙"];
                            const wsFixed = ((kin - tone) % 20 + 20) % 20;
                            const wsInfo = WAVESPELLS.find(w => w.totemIdx === wsFixed);
                            return (
                                <div className="glass-panel p-5 border border-pink-500/20 rounded-xl space-y-3">
                                    <div className="text-xs text-pink-400 uppercase tracking-widest font-bold">🎂 印记解读</div>
                                    <div className="flex gap-4 items-center">
                                        <img src={totem?.img} alt={totem?.name} className="w-16 h-16 object-contain rounded-xl ring-1 ring-white/10 shrink-0" />
                                        <div>
                                            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-300 to-purple-400">
                                                Kin {kin} · {toneNames[tone - 1]}{totem?.name}
                                            </div>
                                            <div className="flex gap-2 flex-wrap mb-2">
                                                <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-[10px] text-stone-300">元素：{totem?.element}</span>
                                                <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-[10px] text-stone-300">方位：{totem?.direction}</span>
                                                <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-[10px] text-stone-300">力量：{totem?.power}</span>
                                                {totem?.family && <span className="px-2 py-0.5 rounded-sm bg-stone-500/10 border border-stone-500/20 text-[10px] text-stone-400">家族：{totem.family}</span>}
                                            </div>
                                            <div className="text-stone-400 text-xs mt-1 leading-relaxed space-y-2">
                                                <p>{totem?.desc}</p>
                                                <div className="p-2 rounded bg-black/20 border border-white/5 text-[10px]">
                                                    <div className="text-purple-300 font-bold mb-1">【{toneNames[tone - 1]}调性 · {TONES[tone - 1]?.joint}】</div>
                                                    <p className="text-stone-500 italic">“{TONES[tone - 1]?.meditation}”</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {arch && (
                                            <div className="glass-panel p-2 border rounded-lg text-center" style={{ borderColor: arch.color + '50' }}>
                                                <img src={arch.img} alt={arch.name} className="w-10 h-10 object-contain mx-auto rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                <div className="text-[10px] mt-0.5 font-bold" style={{ color: arch.color }}>{arch.name}</div>
                                                <div className="text-[9px] text-stone-500">星际原型</div>
                                            </div>
                                        )}
                                        {wsInfo && (
                                            <div className="glass-panel p-2 border rounded-lg text-center" style={{ borderColor: wsInfo.color + '50' }}>
                                                <img src={wsInfo.img} alt={wsInfo.name} className="w-10 h-10 object-contain mx-auto rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                <div className="text-[10px] mt-0.5 font-bold" style={{ color: wsInfo.color }}>{wsInfo.name}</div>
                                                <div className="text-[9px] text-stone-500">{wsInfo.theme}</div>
                                            </div>
                                        )}
                                        <div className="glass-panel p-2 border border-indigo-500/20 rounded-lg text-center">
                                            <img src={TOTEMS[bdAntipode.totemIdx]?.img} alt="" className="w-10 h-10 object-contain mx-auto rounded" />
                                            <div className="text-[10px] mt-0.5 font-bold text-indigo-300">{toneNames[bdAntipode.tone - 1]}·{tzNames[bdAntipode.totemIdx]}</div>
                                            <div className="text-[9px] text-stone-500">对等印记</div>
                                        </div>
                                        <div className="glass-panel p-2 border border-emerald-500/20 rounded-lg text-center">
                                            <img src={TOTEMS[bdOccult.totemIdx]?.img} alt="" className="w-10 h-10 object-contain mx-auto rounded" />
                                            <div className="text-[10px] mt-0.5 font-bold text-emerald-300">{toneNames[bdOccult.tone - 1]}·{tzNames[bdOccult.totemIdx]}</div>
                                            <div className="text-[9px] text-stone-500">镜像印记</div>
                                        </div>
                                    </div>
                                    {/* 🌐 PSI 行星守护者 */}
                                    {!mayan.thirteenMoons.isDayOutOfTime && !mayan.thirteenMoons.isHunabKu0 && (() => {
                                        const psiKin = calcPSIKin(mayan.thirteenMoons.moon, mayan.thirteenMoons.day);
                                        const psiTotemIdx = (psiKin - 1) % 20;
                                        const psiToneNum = ((psiKin - 1) % 13) + 1;
                                        const psiTotem = TOTEMS[psiTotemIdx];
                                        const psiToneNames = ["磁性", "月亮", "电力", "自我存在", "超频", "韵律", "共振", "银河", "太阳", "行星", "光谱", "水晶", "宇宙"];
                                        return (
                                            <div className="mt-3 p-3 rounded-xl border border-violet-500/20" style={{ background: (psiTotem?.color ?? '#8b5cf6') + '0d' }}>
                                                <div className="text-[10px] text-violet-400 uppercase tracking-widest mb-2 font-bold">🌐 PSI · 行星守护者 <span className="text-stone-600 normal-case font-normal">（13月亮历第{mayan.thirteenMoons.moon}月第{mayan.thirteenMoons.day}日）</span></div>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative shrink-0">
                                                        <img src={psiTotem?.img} alt={psiTotem?.name}
                                                            className="w-14 h-14 object-contain rounded-xl ring-1 ring-violet-500/30"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-sm mb-0.5" style={{ color: psiTotem?.color }}>
                                                            Kin {psiKin} · {psiToneNames[psiToneNum - 1]} {psiTotem?.name}
                                                        </div>
                                                        <div className="text-[10px] text-stone-500">{psiTotem?.keyword} · {psiTotem?.power}</div>
                                                        <p className="text-stone-500 text-[10px] leading-relaxed mt-1 break-words pb-1">{psiTotem?.desc}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[9px] text-stone-600 mt-2 border-t border-white/5 pt-2">
                                                    💡 PSI（行星守护者）是基于你在13月亮历28天月份中的位置所推算的背景能量守护——它与今日银河印记并行共振，在潜意识层面托举你的行动方向。
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        })()}
                    </motion.div>
                )}

                {/* 历法介绍 */}
                {view === 'intro' && (
                    <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        {[
                            {
                                icon: "📅", title: "长计历 · Long Count", color: "amber",
                                body: `长计历（Long Count）是玛雅文明记录宏大时间跨度的线性历法。它以公元前3114年8月13日为起点，通过 Kin（天）、Uinal（20天）、Tun（360天）、Katun（约20年）和 Baktun（约394年）五个单位逐级累进。\n\n2012年12月21日标志着第13个 Baktun 的结束，开启了全新的宇宙周期。它并非终结，而是人类意识从物质向银河思维同步转化的「大跨越」节点。`
                            },
                            {
                                icon: "🌀", title: "卓尔金历 · Tzolkin（神圣历法）", color: "pink",
                                body: `由13个银河音调与20个太阳图腾交织而成的260天矩阵，是玛雅历法的核心灵魂。260天不仅对应人类的生命孕育周期，更是宇宙能量在地球上的精密律动频率。\n\n每个人出生时所在的 Kin（印记），就是其灵魂在地球上的「能量蓝图」。通过它，我们可以读解出自己的内在天赋、挑战以及生命使命。它是找回本来面目、实现觉醒的共时性导航系统。`
                            },
                            {
                                icon: "☀️", title: "哈布历 · Haab（太阳历法）", color: "blue",
                                body: `玛雅的 365 天太阳历，由18个月（每月20天）加上最后5天的「瓦耶布」（Wayeb，虚无之日）组成。它是农业生产与行政事务的基准。\n\n当 260 天的卓尔金历与 365 天的哈布历在齿轮般咬合中运行，每 52 年会重新相遇在同一个点，形成一个玛雅世纪。这就是我们生命城堡 52 年循环的数学基础。`
                            },
                            {
                                icon: "⚡", title: "13月亮历 · 13 Moons（时间法则）", color: "purple",
                                body: `基于玛雅历法原理，由何塞·阿圭里斯博士提出的现代共时性工具。它将一年分为13个月，每个月精准地包含28天（对应月亮周期与女性生理周期），共364天。剩下的1天（7月25日）被称为「不在时间之日」，用于艺术创作、宽恕与冥想。\n\n核心教导是「时间即艺术」（Time is Art）。通过同步这套频率，人类能够摆脱机械时间的束缚，回归自然的谐波律动。`
                            },
                        ].map(section => (
                            <div key={section.title} className={`glass-panel p-6 border border-${section.color}-500/20 bg-${section.color}-500/5`}>
                                <h3 className={`text-lg font-bold text-${section.color}-300 mb-3 flex items-center gap-2`}>
                                    <span>{section.icon}</span>{section.title}
                                </h3>
                                <pre className="text-stone-400 text-sm leading-relaxed whitespace-pre-wrap font-sans">{section.body}</pre>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* 图腾原型 */}
                {view === 'totems' && (
                    <motion.div key="totems" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        <p className="text-center text-stone-500 text-sm">点击任意图腾查看详细解读与星际原型</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                            {TOTEMS.map(t => (
                                <motion.div
                                    key={t.id}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => setSelectedTotem(selectedTotem?.id === t.id ? null : t)}
                                    className={`cursor-pointer glass-panel p-4 text-center border transition-all flex flex-col items-center justify-center ${selectedTotem?.id === t.id ? 'border-pink-500/50 ring-1 ring-pink-500/30 bg-white/5' : 'border-white/10 hover:border-white/20'}`}
                                    style={{ borderLeft: `3px solid ${t.color}` }}
                                >
                                    <img src={t.img} alt={t.name} className="w-16 h-16 object-contain rounded bg-stone-900/50 mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
                                    <div className="text-xs font-bold" style={{ color: t.color }}>{t.id}</div>
                                    <div className="text-sm font-bold text-stone-200">{t.name}</div>
                                    <div className="text-[10px] text-stone-500 mt-1">{t.en.split(' ')[0]}</div>
                                </motion.div>
                            ))}
                        </div>
                        <AnimatePresence>
                            {selectedTotem && (() => {
                                const arch = ARCHETYPES[selectedTotem.id - 1];
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="glass-panel p-6 border space-y-5"
                                        style={{ borderColor: selectedTotem.color + '60' }}
                                    >
                                        {/* 图腾信息 */}
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                            <img src={selectedTotem.img} alt={selectedTotem.name} className="w-32 h-32 object-contain rounded-lg shadow-xl ring-1 ring-white/10" />
                                            <div className="text-center sm:text-left flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-3xl font-bold" style={{ color: selectedTotem.color }}>
                                                        {selectedTotem.id}·{selectedTotem.name}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-stone-400">{selectedTotem.en}</div>
                                                <div className="flex gap-3 mt-2 text-xs">
                                                    <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10">元素：{selectedTotem.element}</span>
                                                    <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10">方位：{selectedTotem.direction}</span>
                                                    <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10">力量：{selectedTotem.power}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-stone-500 font-bold uppercase tracking-widest">关键词</div>
                                        <div className="text-stone-300 text-sm font-semibold">{selectedTotem.keyword}</div>
                                        <p className="text-stone-400 text-sm leading-relaxed">{selectedTotem.desc}</p>

                                        {/* 星际原型 */}
                                        {arch && (
                                            <div className="border-t border-white/10 pt-5 space-y-3">
                                                <div className="text-xs text-violet-400 uppercase tracking-widest font-bold">✨ 星际原型</div>
                                                <div className="flex gap-5 items-start">
                                                    <img src={arch.img} alt={arch.name}
                                                        className="w-28 h-28 object-contain rounded-xl shrink-0"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-bold text-lg mb-0.5" style={{ color: arch.color }}>{arch.name}</div>
                                                        <div className="text-xs text-stone-500 mb-2">{arch.en}</div>
                                                        <p className="text-stone-400 text-sm leading-relaxed">{arch.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })()}
                        </AnimatePresence>
                    </motion.div>
                )}


                {/* 13 调性 */}
                {view === 'tones' && (
                    <motion.div key="tones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        <p className="text-center text-stone-500 text-sm">13个调性构成银河音调历的脉动节律</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {TONES.map(t => (
                                <motion.div
                                    key={t.num}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setSelectedTone(selectedTone?.num === t.num ? null : t)}
                                    className={`cursor-pointer glass-panel p-4 border transition-all ${selectedTone?.num === t.num ? 'border-purple-500/50 bg-white/5' : 'border-white/10 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-14 h-14 shrink-0 rounded-lg bg-black/30 shadow-inner flex items-center justify-center text-purple-400 border border-purple-500/10">
                                            <MayanNumber num={t.num} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-stone-200">{t.name}调性 <span className="text-stone-500 font-normal">({t.num})</span></div>
                                            <div className="text-[10px] text-stone-500 flex items-center gap-2">
                                                <span>{t.keyword}</span>
                                                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-purple-400/80">对应：{t.joint}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {selectedTone?.num === t.num && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="text-sm text-stone-400 leading-relaxed overflow-hidden pt-3 border-t border-white/5 mt-3 space-y-3"
                                            >
                                                <p>{t.desc}</p>
                                                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 space-y-2">
                                                    <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                                                        <span>🧘 静心引导</span>
                                                        <div className="h-px flex-1 bg-purple-500/20"></div>
                                                    </div>
                                                    <p className="text-xs italic text-stone-400 leading-loose">
                                                        “{t.meditation}”
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 20 波符 */}
                {view === 'wavespells' && (
                    <motion.div key="wavespells" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        {/* 今日或选中的波符主展示 */}
                        {(() => {
                            const displayId = expandedWavespellId ?? WAVESPELLS.find(w => w.totemIdx === mayan.wavespell.totemIdx)?.id ?? 1;
                            const ws = WAVESPELLS.find(w => w.id === displayId)!;
                            const kins = getWavespellKins(ws.totemIdx);
                            const isCurrentWs = ws.totemIdx === mayan.wavespell.totemIdx;
                            return (
                                <div className="glass-panel p-6 border space-y-6 rounded-2xl" style={{ borderColor: ws.color + '60' }}>
                                    {/* 标题区 + 左右导航 */}
                                    <div className="flex flex-col items-center text-center gap-6 relative">
                                        {/* 导航按钮 - 移动端友好布局 */}
                                        <div className="flex items-center justify-between w-full max-w-md absolute top-1/2 -translate-y-1/2 px-2 pointer-events-none z-20">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setExpandedWavespellId(displayId === 1 ? 20 : displayId - 1); }}
                                                className="w-10 h-10 rounded-full bg-black/40 border border-white/20 text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all pointer-events-auto shadow-lg backdrop-blur-sm"
                                                title="上一个波符"
                                            >
                                                <span className="text-xl">←</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setExpandedWavespellId(displayId === 20 ? 1 : displayId + 1); }}
                                                className="w-10 h-10 rounded-full bg-black/40 border border-white/20 text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all pointer-events-auto shadow-lg backdrop-blur-sm"
                                                title="下一个波符"
                                            >
                                                <span className="text-xl">→</span>
                                            </button>
                                        </div>

                                        <div className="relative group cursor-pointer w-full flex justify-center my-2" onClick={() => setExpandedWavespellId(displayId === 20 ? 1 : displayId + 1)}>
                                            <div className="grid gap-1.5 sm:gap-2 p-6 glass-panel rounded-3xl border border-white/10 shadow-2xl transition-transform group-hover:scale-105 relative bg-gradient-to-br from-black/60 to-transparent" style={{ gridTemplateColumns: 'repeat(5, 2.8rem)', gridTemplateRows: 'repeat(5, 2.8rem)', borderColor: ws.color + '60' }}>
                                                {[
                                                    { t: 1, c: 1, r: 1 }, { t: 2, c: 1, r: 2 }, { t: 3, c: 1, r: 3 }, { t: 4, c: 1, r: 4 },
                                                    { t: 5, c: 1, r: 5 }, { t: 6, c: 2, r: 5 }, { t: 7, c: 3, r: 5 }, { t: 8, c: 4, r: 5 },
                                                    { t: 9, c: 5, r: 5 }, { t: 10, c: 5, r: 4 }, { t: 11, c: 5, r: 3 }, { t: 12, c: 5, r: 2 },
                                                    { t: 13, c: 4, r: 2 }
                                                ].map(pos => {
                                                    const k = kins.find(x => x.tone === pos.t);
                                                    if (!k) return null;
                                                    const isToday = isCurrentWs && k.tone === mayan.toneNum;
                                                    return (
                                                        <div key={pos.t}
                                                            className={`relative flex items-center justify-center rounded-lg border transition-all ${isToday ? 'border-white bg-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.9)] scale-125 z-10' : 'border-white/10 bg-black/40'}`}
                                                            style={{ gridColumn: pos.c, gridRow: pos.r }}
                                                            title={`${k.toneName} ${k.totemName}`}
                                                        >
                                                            <img src={k.totemImg} alt={k.totemName} className="w-7 h-7 object-contain drop-shadow" />
                                                            {isToday && <div className="absolute -bottom-2 -right-3 px-1.5 py-0.5 rounded text-[8px] bg-rose-500 text-white font-bold whitespace-nowrap shadow-md z-20">今日</div>}
                                                            <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-stone-900 text-stone-300 flex items-center justify-center text-[8px] border border-white/20 font-mono scale-90">{pos.t}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {/* 悬浮提示 */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-3xl pointer-events-none z-20">
                                                <span className="text-[11px] font-bold text-white/90 bg-black/70 px-4 py-2 rounded-full border border-white/30 backdrop-blur-md">点击切换下一波符 →</span>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="text-2xl font-bold mb-1" style={{ color: ws.color }}>{ws.name}</div>
                                            <div className="text-xs text-stone-500 mb-2">第 {ws.id} 条波符 · 主图腾：{TOTEMS[ws.totemIdx]?.name}</div>
                                            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 mb-3" style={{ color: ws.color }}>
                                                ✦ {ws.theme}
                                            </div>
                                            <p className="text-stone-400 text-sm leading-relaxed max-w-lg mx-auto">{ws.desc}</p>
                                            {isCurrentWs && (
                                                <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                                                    <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-bold">
                                                        🌊 你今日在此波符第 {mayan.toneNum} 天 · {THIRTEEN_QUESTIONS[mayan.toneNum - 1]?.label}调性
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 13 问引导 */}
                                    <div>
                                        <div className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3">✨ 13 问 · 银河调性引导</div>
                                        <div className="grid sm:grid-cols-2 gap-2">
                                            {THIRTEEN_QUESTIONS.map((q) => {
                                                const isToday = isCurrentWs && q.tone === mayan.toneNum;
                                                return (
                                                    <div key={q.tone}
                                                        className={`relative flex items-start gap-3 p-3 rounded-lg border transition-all overflow-hidden ${isToday
                                                            ? 'border-purple-400 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-[1.02] ring-1 ring-purple-400/50 z-10'
                                                            : 'border-white/5 bg-black/20'}`}
                                                    >
                                                        {isToday && <div className="absolute top-0 right-0 bg-rose-500 text-white px-2 py-0.5 rounded-bl-lg text-[9px] shadow-md font-bold">今日调性</div>}
                                                        <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${isToday ? 'bg-purple-500 text-white shadow-[0_0_10px_#a855f7]' : 'bg-white/10 text-stone-400'}`}>
                                                            {q.tone}
                                                        </div>
                                                        <div className="flex-1 mt-0.5">
                                                            <div className={`text-xs font-bold mb-1 ${isToday ? 'text-purple-300' : 'text-stone-400'}`}>{q.label}调性</div>
                                                            <div className={`text-sm ${isToday ? 'text-white font-bold tracking-wide' : 'text-stone-400'}`}>{q.question}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 波符13个Kin成员 */}
                                    <div>
                                        <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">🌀 波符成员 · 13 个 Kin</div>
                                        <div className="grid grid-cols-7 sm:grid-cols-13 gap-1.5 sm:gap-2">
                                            {kins.map((k) => {
                                                const isToday = isCurrentWs && k.tone === mayan.toneNum;
                                                return (
                                                    <div key={k.tone}
                                                        className={`relative flex flex-col items-center p-1.5 rounded-lg border text-center transition-all ${isToday
                                                            ? 'border-purple-400 bg-purple-500/30 ring-2 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)] scale-110 z-10'
                                                            : 'border-white/5 bg-black/20 hover:bg-white/5'}`}
                                                    >
                                                        <img src={k.totemImg} alt={k.totemName}
                                                            className="w-8 h-8 object-contain rounded mb-1"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                                                        />
                                                        <div className={`text-[8px] leading-tight font-bold ${isToday ? 'text-purple-200' : 'text-stone-500'}`}>{k.toneName}</div>
                                                        <div className={`text-[8px] leading-tight ${isToday ? 'text-white font-bold' : 'text-stone-500'}`}>{k.totemName}</div>
                                                        {isToday && <div className="absolute -top-2 -right-1 bg-rose-500 text-white px-1.5 py-0.5 rounded text-[8px] shadow-md font-bold z-20">今日</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 其他波符缩略网格 */}
                        <div>
                            <div className="text-xs text-stone-500 text-center mb-3">点击切换查看其他波符详情</div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                                {WAVESPELLS.map(ws => {
                                    const isCurrentWs = ws.totemIdx === mayan.wavespell.totemIdx;
                                    const isSelected = (expandedWavespellId ?? WAVESPELLS.find(w => w.totemIdx === mayan.wavespell.totemIdx)?.id) === ws.id;
                                    return (
                                        <motion.button
                                            key={ws.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => setExpandedWavespellId(ws.id)}
                                            className={`flex flex-col items-center p-2 rounded-xl border transition-all text-center ${isSelected
                                                ? 'border-pink-500/60 bg-pink-500/10 ring-1 ring-pink-500/30'
                                                : isCurrentWs
                                                    ? 'border-purple-500/50 bg-purple-500/5'
                                                    : 'border-white/10 bg-white/3 hover:border-white/20'}`}
                                            style={{ borderLeft: `3px solid ${ws.color}` }}
                                        >
                                            <img src={ws.img} alt={ws.name} className="w-9 h-9 object-contain rounded mb-1"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            <div className="text-[9px] font-bold leading-tight" style={{ color: ws.color }}>{ws.id}</div>
                                            <div className="text-[8px] text-stone-400 leading-tight">{ws.name.replace('波符', '')}</div>
                                            {isCurrentWs && <div className="text-[7px] bg-purple-500/30 text-purple-300 rounded-full px-1 mt-0.5">今日</div>}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}


                {/* 🏰 生命城堡 */}
                {view === 'castle' && (
                    <motion.div key="castle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        <div className="text-center space-y-1">
                            <p className="text-stone-400 text-sm">5座生命城堡 · 每座52天 · 4条波符 · 260天完整周期</p>
                        </div>
                        {/* 今日谐波与对等/镜像信息卡 */}
                        {(() => {
                            const harmonic = getHarmonic(mayan.kinNum);
                            const dayInHarmonic = getDayInHarmonic(mayan.kinNum);
                            const castleId = getCastleId(mayan.kinNum);
                            const antipode = getAntipodeKin(mayan.kinNum);
                            const occult = getOccultKin(mayan.kinNum);
                            const tzNames = ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界桥", "蓝手", "黄星星", "红月", "白狗", "蓝猴", "黄人", "红天行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"];
                            return (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="glass-panel p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl text-center space-y-1">
                                        <div className="text-xs text-amber-400 uppercase tracking-widest font-bold">🌀 谐波码</div>
                                        <div className="text-2xl font-bold text-amber-300">第 {harmonic} 谐波</div>
                                        <div className="text-sm text-stone-400">今日是谐波内第 {dayInHarmonic} 天</div>
                                        <div className="text-xs text-stone-500">共65个谐波 · 每4个Kin一组</div>
                                    </div>
                                    <div className="glass-panel p-4 border border-purple-500/20 bg-purple-500/5 rounded-xl text-center space-y-1">
                                        <div className="text-xs text-purple-400 uppercase tracking-widest font-bold">🏰 生命城堡</div>
                                        <div className="text-xl font-bold" style={{ color: CASTLES[castleId - 1]?.color }}>{CASTLES[castleId - 1]?.name}</div>
                                        <div className="text-xs text-stone-400">{CASTLES[castleId - 1]?.theme}</div>
                                        <div className="text-xs text-stone-500">Kin {mayan.kinNum} · 第 {castleId} 城堡</div>
                                    </div>
                                    <div className="glass-panel p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-xl text-center space-y-1">
                                        <div className="text-xs text-indigo-400 uppercase tracking-widest font-bold">⚔️ 对等印记</div>
                                        <div className="text-base font-bold text-stone-200">
                                            <img src={TOTEMS[antipode.totemIdx]?.img} alt="" className="w-10 h-10 object-contain inline rounded mx-auto" />
                                        </div>
                                        <div className="text-sm font-bold text-indigo-200">{antipode.tone}·{tzNames[antipode.totemIdx]}</div>
                                        <div className="text-xs text-stone-500">挑战拓展之力</div>
                                    </div>
                                    <div className="glass-panel p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-center space-y-1">
                                        <div className="text-xs text-emerald-400 uppercase tracking-widest font-bold">🔮 镜像印记</div>
                                        <div className="text-base font-bold text-stone-200">
                                            <img src={TOTEMS[occult.totemIdx]?.img} alt="" className="w-10 h-10 object-contain inline rounded mx-auto" />
                                        </div>
                                        <div className="text-sm font-bold text-emerald-200">{occult.tone}·{tzNames[occult.totemIdx]}</div>
                                        <div className="text-xs text-stone-500">隐藏同伴之力</div>
                                    </div>
                                </div>
                            );
                        })()}
                        {/* 52年生命城堡定位器 */}
                        <div className="glass-panel p-6 border border-emerald-500/30 rounded-2xl bg-emerald-500/5 space-y-4 mb-6">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="shrink-0 flex items-center gap-2">
                                    <span className="text-2xl">🏰</span>
                                    <label className="text-stone-200 font-bold">52年生命城堡定位：</label>
                                </div>
                                <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
                                    <input
                                        type="number"
                                        placeholder="出生年份 (如 1990)"
                                        value={birthYear}
                                        onChange={e => setBirthYear(e.target.value)}
                                        className="flex-1 sm:max-w-[200px] bg-black/40 border border-white/20 text-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500/80 transition-colors"
                                    />
                                    <button
                                        onClick={() => setShowLifeCastle(!!birthYear)}
                                        className="px-6 py-2 bg-emerald-500/30 text-emerald-200 rounded-lg border border-emerald-500/40 hover:bg-emerald-500/50 transition-all font-bold whitespace-nowrap active:scale-95"
                                    >
                                        开始定位
                                    </button>
                                </div>
                            </div>

                            {showLifeCastle && birthYear && (() => {
                                const bYear = parseInt(birthYear);
                                if (isNaN(bYear)) return null;
                                const currentYear = targetDate.getFullYear();
                                const age = currentYear - bYear;
                                if (age < 0) return <p className="text-rose-400 text-xs italic">查询年份需大于或等于出生年份</p>;

                                // 52年周期：13音调 * 4图腾家族 = 52年
                                // 每个人出生年份都有一个Kin，每年生日时Kin会改变
                                // 简单定位：第几周期，第几年
                                const cycleNum = Math.floor(age / 52) + 1;
                                const yearInCycle = (age % 52) + 1;

                                // 城堡定位：52年分为4个城堡，每个13年（红/白/蓝/黄），最后4年进入中心绿城堡（此为一种流派，另一种流派是同步卓尔金）
                                // 标准52年城堡对应：1-13红，14-26白，27-39蓝，40-52黄
                                const lifeCastleIdx = Math.floor((yearInCycle - 1) / 13);
                                const lifeCastle = CASTLES[lifeCastleIdx];
                                const yearInCastle = ((yearInCycle - 1) % 13) + 1;

                                return (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 border-t border-white/10 space-y-3">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center p-3 rounded-xl bg-black/40 border border-white/10 shrink-0">
                                                <div className="text-[10px] text-stone-500 uppercase font-bold">生命岁数</div>
                                                <div className="text-2xl font-bold text-stone-100">{age} <span className="text-xs font-normal text-stone-500">岁</span></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs text-stone-400 mb-1">当前人生阶段（第 {cycleNum} 个 52 年周期）</div>
                                                <div className="text-lg font-bold flex items-center gap-2">
                                                    正处于 <span style={{ color: lifeCastle.color }}>{lifeCastle.name}</span> · 第 <span className="text-emerald-400">{yearInCastle}</span> 年
                                                </div>
                                                <div className="text-xs text-stone-500 mt-1">主旋律：{lifeCastle.theme}</div>
                                            </div>
                                        </div>
                                        <p className="text-stone-400 text-xs leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                            💡 <span className="font-bold text-stone-300">年度解析：</span>
                                            在玛雅历法中，每 52 年是一个完整的生命城堡循环。你今年在 <span style={{ color: lifeCastle.color }} className="font-bold">{lifeCastle.name}</span> 之中，
                                            这标志着一个关于 <span className="font-bold text-stone-300">{lifeCastle.theme.split('·')[0]}</span> 的年份。
                                            建议在这一年重点关注：{lifeCastle.desc.split('。')[0]}。
                                        </p>
                                    </motion.div>
                                );
                            })()}
                        </div>

                        {/* 五座城堡展示 */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {CASTLES.map(castle => {
                                const isCurrent = getCastleId(mayan.kinNum) === castle.id;
                                return (
                                    <div key={castle.id} className={`glass-panel p-5 border rounded-xl bg-gradient-to-br ${castle.bg} to-transparent ${isCurrent ? 'ring-1' : ''}`}
                                        style={{ borderColor: castle.color + '50', ...(isCurrent ? { boxShadow: `0 0 15px ${castle.color}30` } : {}) }}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-4 h-4 rounded-full shrink-0" style={{ background: castle.color }} />
                                            <div className="font-bold text-lg" style={{ color: castle.color }}>{castle.name}</div>
                                            {isCurrent && <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: castle.color + '30', color: castle.color }}>今日</span>}
                                        </div>
                                        <div className="text-xs text-stone-500 mb-2 font-semibold">{castle.theme}</div>
                                        <p className="text-stone-400 text-sm leading-relaxed">{castle.desc}</p>
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {castle.waves.map(wid => {
                                                const ws = WAVESPELLS[wid - 1];
                                                return ws ? (
                                                    <span key={wid} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-stone-400"
                                                        style={{ borderColor: ws.color + '40', color: ws.color }}>
                                                        {ws.name}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ⚡ 7等离子体 */}
                {view === 'plasma' && (
                    <motion.div key="plasma" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        <div className="text-center space-y-1">
                            <p className="text-stone-400 text-sm">7个等离子体 · 对应每月7天一循环 · 激活脉轮能量</p>
                        </div>
                        {/* 今日等离子体 */}
                        {!mayan.thirteenMoons.isDayOutOfTime && !mayan.thirteenMoons.isHunabKu0 && (() => {
                            const pIdx = getPlasmaIdx(mayan.thirteenMoons.day);
                            const plasma = PLASMAS[pIdx];
                            return (
                                <div className="glass-panel p-6 border rounded-2xl text-center space-y-3" style={{ borderColor: plasma.color + '60' }}>
                                    <div className="text-xs uppercase tracking-widest font-bold" style={{ color: plasma.color }}>⚡ 今日等离子体</div>
                                    <img src={plasma.img} alt={plasma.nameCN} className="w-20 h-20 object-contain mx-auto rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    <div className="text-3xl font-bold" style={{ color: plasma.color }}>{plasma.nameCN} · {plasma.name}</div>
                                    <div className="flex justify-center gap-4 text-sm text-stone-400">
                                        <span>脉轮：<span className="font-bold text-stone-200">{plasma.chakra}</span></span>
                                        <span>特质：<span className="font-bold text-stone-200">{plasma.quality}</span></span>
                                    </div>
                                    <p className="text-stone-400 text-sm italic max-w-lg mx-auto leading-relaxed">"{plasma.affirmation}"</p>
                                </div>
                            );
                        })()}
                        {/* 全部7个等离子体 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {PLASMAS.map((plasma, idx) => {
                                const isCurrent = !mayan.thirteenMoons.isDayOutOfTime && !mayan.thirteenMoons.isHunabKu0
                                    && getPlasmaIdx(mayan.thirteenMoons.day) === idx;
                                return (
                                    <div key={plasma.id} className={`glass-panel p-4 border rounded-xl flex gap-4 items-center ${isCurrent ? 'ring-1' : ''}`}
                                        style={{ borderColor: plasma.color + '40', ...(isCurrent ? { boxShadow: `0 0 12px ${plasma.color}30` } : {}) }}>
                                        <img src={plasma.img} alt={plasma.nameCN} className="w-12 h-12 object-contain rounded-lg shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold" style={{ color: plasma.color }}>{plasma.nameCN} <span className="text-stone-500 text-xs font-normal">({plasma.name})</span></div>
                                            <div className="text-xs text-stone-500 mt-0.5">{plasma.chakra} · {plasma.quality}</div>
                                            {isCurrent && <div className="text-[10px] text-stone-300 mt-0.5 bg-white/10 px-1.5 py-0.5 rounded-full inline-block">⚡ 今日</div>}
                                        </div>
                                        <div className="text-stone-600 text-xs shrink-0">第{idx + 1}天</div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ✨ 星际原型 */}
                {view === 'archetype' && (
                    <motion.div key="archetype" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                        <div className="text-center space-y-1">
                            <p className="text-stone-400 text-sm">20个星际原型 · 每个图腾对应一种宇宙原型能量</p>
                            <p className="text-stone-500 text-xs">今日原型：<span className="font-bold" style={{ color: ARCHETYPES[mayan.totemIdx]?.color }}>{ARCHETYPES[mayan.totemIdx]?.name}</span></p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {ARCHETYPES.map(arch => {
                                const isCurrent = arch.totemIdx === mayan.totemIdx;
                                return (
                                    <div key={arch.id} className={`glass-panel p-4 border rounded-xl flex flex-col items-center text-center ${isCurrent ? 'ring-1' : ''}`}
                                        style={{ borderColor: arch.color + (isCurrent ? 'aa' : '30'), ...(isCurrent ? { boxShadow: `0 0 15px ${arch.color}25` } : {}) }}>
                                        <img src={arch.img} alt={arch.name} className="w-full h-32 object-contain rounded-lg mb-2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        <div className="text-xs mb-0.5" style={{ color: arch.color }}>{arch.id}·{TOTEMS[arch.totemIdx]?.name}</div>
                                        <div className="font-bold text-stone-200 text-sm">{arch.name}</div>
                                        <div className="text-[10px] text-stone-500 mt-0.5">{arch.en}</div>
                                        {isCurrent && <div className="text-[9px] bg-white/10 text-stone-300 px-2 py-0.5 rounded-full mt-1">✦ 今日原型</div>}
                                        <p className="text-[10px] text-stone-500 mt-2 leading-relaxed text-left">{arch.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* 🎂 印记查询 */}
                {view === 'birthday' && (
                    <motion.div key="birthday" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-2xl mx-auto">
                        <div className="text-center space-y-1">
                            <p className="text-stone-400 text-sm">输入任意生日，查找银河印记（Dreamspell Kin）</p>
                            <p className="text-stone-600 text-xs">基于时间法则，2月29日闰日与2月28日共享同一Kin</p>
                        </div>
                        {/* 输入区 */}
                        <div className="glass-panel p-6 border border-pink-500/20 rounded-2xl space-y-4">
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <label className="text-stone-300 font-bold shrink-0">🎂 出生日期：</label>
                                <input
                                    type="date"
                                    value={bdStr}
                                    onChange={e => setBdStr(e.target.value)}
                                    className="flex-1 bg-black/40 border border-white/20 text-stone-200 rounded-md px-4 py-2 focus:outline-none focus:border-pink-500/80 transition-colors"
                                />
                                <button
                                    onClick={handleBdQuery}
                                    className="px-6 py-2 bg-pink-500/30 text-pink-200 rounded-full border border-pink-500/40 hover:bg-pink-500/50 transition-all font-bold shrink-0"
                                >
                                    查询
                                </button>
                            </div>
                        </div>
                        {/* 结果 */}
                        {bdResult && (() => {
                            const { kin, tone, totemIdx } = bdResult;
                            const totem = TOTEMS[totemIdx];
                            const toneD = TONES[tone - 1];
                            const wavespellTotemIdx = (kin - tone) % 20;
                            const wsFixed = (wavespellTotemIdx < 0 ? wavespellTotemIdx + 20 : wavespellTotemIdx);
                            const ws = WAVESPELLS.find(w => w.totemIdx === wsFixed);
                            const arch = ARCHETYPES[totemIdx];
                            const antipode = getAntipodeKin(kin);
                            const occult = getOccultKin(kin);
                            const tzNames = ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界桥", "蓝手", "黄星星", "红月", "白狗", "蓝猴", "黄人", "红天行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"];
                            const toneNames = ["磁性", "月亮", "电力", "自我存在", "超频", "韵律", "共振", "银河", "太阳", "行星", "光谱", "水晶", "宇宙"];
                            return (
                                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 border border-pink-500/30 rounded-2xl space-y-5">
                                    <div className="text-center">
                                        <div className="text-xs text-pink-400 uppercase tracking-widest mb-1">印记</div>
                                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-300 to-purple-400">
                                            第 {tone} 音调 · {totem?.name}
                                        </div>
                                        <div className="text-stone-500 text-sm mt-1">Kin {kin} · {toneD?.name}·{totem?.en?.split(' ')[0]}</div>
                                    </div>
                                    {/* 主印记 */}
                                    <div className="flex flex-col sm:flex-row gap-5 items-center">
                                        <img src={totem?.img} alt={totem?.name} className="w-28 h-28 object-contain rounded-xl shadow-xl ring-1 ring-white/10 shrink-0" />
                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="flex gap-2 flex-wrap mb-2 justify-center sm:justify-start">
                                                <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-xs text-stone-300">元素：{totem?.element}</span>
                                                <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-xs text-stone-300">方位：{totem?.direction}</span>
                                                <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-xs text-stone-300">力量：{totem?.power}</span>
                                                {totem?.family && <span className="px-2 py-0.5 rounded-sm bg-pink-500/5 border border-pink-500/10 text-xs text-pink-300/60">家族：{totem.family}</span>}
                                            </div>
                                            <div className="text-stone-400 text-sm leading-relaxed space-y-2">
                                                <p>{totem?.desc}</p>
                                                <div className="p-2 rounded bg-pink-500/5 border border-pink-500/10 text-xs">
                                                    <div className="text-pink-300/80 font-bold mb-1">【{TONES[tone - 1]?.name}调性 · {TONES[tone - 1]?.joint}】</div>
                                                    <p className="text-stone-500 italic">“{TONES[tone - 1]?.meditation}”</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 神谕五力 */}
                                    <div>
                                        <div className="text-xs text-amber-400 uppercase tracking-widest mb-3">🌟 星际原型 · 神谕五力</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {arch && (
                                                <div className="glass-panel p-3 border rounded-lg text-center" style={{ borderColor: arch.color + '50' }}>
                                                    <img src={arch.img} alt={arch.name} className="w-16 h-16 object-contain mx-auto rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                    <div className="text-xs mt-1 font-bold" style={{ color: arch.color }}>{arch.name}</div>
                                                    <div className="text-[10px] text-stone-500">星际原型</div>
                                                </div>
                                            )}
                                            {ws && (
                                                <div className="glass-panel p-3 border rounded-lg text-center" style={{ borderColor: ws.color + '50' }}>
                                                    <img src={ws.img} alt={ws.name} className="w-16 h-16 object-contain mx-auto rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                    <div className="text-xs mt-1 font-bold" style={{ color: ws.color }}>{ws.name}</div>
                                                    <div className="text-[10px] text-stone-500">{ws.theme}</div>
                                                </div>
                                            )}
                                            <div className="glass-panel p-3 border border-indigo-500/20 rounded-lg text-center">
                                                <img src={TOTEMS[antipode.totemIdx]?.img} alt="" className="w-12 h-12 object-contain mx-auto rounded mb-1" />
                                                <div className="text-xs font-bold text-indigo-300">{toneNames[antipode.tone - 1]}·{tzNames[antipode.totemIdx]}</div>
                                                <div className="text-[10px] text-stone-500">对等印记</div>
                                            </div>
                                            <div className="glass-panel p-3 border border-emerald-500/20 rounded-lg text-center">
                                                <img src={TOTEMS[occult.totemIdx]?.img} alt="" className="w-12 h-12 object-contain mx-auto rounded mb-1" />
                                                <div className="text-xs font-bold text-emerald-300">{toneNames[occult.tone - 1]}·{tzNames[occult.totemIdx]}</div>
                                                <div className="text-[10px] text-stone-500">镜像印记</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
