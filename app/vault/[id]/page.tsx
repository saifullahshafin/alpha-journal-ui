import { getTradeById, getTrades } from "@/lib/trades";
import { notFound } from "next/navigation";
import MasonryGallery from "@/components/MasonryGallery";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { ArrowLeft, Bot, User, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
    const trades = await getTrades();
    return trades.map((t) => ({ id: t.id }));
}

interface Props {
    params: Promise<{ id: string }>;
}

export default async function VaultDetailPage({ params }: Props) {
    const { id } = await params;
    const trade = await getTradeById(id);

    if (!trade) return notFound();

    const pips =
        trade.close_price && trade.entry_price
            ? trade.action === "BUY"
                ? (trade.close_price - trade.entry_price) * 10000
                : (trade.entry_price - trade.close_price) * 10000
            : null;

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Back nav */}
            <Link href="/vault" className="flex items-center gap-2 text-[#a3a3a3] hover:text-white text-sm transition-colors w-fit">
                <ArrowLeft size={14} />
                Back to The Vault
            </Link>

            {/* Trade header */}
            <div className="rounded-xl p-5"
                style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">{trade.symbol ?? "Unknown"}</h1>
                            <StatusBadge status={trade.status} />
                            {trade.action && (
                                <span className="text-sm font-bold px-2 py-0.5 rounded-md"
                                    style={{
                                        color: trade.action === "BUY" ? "#34d399" : "#fb7185",
                                        background: trade.action === "BUY" ? "rgba(52,211,153,0.1)" : "rgba(251,113,133,0.1)"
                                    }}>
                                    {trade.action}
                                </span>
                            )}
                        </div>
                        <p className="text-[#a3a3a3] text-sm mt-1">
                            {new Date(trade.created_at).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>
                    {pips !== null && (
                        <div className="text-right">
                            <p className="text-[#a3a3a3] text-xs uppercase tracking-wider">Result</p>
                            <p className="text-2xl font-bold mt-0.5" style={{ color: pips >= 0 ? "#34d399" : "#fb7185" }}>
                                {pips >= 0 ? "+" : ""}{Math.round(pips)} pips
                            </p>
                        </div>
                    )}
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-5 pt-5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    {[
                        { label: "Lot Size", value: trade.lot_size },
                        { label: "Entry", value: trade.entry_price?.toFixed(5) },
                        { label: "Stop Loss", value: trade.stop_price?.toFixed(5), danger: true },
                        { label: "Take Profit", value: trade.take_profit?.toFixed(5), success: true },
                        { label: "Close Price", value: trade.close_price?.toFixed(5) },
                        { label: "Risk/Reward", value: trade.risk_reward, icon: TrendingUp },
                    ].map(({ label, value, danger, success }) => (
                        <div key={label}>
                            <p className="text-[#a3a3a3] text-[10px] uppercase tracking-widest">{label}</p>
                            <p className="text-white font-semibold text-sm mt-1"
                                style={{ color: danger ? "#fb7185" : success ? "#34d399" : undefined }}>
                                {value ?? "—"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Screenshot Gallery */}
            <div>
                <p className="text-white font-semibold text-sm mb-3">Chart Screenshots</p>
                <MasonryGallery images={trade.image_urls ?? []} />
            </div>

            {/* Side-by-side analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Trader Sentiment */}
                <div className="rounded-xl p-5"
                    style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5">
                            <User size={13} className="text-[#a3a3a3]" />
                        </div>
                        <p className="text-white font-semibold text-sm">Trader Sentiment</p>
                    </div>
                    <p className="text-[#a3a3a3] text-sm leading-relaxed">
                        {trade.user_notes || "No notes provided for this trade."}
                    </p>
                </div>

                {/* AI Market Truth */}
                <div className="rounded-xl p-5"
                    style={{ background: "#141414", border: "1px solid rgba(34,211,238,0.15)" }}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(34,211,238,0.1)" }}>
                            <Bot size={13} className="text-[#22d3ee]" />
                        </div>
                        <p className="font-semibold text-sm" style={{ color: "#22d3ee" }}>AI Market Truth</p>
                    </div>
                    <p className="text-[#d4d4d4] text-sm leading-relaxed">
                        {trade.ai_truth_note || "No AI analysis available for this trade."}
                    </p>
                </div>
            </div>
        </div>
    );
}
