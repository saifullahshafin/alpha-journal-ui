"use client";

import { useState } from "react";
import { Save, Loader2, Sparkles, MessageSquare, Zap, Cpu } from "lucide-react";
import { updateAISettingsAction } from "@/app/actions";
import type { AISettings } from "@/lib/settings";

export default function AISettingsForm({ initialSettings }: { initialSettings: AISettings }) {
    const [settings, setSettings] = useState<AISettings>(initialSettings);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaved(false);
        try {
            await updateAISettingsAction(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Failed to save settings. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-4xl">
            {/* System Prompt Section */}
            <div className="rounded-2xl p-6 relative overflow-hidden group transition-all duration-300"
                style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#22d3ee]/5 blur-[64px] rounded-full pointer-events-none group-hover:bg-[#22d3ee]/10 transition-colors" />
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#22d3ee]"
                         style={{ background: "rgba(34,211,238,0.1)" }}>
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">System Intelligence</h3>
                        <p className="text-[#a3a3a3] text-sm mt-0.5">Define exact behavioral constraints for The Scraper and Truth Agent.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest pl-1">Global System Prompt</span>
                        <textarea
                            value={settings.system_prompt}
                            onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
                            className="w-full mt-2 rounded-xl bg-[#0a0a0a] border border-white/10 p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#22d3ee]/50 transition-all min-h-[320px] leading-relaxed"
                            placeholder="Enter system prompt instructions..."
                        />
                    </label>
                </div>
            </div>

            {/* Hyperparameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Temperature */}
                <div className="rounded-2xl p-6"
                    style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#eab308]"
                             style={{ background: "rgba(234,179,8,0.1)" }}>
                            <Zap size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base">Inference Heat</h3>
                            <p className="text-[#a3a3a3] text-xs mt-0.5">Adjust logical creativity vs. precision.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest">Temperature</span>
                            <span className="text-[#eab308] font-mono font-bold text-sm bg-rgba(234,179,8,0.1) px-2 py-0.5 rounded border border-[#eab308]/20">{settings.temperature}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={settings.temperature}
                            onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-[#0a0a0a] rounded-lg appearance-none cursor-pointer accent-[#eab308]"
                        />
                        <div className="flex justify-between text-[10px] text-[#525252] font-bold px-1 tracking-tighter">
                            <span>BRUTAL PRECISION</span>
                            <span>CREATIVE INSIGHT</span>
                        </div>
                    </div>
                </div>

                {/* Hardware & Model */}
                <div className="rounded-2xl p-6"
                    style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#fb7185]"
                             style={{ background: "rgba(251,113,133,0.1)" }}>
                            <Cpu size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base">Compute Engine</h3>
                            <p className="text-[#a3a3a3] text-xs mt-0.5">Model selection and resource allocation.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest pl-1">Active Model</label>
                            <select
                                value={settings.model_name}
                                onChange={(e) => setSettings({ ...settings, model_name: e.target.value })}
                                className="w-full mt-2 rounded-xl bg-[#0a0a0a] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#fb7185]/50 appearance-none cursor-pointer"
                            >
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Optimized)</option>
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Analysis)</option>
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest pl-1">Max Response Tokens</label>
                            <input
                                type="number"
                                value={settings.max_tokens}
                                onChange={(e) => setSettings({ ...settings, max_tokens: parseInt(e.target.value) })}
                                className="w-full mt-2 rounded-xl bg-[#0a0a0a] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#fb7185]/50"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex items-center gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-[#22d3ee] hover:text-white transition-all duration-300 disabled:opacity-50 group shadow-lg shadow-white/5"
                >
                    {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Save size={18} className="group-hover:scale-110 transition-transform" />
                    )}
                    {loading ? "COMMITTING CHANGES..." : "SAVE CONFIGURATION"}
                </button>

                {saved && (
                    <div className="flex items-center gap-2 text-[#34d399] animate-in fade-in slide-in-from-left-4 duration-500">
                        <Sparkles size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Configuration Synced Successfully</span>
                    </div>
                )}
            </div>
        </form>
    );
}
