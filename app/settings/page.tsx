import { getAISettings } from "@/lib/settings";
import AISettingsForm from "@/components/AISettingsForm";
import SyncProviderPanel from "@/components/SyncProviderPanel";
import { Settings as SettingsIcon, BrainCircuit } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
    const initialSettings = await getAISettings();

    if (!initialSettings) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-[#a3a3a3] gap-4">
                <BrainCircuit size={48} className="opacity-20 translate-y-2 animate-pulse" />
                <p className="text-sm font-medium tracking-wide">Failed to initialize AI Settings layer.</p>
                <p className="text-xs opacity-50">Please verify Supabase connection and table migration status.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="relative">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <SettingsIcon size={24} className="text-[#22d3ee]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter">AI AGENT SETTINGS</h1>
                        <p className="text-[#a3a3a3] text-sm font-medium tracking-wide flex items-center gap-2">
                            Infrastructure control for core generative logic 
                            <span className="flex items-center gap-1.5 bg-[#22d3ee]/10 text-[#22d3ee] px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-[#22d3ee]/20">
                                <span className="w-1 h-1 rounded-full bg-[#22d3ee] animate-pulse" />
                                Protocol 4: Active
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Sync Provider Control — Data Source Section */}
            <div className="relative z-10">
                <SyncProviderPanel
                    initialSource={(initialSettings.sync_source ?? "ifxhub") as "ifxhub" | "myfxbook"}
                    initialTokenExpiry={initialSettings.ifxhub_token_expiry ?? null}
                />
            </div>

            {/* AI Agent Settings Form */}
            <div className="relative z-10">
                <AISettingsForm initialSettings={initialSettings} />
            </div>

            {/* Background Aesthetic */}
            <div className="fixed top-0 right-0 -z-10 w-[800px] h-[800px] pointer-events-none opacity-20"
                style={{ 
                    background: "radial-gradient(circle at center, #22d3ee33 0%, transparent 70%)",
                    filter: "blur(120px)"
                }} />
        </div>
    );
}
