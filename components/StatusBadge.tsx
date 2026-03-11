import type { TradeStatus, SystemLogSeverity } from "@/lib/types";

const statusConfig: Record<TradeStatus, { label: string; color: string; bg: string }> = {
    DRAFT: {
        label: "DRAFT",
        color: "#eab308",
        bg: "rgba(234, 179, 8, 0.1)",
    },
    VERIFIED: {
        label: "VERIFIED",
        color: "#34d399",
        bg: "rgba(52, 211, 153, 0.1)",
    },
    SYNC: {
        label: "SYNC",
        color: "#22d3ee",
        bg: "rgba(34, 211, 238, 0.1)",
    },
};

const severityConfig: Record<SystemLogSeverity, { color: string; bg: string }> = {
    INFO: { color: "#a3a3a3", bg: "rgba(255,255,255,0.07)" },
    WARNING: { color: "#eab308", bg: "rgba(234,179,8,0.1)" },
    ERROR: { color: "#fb7185", bg: "rgba(251,113,133,0.1)" },
    CRITICAL: { color: "#f43f5e", bg: "rgba(244,63,94,0.15)" },
};

export function StatusBadge({ status }: { status: TradeStatus }) {
    const { label, color, bg } = statusConfig[status];
    return (
        <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase"
            style={{ color, background: bg }}
        >
            {label}
        </span>
    );
}

export function SeverityBadge({ severity }: { severity: SystemLogSeverity }) {
    const { color, bg } = severityConfig[severity];
    return (
        <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase"
            style={{ color, background: bg }}
        >
            {severity}
        </span>
    );
}
