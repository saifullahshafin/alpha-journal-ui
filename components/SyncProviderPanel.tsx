"use client";

import { useState, useTransition } from "react";
import { Database, Zap, Radio, RefreshCw, Check, AlertTriangle, Shield, Clock } from "lucide-react";
import { setSyncSourceAction, triggerSyncAction } from "@/app/actions";

interface SyncProviderPanelProps {
    initialSource: "ifxhub" | "myfxbook";
    initialTokenExpiry?: string | null;
}

export default function SyncProviderPanel({ initialSource, initialTokenExpiry }: SyncProviderPanelProps) {
    const [source, setSource] = useState<"ifxhub" | "myfxbook">(initialSource);
    const [syncResult, setSyncResult] = useState<"idle" | "success" | "error">("idle");
    const [isToggling, startToggling] = useTransition();
    const [isSyncing, startSyncing] = useTransition();

    const handleProviderChange = (next: "ifxhub" | "myfxbook") => {
        if (next === source || isToggling) return;
        startToggling(async () => {
            await setSyncSourceAction(next);
            setSource(next);
        });
    };

    const handleManualSync = () => {
        startSyncing(async () => {
            setSyncResult("idle");
            try {
                const res = await triggerSyncAction();
                setSyncResult(res.success ? "success" : "error");
            } catch {
                setSyncResult("error");
            }
            setTimeout(() => setSyncResult("idle"), 5000);
        });
    };

    const isIfxhub = source === "ifxhub";

    const tokenExpiry = initialTokenExpiry ? new Date(initialTokenExpiry) : null;
    const tokenValid = tokenExpiry ? tokenExpiry > new Date() : false;
    const daysLeft = tokenExpiry
        ? Math.ceil((tokenExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div
            className="rounded-2xl p-6 space-y-6 relative overflow-hidden"
            style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}
        >
            {/* Glow accent */}
            <div
                className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{
                    background: isIfxhub
                        ? "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)"
                        : "radial-gradient(circle, rgba(251,113,133,0.06) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />

            {/* Header */}
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(34,211,238,0.1)" }}
                >
                    <Database size={20} className="text-[#22d3ee]" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Data Source Control</h3>
                    <p className="text-[#a3a3a3] text-sm mt-0.5">Select and manage the active broker sync engine.</p>
                </div>
            </div>

            {/* Provider Toggle */}
            <div className="space-y-2">
                <span className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest pl-1">Active Sync Provider</span>
                <div
                    className="flex items-center gap-1 p-1 rounded-xl w-fit"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                    <button
                        onClick={() => handleProviderChange("ifxhub")}
                        disabled={isToggling || isSyncing}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-60"
                        style={{
                            background: isIfxhub
                                ? "linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)"
                                : "transparent",
                            color: isIfxhub ? "#000" : "#a3a3a3",
                            boxShadow: isIfxhub ? "0 0 16px rgba(34,211,238,0.3)" : "none",
                        }}
                    >
                        <Zap size={14} />
                        iFXhub — Live
                        {isIfxhub && (
                            <span
                                className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                                style={{ background: "rgba(0,0,0,0.25)", color: "#000" }}
                            >
                                ACTIVE
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => handleProviderChange("myfxbook")}
                        disabled={isToggling || isSyncing}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-60"
                        style={{
                            background: !isIfxhub
                                ? "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)"
                                : "transparent",
                            color: !isIfxhub ? "#fff" : "#a3a3a3",
                            boxShadow: !isIfxhub ? "0 0 16px rgba(251,113,133,0.3)" : "none",
                        }}
                    >
                        <Radio size={14} />
                        Myfxbook — Legacy
                        {!isIfxhub && (
                            <span
                                className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
                            >
                                ACTIVE
                            </span>
                        )}
                    </button>
                </div>
                {isToggling && (
                    <p className="text-xs text-[#a3a3a3] pl-1 animate-pulse">Saving provider preference…</p>
                )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* IFXhub card */}
                <div
                    className="rounded-xl p-4 flex flex-col gap-2 transition-all duration-200"
                    style={{
                        background: isIfxhub ? "rgba(34,211,238,0.04)" : "rgba(255,255,255,0.02)",
                        border: isIfxhub ? "1px solid rgba(34,211,238,0.15)" : "1px solid rgba(255,255,255,0.05)",
                    }}
                >
                    <div className="flex items-center gap-2">
                        <Zap size={13} className={isIfxhub ? "text-[#22d3ee]" : "text-[#525252]"} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isIfxhub ? "text-[#22d3ee]" : "text-[#525252]"}`}>
                            iFXhub
                        </span>
                    </div>
                    <ul className="space-y-1 mt-1">
                        {["Real-time sync (sub-second)", "True broker ticket IDs", "Live floating PnL", "15-min auto-schedule"].map((f) => (
                            <li key={f} className="flex items-center gap-2 text-[11px] text-[#a3a3a3]">
                                <div className={`w-1 h-1 rounded-full flex-shrink-0 ${isIfxhub ? "bg-[#22d3ee]" : "bg-[#404040]"}`} />
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Myfxbook card */}
                <div
                    className="rounded-xl p-4 flex flex-col gap-2 transition-all duration-200"
                    style={{
                        background: !isIfxhub ? "rgba(251,113,133,0.04)" : "rgba(255,255,255,0.02)",
                        border: !isIfxhub ? "1px solid rgba(251,113,133,0.15)" : "1px solid rgba(255,255,255,0.05)",
                    }}
                >
                    <div className="flex items-center gap-2">
                        <Radio size={13} className={!isIfxhub ? "text-[#fb7185]" : "text-[#525252]"} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${!isIfxhub ? "text-[#fb7185]" : "text-[#525252]"}`}>
                            Myfxbook
                        </span>
                    </div>
                    <ul className="space-y-1 mt-1">
                        {["Legacy REST API", "15–60 min delay", "Public open endpoint", "Fallback / Backup"].map((f) => (
                            <li key={f} className="flex items-center gap-2 text-[11px] text-[#a3a3a3]">
                                <div className={`w-1 h-1 rounded-full flex-shrink-0 ${!isIfxhub ? "bg-[#fb7185]" : "bg-[#404040]"}`} />
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Session Token Status (IFXhub only) */}
            <div
                className="rounded-xl p-4 flex items-center justify-between gap-4"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
                <div className="flex items-center gap-3">
                    <Shield size={14} className={tokenValid ? "text-[#34d399]" : "text-[#fb7185]"} />
                    <div>
                        <p className="text-xs font-bold text-white">IFXhub Session Token</p>
                        <p className="text-[11px] text-[#a3a3a3] mt-0.5">
                            {tokenValid
                                ? `Valid — expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
                                : initialTokenExpiry
                                ? "Expired — will refresh automatically on next sync"
                                : "Not yet generated — will auto-generate on first sync"}
                        </p>
                    </div>
                </div>
                <div
                    className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                    style={{
                        background: tokenValid ? "rgba(52,211,153,0.1)" : "rgba(251,113,133,0.1)",
                        color: tokenValid ? "#34d399" : "#fb7185",
                        border: `1px solid ${tokenValid ? "rgba(52,211,153,0.2)" : "rgba(251,113,133,0.2)"}`,
                    }}
                >
                    {tokenValid ? "VALID" : "PENDING"}
                </div>
            </div>

            {/* Sync Schedule Info */}
            <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
                <Clock size={14} className="text-[#a3a3a3] flex-shrink-0" />
                <p className="text-[11px] text-[#a3a3a3] leading-relaxed">
                    {isIfxhub
                        ? "IFXhub syncs automatically every 15 minutes via a Modal scheduled job. Force sync overrides this and runs immediately."
                        : "Myfxbook syncs once daily via a Modal cron job. Force sync triggers the legacy engine immediately."}
                </p>
            </div>

            {/* Manual Force Sync */}
            <div className="flex items-center gap-4 pt-2">
                <button
                    onClick={handleManualSync}
                    disabled={isSyncing || isToggling}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50"
                    style={{
                        background: isIfxhub
                            ? "linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)"
                            : "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)",
                        color: "#000",
                        boxShadow: isIfxhub
                            ? "0 0 20px rgba(34,211,238,0.2)"
                            : "0 0 20px rgba(251,113,133,0.2)",
                    }}
                >
                    <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Triggering Sync…" : `Force Sync Now`}
                </button>
                {syncResult === "success" && (
                    <div className="flex items-center gap-2 text-[#34d399] text-xs font-bold">
                        <Check size={13} /> Sync job dispatched successfully.
                    </div>
                )}
                {syncResult === "error" && (
                    <div className="flex items-center gap-2 text-[#fb7185] text-xs font-bold">
                        <AlertTriangle size={13} /> Sync failed. Check System Health.
                    </div>
                )}
            </div>
        </div>
    );
}
