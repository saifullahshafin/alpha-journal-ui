"use client";

import type { SystemLog } from "@/lib/types";
import { SeverityBadge } from "./StatusBadge";

export default function LogTerminal({ logs }: { logs: SystemLog[] }) {
    if (logs.length === 0) {
        return (
            <div
                className="rounded-xl p-4 text-sm font-mono text-[#a3a3a3]"
                style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.05)" }}
            >
                — No system logs available —
            </div>
        );
    }

    return (
        <div
            className="rounded-xl overflow-auto max-h-96 font-mono text-xs"
            style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)" }}
        >
            {logs.map((log, i) => (
                <div
                    key={log.id}
                    className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.03]"
                    style={{ borderBottom: i < logs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                    <SeverityBadge severity={log.severity} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[#22d3ee] text-[10px] font-medium">[{log.component}]</span>
                        </div>
                        <p className="text-[#d4d4d4] text-[11px] leading-relaxed break-words">{log.message}</p>
                        {log.stack_trace && (
                            <details className="mt-1">
                                <summary className="text-[#4a4a4a] text-[10px] cursor-pointer hover:text-[#a3a3a3]">Stack trace</summary>
                                <pre className="text-[#4a4a4a] text-[10px] mt-1 whitespace-pre-wrap break-words">{log.stack_trace}</pre>
                            </details>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
