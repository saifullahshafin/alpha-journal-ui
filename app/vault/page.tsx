import { getTrades } from "@/lib/trades";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowRight, Shield } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VaultPage() {
    const trades = await getTrades();

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">The Vault</h1>
                <p className="text-[#a3a3a3] text-sm mt-1">Select a trade to inspect chart screenshots, AI analysis, and execution data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {trades.length === 0 && (
                    <div className="col-span-3 text-center text-[#a3a3a3] text-sm py-16">
                        No trades in the vault yet.
                    </div>
                )}
                {trades.map((trade) => (
                    <Link key={trade.id} href={`/vault/${trade.id}`}
                        className="rounded-xl p-4 flex flex-col gap-3 group transition-all duration-200 hover:scale-[1.02]"
                        style={{
                            background: "#141414",
                            border: "1px solid rgba(255,255,255,0.05)",
                        }}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-white font-bold text-base">{trade.symbol ?? "Unknown"}</p>
                                <p className="text-[#a3a3a3] text-xs mt-0.5">
                                    {new Date(trade.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                            </div>
                            <StatusBadge status={trade.status} />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <p className="text-[#a3a3a3]">Action</p>
                                <p style={{ color: trade.action === "BUY" ? "#34d399" : trade.action === "SELL" ? "#fb7185" : "#a3a3a3" }}
                                    className="font-semibold mt-0.5">{trade.action ?? "—"}</p>
                            </div>
                            <div>
                                <p className="text-[#a3a3a3]">Entry</p>
                                <p className="text-white font-medium mt-0.5">{trade.entry_price?.toFixed(5) ?? "—"}</p>
                            </div>
                            <div>
                                <p className="text-[#a3a3a3]">R:R</p>
                                <p className="text-white font-medium mt-0.5">{trade.risk_reward ?? "—"}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Shield size={11} className="text-[#a3a3a3]" />
                                <p className="text-[#a3a3a3] text-[11px]">
                                    {trade.image_urls?.length ?? 0} screenshot{(trade.image_urls?.length ?? 0) !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <ArrowRight size={13} className="text-[#a3a3a3] group-hover:text-[#22d3ee] transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
