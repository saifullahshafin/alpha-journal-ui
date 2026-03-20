"use client";

import { useState, useTransition } from "react";
import { User, Mail, Hash, Save, Check } from "lucide-react";
import { updateAISettingsAction } from "@/app/actions";
import { AISettings } from "@/lib/settings";

interface AccountSyncPanelProps {
    initialSettings: AISettings;
}

export default function AccountSyncPanel({ initialSettings }: AccountSyncPanelProps) {
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    
    // Form state
    const [ifxEmail, setIfxEmail] = useState(initialSettings.ifx_email || "");
    const [forexAccountNo, setForexAccountNo] = useState(initialSettings.forex_account_no || "");
    const [accountName, setAccountName] = useState(initialSettings.account_name || "");

    const handleSave = () => {
        startTransition(async () => {
            await updateAISettingsAction({
                id: initialSettings.id,
                ifx_email: ifxEmail,
                forex_account_no: forexAccountNo,
                account_name: accountName
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        });
    };

    return (
        <div className="rounded-2xl p-6 space-y-6 relative overflow-hidden"
            style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
            
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(34,211,238,0.1)" }}>
                    <User size={20} className="text-[#22d3ee]" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Account & Sync Settings</h3>
                    <p className="text-[#a3a3a3] text-sm mt-0.5">Manage your dynamic IFX Hub connection identities.</p>
                </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Email Field */}
                <div className="space-y-1.5 focus-within:text-[#22d3ee] transition-colors">
                    <label className="text-xs font-bold uppercase tracking-widest pl-1 text-[#a3a3a3] flex items-center gap-1.5">
                        <Mail size={12} /> IFX Hub Email
                    </label>
                    <input
                        type="email"
                        value={ifxEmail}
                        onChange={(e) => setIfxEmail(e.target.value)}
                        placeholder="e.g. trader@example.com"
                        className="w-full bg-[#1c1c1c] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/50 transition-all placeholder:text-white/20"
                    />
                </div>

                {/* Account Number Field */}
                <div className="space-y-1.5 focus-within:text-[#22d3ee] transition-colors">
                    <label className="text-xs font-bold uppercase tracking-widest pl-1 text-[#a3a3a3] flex items-center gap-1.5">
                        <Hash size={12} /> Forex Account Number
                    </label>
                    <input
                        type="text"
                        value={forexAccountNo}
                        onChange={(e) => setForexAccountNo(e.target.value)}
                        placeholder="e.g. 12948123"
                        className="w-full bg-[#1c1c1c] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/50 transition-all placeholder:text-white/20"
                    />
                </div>

                {/* Account Name Field */}
                <div className="space-y-1.5 focus-within:text-[#22d3ee] transition-colors md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest pl-1 text-[#a3a3a3] flex items-center gap-1.5">
                        <User size={12} /> Account Identity Name
                    </label>
                    <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="e.g. Main Funded Account"
                        className="w-full bg-[#1c1c1c] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#22d3ee]/50 focus:ring-1 focus:ring-[#22d3ee]/50 transition-all placeholder:text-white/20"
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-2">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff"
                    }}
                >
                    {isPending ? (
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={14} />
                    )}
                    {isPending ? "Saving..." : "Save Connection"}
                </button>
                {saved && (
                    <div className="flex items-center gap-1.5 text-[#34d399] text-xs font-bold animate-fade-in">
                        <Check size={14} /> Saved perfectly.
                    </div>
                )}
            </div>
        </div>
    );
}
