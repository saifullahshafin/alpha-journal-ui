"use client";

import { useTransition, useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Zap, Radio } from "lucide-react";

interface SyncButtonProps {
    initialSource?: "ifxhub" | "myfxbook";
}

export default function SyncButton({ initialSource = "ifxhub" }: SyncButtonProps) {
    const [isPending, startTransition]   = useTransition();
    const [isToggling, startToggling]    = useTransition();
    const [result, setResult]            = useState<"idle" | "success" | "error">("idle");
    const [source, setSource]            = useState<"ifxhub" | "myfxbook">(initialSource);

    const handleSync = () => {
        startTransition(async () => {
            setResult("idle");
            try {
                const { triggerSyncAction } = await import("@/app/actions");
                const res = await triggerSyncAction();
                setResult(res.success ? "success" : "error");
            } catch {
                setResult("error");
            }
            setTimeout(() => setResult("idle"), 5000);
        });
    };

    const handleToggle = (newSource: "ifxhub" | "myfxbook") => {
        if (newSource === source || isToggling || isPending) return;
        startToggling(async () => {
            const { setSyncSourceAction } = await import("@/app/actions");
            await setSyncSourceAction(newSource);
            setSource(newSource);
        });
    };

    const isIfxhub = source === "ifxhub";

    return (
        <div className="flex flex-col items-start gap-3">
            {/* Provider Toggle */}
            <div
                className="flex items-center gap-1 p-1 rounded-lg"
                style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <button
                    onClick={() => handleToggle("ifxhub")}
                    disabled={isToggling || isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
                    style={{
                        background: isIfxhub ? "linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)" : "transparent",
                        color: isIfxhub ? "#000" : "#a3a3a3",
                        boxShadow: isIfxhub ? "0 0 12px rgba(34,211,238,0.25)" : "none",
                    }}
                >
                    <Zap size={11} />
                    iFXhub (Live)
                </button>
                <button
                    onClick={() => handleToggle("myfxbook")}
                    disabled={isToggling || isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
                    style={{
                        background: !isIfxhub ? "rgba(251,113,133,0.15)" : "transparent",
                        color: !isIfxhub ? "#fb7185" : "#a3a3a3",
                        border: !isIfxhub ? "1px solid rgba(251,113,133,0.2)" : "1px solid transparent",
                    }}
                >
                    <Radio size={11} />
                    Myfxbook (Legacy)
                </button>
            </div>

            {/* Force Sync Button */}
            <button
                onClick={handleSync}
                disabled={isPending || isToggling}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-60"
                style={{
                    background: isPending
                        ? "rgba(34,211,238,0.1)"
                        : isIfxhub
                            ? "linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)"
                            : "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)",
                    color: isPending ? "#22d3ee" : "#000",
                    border: "1px solid rgba(34,211,238,0.3)",
                    boxShadow: isPending ? "none" : isIfxhub ? "0 0 20px rgba(34,211,238,0.2)" : "0 0 20px rgba(251,113,133,0.2)",
                }}
            >
                <RefreshCw size={15} className={isPending ? "animate-spin" : ""} />
                {isPending
                    ? `Syncing ${isIfxhub ? "iFXhub" : "Myfxbook"}…`
                    : `Force Sync ${isIfxhub ? "iFXhub" : "Myfxbook"}`}
            </button>

            {result === "success" && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#34d399]">
                    <CheckCircle size={13} />
                    {isIfxhub ? "IFXhub sync triggered — live data incoming." : "Myfxbook sync triggered."}
                </div>
            )}
            {result === "error" && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#fb7185]">
                    <AlertCircle size={13} />
                    Sync failed. Check System Health tab.
                </div>
            )}
        </div>
    );
}
