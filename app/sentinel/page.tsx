import { getTrades, computeKPIs } from "@/lib/trades";
import KPICard from "@/components/KPICard";
import SyncButton from "@/components/SyncButton";
import { Brain, TrendingDown, AlertTriangle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SentinelPage() {
    const trades = await getTrades();
    const kpi = computeKPIs(trades);

    const drafts = trades.filter((t) => t.status === "DRAFT");
    const draftRatio = kpi.totalTrades > 0 ? (drafts.length / kpi.totalTrades) * 100 : 0;
    const missingAnalysis = trades.filter((t) => !t.ai_truth_note && t.status === "DRAFT").length;
    const avgRR =
        trades.filter((t) => t.risk_reward).length > 0
            ? trades.reduce((acc, t) => acc + (t.risk_reward ?? 0), 0) /
            trades.filter((t) => t.risk_reward).length
            : 0;

    const completionRate = Math.round(
        (kpi.verifiedCount / Math.max(kpi.totalTrades, 1)) * 100
    );

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">AI Sentinel</h1>
                    <p className="text-[#a3a3a3] text-sm mt-1">
                        Behavioral diagnostics and edge health monitoring.
                    </p>
                </div>
                <SyncButton />
            </div>

            {/* Diagnostics Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KPICard
                    label="Journal Discipline"
                    value={`${kpi.verifiedCount} / ${kpi.totalTrades}`}
                    sub={`${completionRate}% completion rate`}
                    icon={<Brain size={15} />}
                    accent={completionRate >= 60 ? "success" : "danger"}
                    delay={0}
                />
                <KPICard
                    label="Edge Decay Risk"
                    value={`${draftRatio.toFixed(0)}% Draft Rate`}
                    sub={`${drafts.length} trades un-verified`}
                    icon={<TrendingDown size={15} />}
                    accent={draftRatio < 30 ? "success" : draftRatio < 60 ? "warning" : "danger"}
                    delay={0.05}
                />
                <KPICard
                    label="Missing AI Analysis"
                    value={missingAnalysis}
                    sub="draft trades awaiting review"
                    icon={<AlertTriangle size={15} />}
                    accent={missingAnalysis === 0 ? "success" : missingAnalysis < 5 ? "warning" : "danger"}
                    delay={0.1}
                />
                <KPICard
                    label="Avg Risk / Reward"
                    value={avgRR.toFixed(2)}
                    sub={avgRR >= 1.5 ? "Healthy risk profile" : "Below optimal threshold"}
                    icon={<Clock size={15} />}
                    accent={avgRR >= 1.5 ? "success" : avgRR >= 1 ? "warning" : "danger"}
                    delay={0.15}
                />
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                    {
                        label: "Journal Discipline",
                        desc: "Percentage of trades with full VERIFIED entries. Below 60% signals journaling gaps.",
                    },
                    {
                        label: "Edge Decay Risk",
                        desc: "Draft trades signal emotional avoidance — trades taken but not reviewed.",
                    },
                    {
                        label: "Missing AI Analysis",
                        desc: "Draft trades with no AI truth note are blind spots in your behavioral dataset.",
                    },
                    {
                        label: "Avg Risk / Reward",
                        desc: "Average planned R:R. Below 1.5 signals over-risking on entries.",
                    },
                ].map(({ label, desc }) => (
                    <div
                        key={label}
                        className="rounded-xl px-4 py-3"
                        style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)",
                        }}
                    >
                        <p className="text-white text-xs font-semibold mb-1">{label}</p>
                        <p className="text-[#a3a3a3] text-xs leading-relaxed">{desc}</p>
                    </div>
                ))}
            </div>

            {/* Sentinel Insight */}
            <div
                className="rounded-xl p-5"
                style={{
                    background: "#141414",
                    border: "1px solid rgba(34,211,238,0.12)",
                }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <Brain size={14} className="text-[#22d3ee]" />
                    <p className="text-[#22d3ee] font-semibold text-sm">Sentinel Insight</p>
                </div>
                <p className="text-[#d4d4d4] text-sm leading-relaxed">
                    {kpi.winRate >= 55 && kpi.profitFactor >= 1.5
                        ? "Your edge is statistically sound. Focus on journaling discipline to maintain data quality for the AI analysis layer."
                        : kpi.winRate >= 45
                            ? "Marginal edge detected. Review your DRAFT trades — incomplete journaling hides behavioral patterns from analysis."
                            : "Edge degradation detected. A win rate below 45% combined with low profit factor suggests emotional execution bias. Complete your journal entries to enable deeper AI diagnostics."}
                </p>
            </div>
        </div>
    );
}
