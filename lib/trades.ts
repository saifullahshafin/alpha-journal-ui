import { supabase } from "./supabase";
import type { Trade, SystemLog } from "./types";

export async function getTrades(): Promise<Trade[]> {
    const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("open_time", { ascending: false, nullsFirst: false });

    if (error) {
        // Fallback to created_at ordering if open_time not yet available
        const { data: fallback } = await supabase
            .from("trades")
            .select("*")
            .order("created_at", { ascending: false });
        return (fallback as Trade[]) ?? [];
    }
    return (data as Trade[]) ?? [];
}

export async function getTradeById(id: string): Promise<Trade | null> {
    const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching trade:", error.message);
        return null;
    }
    return data as Trade;
}

export async function getSystemLogs(): Promise<SystemLog[]> {
    const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .order("id", { ascending: false })
        .limit(100);

    if (error) {
        console.error("Error fetching system logs:", error.message);
        return [];
    }
    return (data as SystemLog[]) ?? [];
}

/** Compute KPIs from all trades that have close data (SYNC + VERIFIED) */
export function computeKPIs(trades: Trade[]) {
    // Include all trades with a close price for calculations
    const closed = trades.filter((t) => t.close_price !== null && t.entry_price !== null);

    // Prefer direct pips/net_profit fields, fall back to computed
    const getPips = (t: Trade): number => {
        if (t.pips != null) return t.pips;
        if (!t.close_price || !t.entry_price) return 0;
        const raw = t.action === "BUY"
            ? t.close_price - t.entry_price
            : t.entry_price - t.close_price;
        // For BTC (price ~65k), pips are expressed as points (not * 10000)
        return Math.round(raw * 10) / 10;
    };

    const getProfit = (t: Trade): number => {
        if (t.net_profit != null) return t.net_profit;
        if (t.profit != null) return t.profit;
        return 0;
    };

    const wins = closed.filter((t) => getPips(t) > 0);
    const losses = closed.filter((t) => getPips(t) < 0);

    const netPips = closed.reduce((acc, t) => acc + getPips(t), 0);
    const netProfit = closed.reduce((acc, t) => acc + getProfit(t), 0);

    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;

    const sumWinProfit = wins.reduce((acc, t) => acc + getProfit(t), 0);
    const sumLossProfit = Math.abs(losses.reduce((acc, t) => acc + getProfit(t), 0));
    const profitFactor = sumLossProfit > 0 ? sumWinProfit / sumLossProfit : sumWinProfit > 0 ? 999 : 0;

    return {
        totalTrades: trades.length,
        closedTrades: closed.length,
        netPips: Math.round(netPips * 10) / 10,
        netProfit: Math.round(netProfit * 100) / 100,
        winRate: Math.round(winRate * 10) / 10,
        profitFactor: Math.round(profitFactor * 100) / 100,
        verifiedCount: trades.filter((t) => t.status === "VERIFIED").length,
        draftCount: trades.filter((t) => t.status === "DRAFT").length,
        syncCount: trades.filter((t) => t.status === "SYNC").length,
    };
}

/** Build cumulative pips curve sorted by open_time */
export function buildPipsCurve(trades: Trade[]) {
    const closed = trades
        .filter((t) => t.close_price != null && t.entry_price != null)
        .sort((a, b) => {
            const da = a.open_time ?? a.created_at;
            const db = b.open_time ?? b.created_at;
            return da < db ? -1 : da > db ? 1 : 0;
        });

    let cumPips = 0;
    return closed.map((t) => {
        const pips = t.pips ?? (
            t.action === "BUY"
                ? Math.round(((t.close_price ?? 0) - (t.entry_price ?? 0)) * 10) / 10
                : Math.round(((t.entry_price ?? 0) - (t.close_price ?? 0)) * 10) / 10
        );
        cumPips += pips;
        const dateStr = t.open_time ?? t.created_at;
        return {
            date: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            pips: Math.round(cumPips * 10) / 10,
        };
    });
}
