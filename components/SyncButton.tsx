"use client";

import { useTransition, useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const MODAL_WEBHOOK_URL = process.env.NEXT_PUBLIC_MODAL_WEBHOOK_URL ?? "";

export default function SyncButton() {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<"idle" | "success" | "error">("idle");

    const handleSync = () => {
        startTransition(async () => {
            setResult("idle");
            try {
                if (!MODAL_WEBHOOK_URL) {
                    // Demo mode — simulate success if no webhook configured
                    await new Promise((r) => setTimeout(r, 1800));
                    setResult("success");
                    setTimeout(() => setResult("idle"), 4000);
                    return;
                }
                const res = await fetch(MODAL_WEBHOOK_URL, { method: "POST" });
                if (res.ok) {
                    setResult("success");
                } else {
                    setResult("error");
                }
            } catch {
                setResult("error");
            }
            setTimeout(() => setResult("idle"), 4000);
        });
    };

    return (
        <div className="flex flex-col items-start gap-3">
            <button
                onClick={handleSync}
                disabled={isPending}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-60"
                style={{
                    background: isPending
                        ? "rgba(34,211,238,0.1)"
                        : "linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)",
                    color: isPending ? "#22d3ee" : "#000",
                    border: "1px solid rgba(34,211,238,0.3)",
                    boxShadow: isPending ? "none" : "0 0 20px rgba(34,211,238,0.2)",
                }}
            >
                <RefreshCw size={15} className={isPending ? "animate-spin" : ""} />
                {isPending ? "Syncing Myfxbook…" : "Force Sync Myfxbook"}
            </button>

            {result === "success" && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#34d399]">
                    <CheckCircle size={13} />
                    Sync triggered successfully.
                </div>
            )}
            {result === "error" && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#fb7185]">
                    <AlertCircle size={13} />
                    Sync failed. Check System Health.
                </div>
            )}
        </div>
    );
}
