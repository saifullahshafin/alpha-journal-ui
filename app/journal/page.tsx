import { getTrades } from "@/lib/trades";
import TradesTable from "@/components/TradesTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function JournalPage() {
    const trades = await getTrades();

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Journal History</h1>
                <p className="text-[#a3a3a3] text-sm mt-1">All trades — click a row to inspect in The Vault.</p>
            </div>
            <TradesTable trades={trades} />
        </div>
    );
}
