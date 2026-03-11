import { getTrades, computeKPIs } from "@/lib/trades";
import KPICard from "@/components/KPICard";
import PerformanceCurve from "@/components/PerformanceCurve";
import PnLCalendar from "@/components/PnLCalendar";
import { TrendingUp, DollarSign, Target, BarChart2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const trades = await getTrades();
  const kpi = computeKPIs(trades);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-[#a3a3a3] text-sm mt-1">
          {kpi.totalTrades} trades tracked —
          <span className="text-[#34d399] ml-1">{kpi.verifiedCount} Verified</span>
          <span className="text-[#eab308] ml-2">{kpi.draftCount} Draft</span>
          <span className="text-[#22d3ee] ml-2">{kpi.syncCount} Sync</span>
        </p>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Trades"
          value={kpi.totalTrades}
          sub={`${kpi.closedTrades} with close data`}
          icon={<BarChart2 size={15} />}
          accent="default"
          delay={0}
        />
        <KPICard
          label="Net Profit"
          value={kpi.netProfit >= 0 ? `+$${kpi.netProfit.toFixed(2)}` : `-$${Math.abs(kpi.netProfit).toFixed(2)}`}
          sub={`${kpi.netPips >= 0 ? "+" : ""}${kpi.netPips} pips`}
          icon={<DollarSign size={15} />}
          accent={kpi.netProfit >= 0 ? "success" : "danger"}
          delay={0.05}
        />
        <KPICard
          label="Win Rate"
          value={`${kpi.winRate}%`}
          sub={`of ${kpi.closedTrades} closed trades`}
          icon={<Target size={15} />}
          accent={kpi.winRate >= 50 ? "success" : "danger"}
          delay={0.1}
        />
        <KPICard
          label="Profit Factor"
          value={kpi.profitFactor.toFixed(2)}
          sub="sum wins / sum losses"
          icon={<TrendingUp size={15} />}
          accent={kpi.profitFactor >= 1.5 ? "success" : kpi.profitFactor >= 1 ? "warning" : "danger"}
          delay={0.15}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Performance Curve */}
        <div
          className="rounded-xl p-5 w-full"
          style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold text-sm">Performance Curve</p>
            <p className="text-[#a3a3a3] text-xs">Cumulative net pips</p>
          </div>
          <PerformanceCurve trades={trades} />
        </div>

        {/* Calendar */}
        <div
          className="rounded-xl p-5 w-full"
          style={{ background: "#101010", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-white font-semibold text-base tracking-tight">Performance calendar</h2>
            <div className="text-[#a3a3a3] bg-white/5 rounded-full p-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
            </div>
          </div>
          <PnLCalendar trades={trades} />
        </div>
      </div>
    </div>
  );
}
