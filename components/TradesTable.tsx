"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Trade } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { ArrowUpCircle, ArrowDownCircle, Edit2, Check, X, RefreshCw } from "lucide-react";
import { updateTradeAction, triggerSyncAction } from "@/app/actions";

interface TradesTableProps {
    trades: Trade[];
}

type SortKey = "open_time" | "symbol" | "status" | "action" | "pips" | "net_profit";

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

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ symbol: string; action: string; entry_price: string; open_time: string }>({
        symbol: "", action: "", entry_price: "", open_time: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

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
    const inputClass = "bg-[#141414] border border-white/10 text-white text-xs px-2 py-1 rounded w-full outline-none focus:border-[#22d3ee]/50";

    const getPips = (t: Trade) => {
        if (t.pips != null) return t.pips;
        if (!t.close_price || !t.entry_price) return null;
        return t.action === "BUY"
            ? Math.round((t.close_price - t.entry_price) * 10) / 10
            : Math.round((t.entry_price - t.close_price) * 10) / 10;
    };

    const getProfit = (t: Trade) => t.net_profit ?? t.profit ?? null;

    const startEdit = (e: React.MouseEvent, t: Trade) => {
        e.stopPropagation();
        setEditingId(t.id);
        const ot = t.open_time ?? t.created_at;
        const localDtStr = ot ? new Date(ot).toISOString().slice(0, 16) : ""; // YYYY-MM-DDThh:mm format
        setEditValues({
            symbol: t.symbol ?? "",
            action: t.action === "BUY" || t.action === "SELL" ? t.action : "BUY",
            entry_price: t.entry_price?.toString() ?? "",
            open_time: localDtStr
        });
    };

    const cancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const saveEdit = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setIsSaving(true);
        try {
            // Reconstruct payload
            const updates = {
                symbol: editValues.symbol.trim().toUpperCase(),
                action: editValues.action.toUpperCase(),
                entry_price: parseFloat(editValues.entry_price) || null,
                open_time: editValues.open_time ? new Date(editValues.open_time).toISOString() : null
            };
            await updateTradeAction(id, updates);
            setEditingId(null);
        } catch (err) {
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await triggerSyncAction();
            if (!res?.success) alert("Sync failed: " + res?.error);
        } catch (err) {
            alert("Sync crashed.");
        } finally {
            setIsSyncing(false);
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

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 bg-[#22d3ee]/10 text-[#22d3ee] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#22d3ee]/20 transition-colors border border-[#22d3ee]/20 ml-2"
                >
                    <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "SYNCING..." : "FORCE SYNC"}
                </button>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                <table className="w-full relative group/table">
                    <thead style={{ background: "#0f0f0f" }}>
                        <tr>
                            <th className={thClass} onClick={() => toggleSort("symbol")}>Symbol</th>
                            <th className={thClass} onClick={() => toggleSort("action")}>Side</th>
                            <th className={thClass}>Entry</th>
                            <th className={thClass}>Close</th>
                            <th className={thClass} onClick={() => toggleSort("pips")}>Pips</th>
                            <th className={thClass} onClick={() => toggleSort("net_profit")}>Net P&L</th>
                            <th className={thClass}>Lots</th>
                            <th className={thClass} onClick={() => toggleSort("open_time")}>Open Time</th>
                            <th className={thClass} onClick={() => toggleSort("status")}>Status</th>
                            <th className={thClass}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={10} className="text-center text-[#a3a3a3] text-sm py-12">
                                    No trades found.
                                </td>
                            </tr>
                        )}
                        {filtered.map((trade) => {
                            const pips = getPips(trade);
                            const profit = getProfit(trade);
                            const isWin = pips != null && pips > 0;
                            const isLoss = pips != null && pips < 0;
                            const pipsColor = isWin ? "#34d399" : isLoss ? "#fb7185" : "#a3a3a3";

                            const isEditing = editingId === trade.id;

                            return (
                                <tr
                                    key={trade.id}
                                    onClick={() => !isEditing && router.push(`/vault/${trade.id}`)}
                                    className={`group transition-all ${isEditing ? "bg-[#141414]" : "hover:bg-[#1a1a1a] cursor-pointer"}`}
                                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                                >
                                    <td className="px-4 py-3 min-w-[100px]">
                                        {isEditing ? (
                                            <input
                                                value={editValues.symbol}
                                                onChange={(e) => setEditValues({ ...editValues, symbol: e.target.value })}
                                                className={inputClass} placeholder="BTCUSD"
                                            />
                                        ) : (
                                            <span className="text-white font-semibold text-sm">{trade.symbol ?? "—"}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 min-w-[110px]">
                                        {isEditing ? (
                                            <select
                                                value={editValues.action}
                                                onChange={(e) => setEditValues({ ...editValues, action: e.target.value })}
                                                className={inputClass}
                                            >
                                                <option value="BUY">BUY</option>
                                                <option value="SELL">SELL</option>
                                            </select>
                                        ) : trade.action ? (
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
                                        {isEditing ? (
                                            <input
                                                type="number" step="0.01"
                                                value={editValues.entry_price}
                                                onChange={(e) => setEditValues({ ...editValues, entry_price: e.target.value })}
                                                className={inputClass} placeholder="1.0500"
                                            />
                                        ) : trade.entry_price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono" style={{ color: pipsColor }}>
                                        {trade.close_price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold tabular-nums" style={{ color: pipsColor }}>
                                        {pips != null ? (pips > 0 ? `+${pips}` : `${pips}`) : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold tabular-nums" style={{ color: pipsColor }}>
                                        {profit != null
                                            ? (profit >= 0 ? `+$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`)
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-[#a3a3a3] text-sm">
                                        {trade.lot_size ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-[#a3a3a3] text-xs whitespace-nowrap font-mono min-w-[160px]">
                                        {isEditing ? (
                                            <input
                                                type="datetime-local"
                                                value={editValues.open_time}
                                                onChange={(e) => setEditValues({ ...editValues, open_time: e.target.value })}
                                                className={inputClass}
                                            />
                                        ) : formatDate(trade.open_time ?? trade.created_at)}
                                    </td>
                                    <td className="px-4 py-3 w-[100px]"><StatusBadge status={trade.status} /></td>

                                    {/* Edit Controls */}
                                    <td className="px-4 py-3 text-right h-12 flex items-center justify-end w-[80px]">
                                        {isEditing ? (
                                            <div className="flex gap-1 bg-[#1a1a1a] p-1 rounded-md border border-white/10">
                                                <button onClick={cancelEdit} className="p-1 text-[#fb7185] hover:bg-[#fb7185]/20 rounded transition-colors" title="Cancel">
                                                    <X size={14} />
                                                </button>
                                                <button onClick={(e) => saveEdit(e, trade.id)} disabled={isSaving} className="p-1 text-[#34d399] hover:bg-[#34d399]/20 rounded transition-colors" title="Save">
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        ) : trade.status === "DRAFT" ? (
                                            <button
                                                onClick={(e) => startEdit(e, trade)}
                                                className="p-1.5 text-[#a3a3a3] hover:text-white rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-white/10"
                                            >
                                                <Edit2 size={13} />
                                            </button>
                                        ) : null}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
