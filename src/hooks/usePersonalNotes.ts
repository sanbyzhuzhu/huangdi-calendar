import { useState } from 'react';

export interface NoteEntry {
    id: string;
    year: number;
    content: string;
    timestamp: number;
}

export interface NotesStore {
    [mmdd: string]: NoteEntry[];
}

const STORAGE_KEY = 'ancient_calendar_notes';

const isValidDateKey = (value: string): boolean => {
    const match = /^(\d{2})-(\d{2})$/.exec(value);
    if (!match) return false;

    const month = Number(match[1]);
    const day = Number(match[2]);
    const date = new Date(Date.UTC(2000, month - 1, day));
    return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const isNoteEntry = (value: unknown): value is NoteEntry => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

    const entry = value as Record<string, unknown>;
    return typeof entry.id === 'string'
        && entry.id.trim().length > 0
        && Number.isInteger(entry.year)
        && (entry.year as number) >= 1
        && (entry.year as number) <= 9999
        && typeof entry.content === 'string'
        && entry.content.trim().length > 0
        && typeof entry.timestamp === 'number'
        && Number.isFinite(entry.timestamp)
        && entry.timestamp >= 0;
};

export const isNotesStore = (value: unknown): value is NotesStore => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

    const ids = new Set<string>();
    return Object.entries(value).every(([dateKey, entries]) => {
        if (!isValidDateKey(dateKey) || !Array.isArray(entries)) return false;

        return entries.every((entry) => {
            if (!isNoteEntry(entry) || ids.has(entry.id)) return false;
            ids.add(entry.id);
            return true;
        });
    });
};

const getDateKey = (dateStr: string): string | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (match) {
        const dateKey = `${match[2]}-${match[3]}`;
        return isValidDateKey(dateKey) ? dateKey : null;
    }

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return null;
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getDateYear = (dateStr: string): number | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (match) return Number(match[1]);

    const date = new Date(dateStr);
    return Number.isNaN(date.getTime()) ? null : date.getFullYear();
};

const saveNotes = (notes: NotesStore) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
};

export const usePersonalNotes = () => {
    const [notes, setNotes] = useState<NotesStore>(() => {
        if (typeof localStorage === 'undefined') return {};

        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return {};

        try {
            const parsed: unknown = JSON.parse(stored);
            if (isNotesStore(parsed)) return parsed;
            console.error('Invalid notes data found in local storage');
            return {};
        } catch {
            console.error('Failed to parse notes from local storage');
            return {};
        }
    });

    // 保存笔记
    const addNote = (dateStr: string, content: string) => {
        if (!content.trim()) return;

        const mmdd = getDateKey(dateStr);
        const year = getDateYear(dateStr);
        if (!mmdd || !year) return;

        const newEntry: NoteEntry = {
            id: crypto.randomUUID(),
            year,
            content: content.trim(),
            timestamp: Date.now()
        };

        setNotes((currentNotes) => {
            const nextNotes = {
                ...currentNotes,
                [mmdd]: [...(currentNotes[mmdd] || []), newEntry].sort((a, b) => b.year - a.year)
            };
            saveNotes(nextNotes);
            return nextNotes;
        });
    };

    // 获取某一天(MM-DD)的所有笔记
    const getNotesForDate = (dateStr: string): NoteEntry[] => {
        const mmdd = getDateKey(dateStr);
        if (!mmdd) return [];
        return notes[mmdd] || [];
    };

    // 获取当天的格式化键名用于查历史数据
    const getMMDD = (dateStr: string): string => {
        return getDateKey(dateStr) || '';
    }

    // 更新笔记
    const updateNote = (dateStr: string, id: string, newContent: string) => {
        if (!newContent.trim()) return;
        const mmdd = getMMDD(dateStr);
        if (!mmdd) return;

        setNotes((currentNotes) => {
            if (!currentNotes[mmdd]?.some(note => note.id === id)) return currentNotes;

            const nextNotes = {
                ...currentNotes,
                [mmdd]: currentNotes[mmdd].map(note =>
                    note.id === id ? { ...note, content: newContent.trim() } : note
                )
            };
            saveNotes(nextNotes);
            return nextNotes;
        });
    };

    // 删除笔记
    const deleteNote = (dateStr: string, id: string) => {
        const mmdd = getMMDD(dateStr);
        if (!mmdd) return;

        setNotes((currentNotes) => {
            if (!currentNotes[mmdd]?.some(note => note.id === id)) return currentNotes;

            const remainingNotes = currentNotes[mmdd].filter(note => note.id !== id);
            const nextNotes = { ...currentNotes };
            if (remainingNotes.length > 0) nextNotes[mmdd] = remainingNotes;
            else delete nextNotes[mmdd];
            saveNotes(nextNotes);
            return nextNotes;
        });
    };


    // 获取特定日期（月-日）在所有年份中的记录
    const getNotesForDayAcrossYears = (mmdd: string): NoteEntry[] => {
        return notes[mmdd] || [];
    };

    // 获取所有笔记的拍平列表（用于管理界面）
    const getAllNotesList = (): (NoteEntry & { date: string })[] => {
        const allNotes: (NoteEntry & { date: string })[] = [];
        Object.keys(notes).forEach(dateStr => {
            notes[dateStr].forEach(note => {
                allNotes.push({ ...note, date: dateStr });
            });
        });
        // 默认按时间倒序
        return allNotes.sort((a, b) => b.timestamp - a.timestamp);
    };

    // 导出数据为 JSON 字符串
    const exportData = (): string => {
        if (Object.keys(notes).length === 0) {
            // 如果为空，提供一份用于外部编辑器参考和填写的示例模板
            const dateObj = new Date();
            const mmdd = `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            const template = {
                [mmdd]: [
                    {
                        "id": crypto.randomUUID(),
                        "year": dateObj.getFullYear(),
                        "content": "这是一条示例记录。您可以在电脑的记事本里仿照这个格式（年月、内容）接着往下写，填好保存后即可导入系统！",
                        "timestamp": Date.now()
                    }
                ],
                "01-01": [
                    {
                        "id": crypto.randomUUID(),
                        "year": 2024,
                        "content": "元旦快乐。只要保证格式不乱，导入后系统就能认出您的文字！",
                        "timestamp": Date.now() - 1000000
                    }
                ]
            };
            return JSON.stringify(template, null, 2);
        }
        return JSON.stringify(notes, null, 2);
    };

    // 导入 JSON 数据
    const importData = (jsonData: string): boolean => {
        try {
            const parsed: unknown = JSON.parse(jsonData);
            if (!isNotesStore(parsed)) return false;

            setNotes(parsed);
            saveNotes(parsed);
            return true;
        } catch (e) {
            console.error("Import failed:", e);
            return false;
        }
    };

    return {
        notes,
        addNote,
        updateNote,
        deleteNote,
        getNotesForDate,
        getMMDD,
        getAllNotes: getAllNotesList,
        getNotesForDayAcrossYears,
        exportData,
        importData
    };
};
