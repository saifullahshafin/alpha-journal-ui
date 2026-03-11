import { getSystemLogs } from "@/lib/trades";
import LogTerminal from "@/components/LogTerminal";
import { Database, RefreshCw, Eye } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface StatusCardProps {
    label: string;
    status: "ACTIVE" | "ONLINE" | "STANDBY" | "OFFLINE";
    description: string;
    icon: React.ReactNode;
}

function StatusCard({ label, status, description, icon }: StatusCardProps) {
    const statusColors: Record<string, { color: string; bg: string; pulse: string }> = {
        ACTIVE: { color: "#34d399", bg: "rgba(52,211,153,0.1)", pulse: "#34d399" },
        ONLINE: { color: "#22d3ee", bg: "rgba(34,211,238,0.1)", pulse: "#22d3ee" },
        STANDBY: { color: "#eab308", bg: "rgba(234,179,8,0.1)", pulse: "#eab308" },
        OFFLINE: { color: "#fb7185", bg: "rgba(251,113,133,0.1)", pulse: "#fb7185" },
    };
    const { color, bg, pulse } = statusColors[status];

    return (
        <div className="rounded-xl p-5"
            style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[#a3a3a3]"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    {icon}
                </div>
                <div>
                    <p className="text-white font-semibold text-sm">{label}</p>
                    <p className="text-[#a3a3a3] text-xs">{description}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: pulse }} />
                    <span className="text-xs font-bold" style={{ color }}>{status}</span>
                </div>
            </div>
        </div>
    );
}

export default async function HealthPage() {
    const logs = await getSystemLogs();

    const errorCount = logs.filter((l) => l.severity === "ERROR" || l.severity === "CRITICAL").length;
    const warningCount = logs.filter((l) => l.severity === "WARNING").length;

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">System Health</h1>
                <p className="text-[#a3a3a3] text-sm mt-1">
                    Live infrastructure status and system log terminal.
                    {errorCount > 0 && (
                        <span className="text-[#fb7185] ml-2">⚠ {errorCount} error{errorCount !== 1 ? "s" : ""} detected</span>
                    )}
                </p>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard
                    label="Supabase"
                    status="ACTIVE"
                    description="Database & Auth"
                    icon={<Database size={16} />}
                />
                <StatusCard
                    label="Sync Engine"
                    status="ONLINE"
                    description="Modal Myfxbook Cron"
                    icon={<RefreshCw size={16} />}
                />
                <StatusCard
                    label="Vision Agent"
                    status="STANDBY"
                    description="Gemini 2.5 Flash"
                    icon={<Eye size={16} />}
                />
            </div>

            {/* Log summary chips */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[#a3a3a3] text-xs font-medium uppercase tracking-widest">Log Summary:</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ color: "#34d399", background: "rgba(52,211,153,0.1)" }}>
                    {logs.filter((l) => l.severity === "INFO").length} INFO
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ color: "#eab308", background: "rgba(234,179,8,0.1)" }}>
                    {warningCount} WARNING
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ color: "#fb7185", background: "rgba(251,113,133,0.1)" }}>
                    {errorCount} ERROR/CRITICAL
                </span>
                <span className="ml-auto text-[#a3a3a3] text-xs">{logs.length} total entries</span>
            </div>

            {/* Log Terminal */}
            <div>
                <p className="text-white font-semibold text-sm mb-3">System Logs</p>
                <LogTerminal logs={logs} />
            </div>
        </div>
    );
}
