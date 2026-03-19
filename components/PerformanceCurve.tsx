"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Trade } from "@/lib/types";

function buildChartData(trades: Trade[]) {
    // Sort by close_time to reflect REALIZED profit (matches ifxhub dashboard curve)
    const sorted = [...trades]
        .filter((t) => t.close_price && t.entry_price && t.close_time)
        .sort((a, b) => {
            const da = a.close_time ?? a.open_time ?? a.created_at;
            const db = b.close_time ?? b.open_time ?? b.created_at;
            return new Date(da).getTime() - new Date(db).getTime();
        });

    let cumProfit = 0;
    return sorted.map((t) => {
        // Prefer the exact net_profit from broker; fall back to computing from prices
        let tradeProfit: number;
        if (t.net_profit != null) {
            tradeProfit = t.net_profit;
        } else if (t.profit != null) {
            tradeProfit = t.profit;
        } else {
            // Fallback: raw price difference (rough estimate, used only when no broker data)
            const rawDiff =
                t.action === "BUY"
                    ? (t.close_price! - t.entry_price!)
                    : (t.entry_price! - t.close_price!);
            tradeProfit = Math.round(rawDiff * 100) / 100;
        }
        cumProfit = Math.round((cumProfit + tradeProfit) * 100) / 100;
        const dateStr = t.close_time ?? t.open_time ?? t.created_at;
        return {
            date: new Date(dateStr).toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
            profit: cumProfit,
        };
    });
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload?.length) {
        const val = payload[0].value;
        return (
            <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-[#a3a3a3]">{label}</p>
                <p className="font-bold mt-0.5" style={{ color: val >= 0 ? "#34d399" : "#fb7185" }}>
                    {val >= 0 ? "+" : ""}${val.toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

const formatYAxis = (value: number) => `$${value >= 0 ? "+" : ""}${value.toFixed(0)}`;

export default function PerformanceCurve({ trades }: { trades: Trade[] }) {
    const data = buildChartData(trades);
    const lastVal = data.length > 0 ? data[data.length - 1].profit : 0;
    const color = lastVal >= 0 ? "#34d399" : "#fb7185";

    if (data.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center">
                <p className="text-[#a3a3a3] text-sm">No closed trades to chart yet.</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 10, bottom: 0 }}>
                <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "#a3a3a3", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tickFormatter={formatYAxis} tick={{ fill: "#a3a3a3", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="profit" stroke={color} strokeWidth={2} fill="url(#profitGrad)" dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }} />
            </AreaChart>
        </ResponsiveContainer>
    );
}
