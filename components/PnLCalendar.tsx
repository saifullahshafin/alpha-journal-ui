"use client";

import { useMemo, useState } from "react";
import type { Trade } from "@/lib/types";

function buildCalendarData(trades: Trade[]) {
    const map: Record<string, { profit: number; count: number; hasDraft: boolean }> = {};

    for (const t of trades) {
        const dateStr = t.open_time || t.created_at;
        if (!dateStr) continue;

        const key = new Date(dateStr).toISOString().slice(0, 10);

        let tradeProfit = 0;
        if (t.profit !== null && t.profit !== undefined) {
            tradeProfit = t.profit;
        } else if (t.net_profit !== null && t.net_profit !== undefined) {
            tradeProfit = t.net_profit;
        }

        if (!map[key]) map[key] = { profit: 0, count: 0, hasDraft: false };
        map[key].profit += tradeProfit;
        map[key].count += 1;
        if (t.status === "DRAFT") {
            map[key].hasDraft = true;
        }
    }

    return map;
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

// Adjusted to Monday-start week (0 = Monday, 6 = Sunday)
function getFirstDayOfWeek(year: number, month: number) {
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
}

export default function PnLCalendar({ trades }: { trades: Trade[] }) {
    const data = useMemo(() => buildCalendarData(trades), [trades]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const now = new Date();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);

    const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Calculate previous month days to fill the first row
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + i + 1);

    // Calculate next month days to fill the last row (up to 42 total days, 6 rows)
    const totalCells = blanks.length + days.length;
    const nextMonthDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const nextBlanks = Array.from({ length: nextMonthDaysCount }, (_, i) => i + 1);

    return (
        <div className="w-full">
            {/* Calendar Controls Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-white/5 px-3 py-1.5 rounded-full text-xs text-white font-medium transition-colors">
                        Dollar Profit
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </button>

                    <div className="flex items-center gap-3">
                        <button title="Previous month" aria-label="Previous month" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:text-white text-[#a3a3a3] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <span className="text-white font-semibold text-[15px] min-w-[50px] text-center">{monthName}</span>
                        <button title="Next month" aria-label="Next month" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:text-white text-[#a3a3a3] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 ml-2">
                        <button title="Previous year" aria-label="Previous year" onClick={() => setCurrentDate(new Date(year - 1, month, 1))} className="p-1 hover:text-white text-[#a3a3a3] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <span className="text-white font-semibold text-[15px] min-w-[40px] text-center">{year}</span>
                        <button title="Next year" aria-label="Next year" onClick={() => setCurrentDate(new Date(year + 1, month, 1))} className="p-1 hover:text-white text-[#a3a3a3] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[#a3a3a3] hover:text-white transition-colors">
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#3b82f6] flex items-center justify-center p-[2px]">
                                <div className="w-full h-full bg-[#3b82f6] rounded-full"></div>
                            </div>
                            Initial Balance
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[#a3a3a3] hover:text-white transition-colors">
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#404040]"></div>
                            Current Balance
                        </label>
                    </div>

                    <div className="flex bg-[#1a1a1a] rounded-md border border-white/5 p-0.5">
                        <button className="px-3 py-1 text-xs font-medium bg-[#262626] text-white rounded shadow-sm">Month</button>
                        <button className="px-3 py-1 text-xs font-medium text-[#737373] hover:text-white transition-colors">Year</button>
                    </div>
                </div>
            </div>

            {/* Grid Container */}
            <div className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl overflow-hidden p-[1px]">
                <div className="grid grid-cols-7 gap-px bg-[#262626]">
                    {/* Header Row */}
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                        <div key={i} className="text-[12px] text-center text-[#a3a3a3] font-medium py-3 bg-[#0a0a0a]">
                            {d}
                        </div>
                    ))}

                    {/* Previous Month Blanks */}
                    {blanks.map((d, i) => (
                        <div key={`prev-${i}`} className="h-28 p-2.5 bg-[#0e0e0e] text-[#404040] text-[11px] font-medium flex justify-end">
                            {d}
                        </div>
                    ))}

                    {/* Current Month Days */}
                    {days.map((day) => {
                        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const entry = data[key];
                        const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

                        let bg = "#0a0a0a";
                        if (entry) {
                            if (entry.profit > 0) bg = "#0d1f14";
                            else if (entry.profit < 0) bg = "#1f0d0d";
                            else bg = "#121212";
                        }

                        return (
                            <div key={day}
                                className="h-28 p-2.5 flex flex-col justify-between relative group cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                                style={{ background: isToday ? "#121212" : bg }}
                            >
                                {/* Top Row */}
                                <div className="flex justify-between items-start w-full leading-none">
                                    <span className="text-[#525252] text-[11px] whitespace-nowrap overflow-hidden text-ellipsis mr-1">
                                        {entry?.count ? `${entry.count} trade${entry.count > 1 ? "s" : ""}` : ""}
                                    </span>
                                    <div className="flex gap-1.5 items-center">
                                        {entry?.hasDraft && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#eab308]" title="Draft exists" />
                                        )}
                                        <span className={`text-[12px] font-semibold ${isToday ? "text-[#38bdf8]" : entry ? "text-white" : "text-[#737373]"}`}>
                                            {day}
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom Row */}
                                <div className="flex justify-start items-end w-full leading-none">
                                    {entry && (
                                        <span className={`font-semibold text-[13px] tracking-tight ${entry.profit > 0 ? "text-[#34d399]" : entry.profit < 0 ? "text-[#fb7185]" : "text-[#a3a3a3]"}`}>
                                            {entry.profit > 0 ? "+$" : entry.profit < 0 ? "-$" : "$"}{Math.abs(entry.profit).toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                {isToday && <div className="absolute inset-0 border border-[#38bdf8]/30 pointer-events-none rounded-sm m-px" />}
                            </div>
                        );
                    })}

                    {/* Next Month Blanks */}
                    {nextBlanks.map((d, i) => (
                        <div key={`next-${i}`} className="h-28 p-2.5 bg-[#0e0e0e] text-[#404040] text-[11px] font-medium flex justify-end">
                            {d}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
