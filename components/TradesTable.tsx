"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Trade } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { ArrowUpCircle, ArrowDownCircle, Edit2, X, RefreshCw, Eye, Trash2, Sparkles } from "lucide-react";
import { updateTradeAction, triggerSyncAction, triggerAuthAction, deleteTradeAction, clearDuplicatesAction } from "@/app/actions";
import EditTradeModal from "./EditTradeModal";

interface TradesTableProps {
    trades: Trade[];
}

type SortKey = "open_time" | "symbol" | "status" | "action" | "net_profit";

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export default function TradesTable({ trades }: TradesTableProps) {
    const router = useRouter();
    const [filter, setFilter] = useState({ status: "ALL", action: "ALL", search: "" });
    const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "open_time", dir: "desc" });

    // Edit & Delete state
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDeduping, setIsDeduping] = useState(false);
    const [isReAuthing, setIsReAuthing] = useState(false);
    const [dedupResult, setDedupResult] = useState<string | null>(null);
    const syncPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const filtered = trades
        .filter((t) => {
            if (filter.status !== "ALL" && t.status !== filter.status) return false;
            if (filter.action !== "ALL" && t.action !== filter.action) return false;
            if (filter.search && !t.symbol?.toLowerCase().includes(filter.search.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            const av = String((a as any)[sort.key] ?? "");
            const bv = String((b as any)[sort.key] ?? "");
            return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });

    const toggleSort = (key: SortKey) => {
        setSort((prev) => ({
            key,
            dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
        }));
    };

    const chipClass = (active: boolean) =>
        `px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${active
            ? "bg-[#22d3ee] text-black"
            : "bg-[#1a1a1a] text-[#a3a3a3] hover:text-white border border-white/5"
        }`;

    const thClass = "px-4 py-2 text-left text-[10px] font-medium text-[#a3a3a3] uppercase tracking-widest cursor-pointer hover:text-white transition-colors select-none";

    const getProfit = (t: Trade) => t.net_profit ?? t.profit ?? null;

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await triggerSyncAction();
            if (!res?.success) {
                alert("Sync failed: " + res?.error);
                return;
            }
            // Sync job is async in Modal (~30-90s). Poll router.refresh() until data arrives.
            if (res.async) {
                let elapsed = 0;
                syncPollRef.current = setInterval(() => {
                    elapsed += 15;
                    router.refresh();
                    if (elapsed >= 90) {
                        clearInterval(syncPollRef.current!);
                        syncPollRef.current = null;
                        setIsSyncing(false);
                    }
                }, 15000);
            } else {
                router.refresh();
                setIsSyncing(false);
            }
        } catch (err) {
            alert("Sync crashed.");
            setIsSyncing(false);
        }
    };

    const handleReAuth = async () => {
        setIsReAuthing(true);
        try {
            const res = await triggerAuthAction();
            if (!res?.success) {
                alert("Re-Auth failed: " + res?.error);
            } else {
                // After re-auth, trigger a sync automatically
                setTimeout(() => handleSync(), 3000);
            }
        } catch (err) {
            alert("Re-Auth crashed.");
        } finally {
            setTimeout(() => setIsReAuthing(false), 5000);
        }
    };

    const handleDedup = async () => {
        setIsDeduping(true);
        setDedupResult(null);
        try {
            const res = await clearDuplicatesAction();
            if (res.success) {
                setDedupResult(
                    res.deletedCount === 0
                        ? "✅ No duplicates found."
                        : `✅ Cleaned ${res.deletedCount} duplicate records.`
                );
            } else {
                setDedupResult("❌ Cleanup failed: " + res.error);
            }
        } catch (err) {
            setDedupResult("❌ Cleanup crashed.");
        } finally {
            setIsDeduping(false);
            // Auto-clear the message after 4 seconds
            setTimeout(() => setDedupResult(null), 4000);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2">
                <input
                    type="text"
                    placeholder="Search symbol…"
                    value={filter.search}
                    onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
                    className="bg-[#141414] border border-white/5 text-white text-sm px-3 py-1.5 rounded-lg outline-none focus:border-[#22d3ee]/40 placeholder-[#4a4a4a] w-36 transition-colors"
                />
                <div className="flex gap-1.5">
                    {(["ALL", "DRAFT", "VERIFIED", "SYNC"] as const).map((s) => (
                        <button key={s} className={chipClass(filter.status === s)} onClick={() => setFilter((p) => ({ ...p, status: s }))}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1.5">
                    {(["ALL", "BUY", "SELL"] as const).map((a) => (
                        <button key={a} className={chipClass(filter.action === a)} onClick={() => setFilter((p) => ({ ...p, action: a }))}>
                            {a}
                        </button>
                    ))}
                </div>
                <span className="ml-auto text-[#a3a3a3] text-xs font-medium bg-[#141414] px-3 py-1 rounded-full border border-white/5">
                    {filtered.length} trades
                </span>

                {/* Dedup Result Flash */}
                {dedupResult && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full border border-white/10 bg-[#141414] text-[#a3a3a3] transition-all">
                        {dedupResult}
                    </span>
                )}

                <button
                    onClick={handleDedup}
                    disabled={isDeduping}
                    className="flex items-center gap-1.5 bg-[#fb7185]/10 text-[#fb7185] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#fb7185]/20 transition-colors border border-[#fb7185]/20"
                    title="Remove old Myfxbook SYNC trades with no broker ticket or user notes"
                >
                    <Sparkles size={14} className={isDeduping ? "animate-pulse" : ""} />
                    {isDeduping ? "CLEANING..." : "CLEAR DUPES"}
                </button>

                <button
                    onClick={handleReAuth}
                    disabled={isReAuthing || isSyncing}
                    className="flex items-center gap-1.5 bg-[#a78bfa]/10 text-[#a78bfa] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#a78bfa]/20 transition-colors border border-[#a78bfa]/20"
                    title="Force re-authentication with iFXhub to fetch a fresh session token. Use when recent trades are missing."
                >
                    <RefreshCw size={14} className={isReAuthing ? "animate-spin" : ""} />
                    {isReAuthing ? "RE-AUTHING..." : "RE-AUTH"}
                </button>

                <button
                    onClick={handleSync}
                    disabled={isSyncing || isReAuthing}
                    className="flex items-center gap-1.5 bg-[#22d3ee]/10 text-[#22d3ee] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#22d3ee]/20 transition-colors border border-[#22d3ee]/20"
                >
                    <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "SYNCING..." : "FORCE SYNC"}
                </button>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-x-auto" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                <table className="w-full min-w-[1000px] relative group/table">
                    <thead style={{ background: "#0f0f0f" }}>
                        <tr>
                            <th className={thClass} onClick={() => toggleSort("symbol")}>Symbol</th>
                            <th className={thClass} onClick={() => toggleSort("action")}>Side</th>
                            <th className={thClass}>Entry</th>
                            <th className={thClass}>Close</th>
                            <th className={thClass} onClick={() => toggleSort("net_profit")}>Net P&L</th>
                            <th className={thClass}>Lots</th>
                            <th className={thClass} onClick={() => toggleSort("open_time")}>Open Time</th>
                            <th className={thClass} onClick={() => toggleSort("status")}>Status</th>
                            <th className={`${thClass} text-right`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={9} className="text-center text-[#a3a3a3] text-sm py-12">
                                    No trades found.
                                </td>
                            </tr>
                        )}
                        {filtered.map((trade) => {
                            const profit = getProfit(trade);
                            const isWin = profit != null && profit > 0;
                            const isLoss = profit != null && profit < 0;
                            const profitColor = isWin ? "#34d399" : isLoss ? "#fb7185" : "#a3a3a3";

                            return (
                                <tr
                                    key={trade.id}
                                    className="group transition-all hover:bg-[#1a1a1a]"
                                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                                >
                                    <td className="px-4 py-3 min-w-[100px]">
                                        <span className="text-white font-semibold text-sm">{trade.symbol ?? "—"}</span>
                                    </td>
                                    <td className="px-4 py-3 min-w-[110px]">
                                        {trade.action ? (
                                            <span className="flex items-center gap-1.5 text-xs font-bold"
                                                style={{ color: trade.action === "BUY" ? "#34d399" : "#fb7185" }}>
                                                {trade.action === "BUY"
                                                    ? <ArrowUpCircle size={12} />
                                                    : <ArrowDownCircle size={12} />}
                                                {trade.action}
                                            </span>
                                        ) : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-[#a3a3a3] text-sm font-mono min-w-[120px]">
                                        {trade.entry_price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono" style={{ color: profitColor }}>
                                        {trade.close_price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold tabular-nums" style={{ color: profitColor }}>
                                        {profit != null
                                            ? (profit >= 0 ? `+$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`)
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-[#a3a3a3] text-sm">
                                        {trade.lot_size ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-[#a3a3a3] text-xs whitespace-nowrap font-mono min-w-[160px]">
                                        {formatDate(trade.open_time ?? trade.created_at)}
                                    </td>
                                    <td className="px-4 py-3 w-[100px]"><StatusBadge status={trade.status} /></td>

                                    {/* Edit Controls */}
                                    <td className="px-4 py-3 text-right min-w-[140px]">
                                        <div className="flex items-center justify-end w-full h-full">
                                            <div className="flex items-center border border-white/10 rounded-md overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity bg-[#141414]">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); router.push(`/vault/${trade.id}`); }}
                                                className="p-1.5 px-2 text-[#a3a3a3] hover:text-[#22d3ee] hover:bg-[#22d3ee]/10 transition-colors border-r border-white/10"
                                                title="View Vault"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingTrade(trade); }}
                                                className="p-1.5 px-2 text-[#a3a3a3] hover:text-white hover:bg-white/10 transition-colors border-r border-white/10"
                                                title="Edit Trade"
                                            >
                                                <Edit2 size={13} />
                                            </button>
                                            
                                            {deletingId === trade.id ? (
                                                <div className="flex items-center">
                                                    <button 
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            try {
                                                                await deleteTradeAction(trade.id);
                                                            } catch (err) {
                                                                alert("Failed to delete trade.");
                                                            } finally {
                                                                setDeletingId(null);
                                                            }
                                                        }}
                                                        className="p-1 text-[10px] font-bold uppercase tracking-wider text-black bg-[#fb7185] hover:bg-red-400 px-2 transition-colors border-r border-white/10"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                                                        className="p-1 text-[#a3a3a3] hover:text-white hover:bg-white/10 px-2 transition-colors"
                                                        title="Cancel Delete"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDeletingId(trade.id); }}
                                                    className="p-1.5 px-2 text-[#a3a3a3] hover:text-[#fb7185] hover:bg-[#fb7185]/10 transition-colors"
                                                    title="Delete Trade"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {editingTrade && (
                <EditTradeModal 
                    trade={editingTrade} 
                    onClose={() => setEditingTrade(null)} 
                />
            )}
        </div>
    );
}
