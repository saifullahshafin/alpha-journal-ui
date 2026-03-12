"use client";

import { useState } from "react";
import type { Trade } from "@/lib/types";
import { X, Save, Image as ImageIcon } from "lucide-react";
import { updateTradeAction } from "@/app/actions";

interface EditTradeModalProps {
    trade: Trade;
    onClose: () => void;
}

export default function EditTradeModal({ trade, onClose }: EditTradeModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    
    // Format timestamp for datetime-local input safely
    const formatForInput = (isoDate: string | null | undefined) => {
        if (!isoDate) return "";
        try {
            return new Date(isoDate).toISOString().slice(0, 16);
        } catch {
            return "";
        }
    };

    const [form, setForm] = useState({
        symbol: trade.symbol || "",
        action: trade.action || "BUY",
        status: trade.status || "DRAFT",
        entry_price: trade.entry_price?.toString() || "",
        close_price: trade.close_price?.toString() || "",
        stop_price: trade.stop_price?.toString() || "",
        take_profit: trade.take_profit?.toString() || "",
        lot_size: trade.lot_size?.toString() || "",
        open_time: formatForInput(trade.open_time || trade.created_at),
        user_notes: trade.user_notes || "",
        image_urls: trade.image_urls ? trade.image_urls.join("\n") : "",
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updates = {
                symbol: form.symbol.trim().toUpperCase() || null,
                action: form.action.toUpperCase(),
                status: form.status,
                entry_price: parseFloat(form.entry_price) || null,
                close_price: parseFloat(form.close_price) || null,
                stop_price: parseFloat(form.stop_price) || null,
                take_profit: parseFloat(form.take_profit) || null,
                lot_size: parseFloat(form.lot_size) || null,
                open_time: form.open_time ? new Date(form.open_time).toISOString() : null,
                user_notes: form.user_notes.trim() || null,
                image_urls: form.image_urls.trim() ? form.image_urls.split("\n").map(u => u.trim()).filter(Boolean) : null,
            };
            
            await updateTradeAction(trade.id, updates);
            onClose();
        } catch (err) {
            alert("Failed to save changes.");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = "bg-[#141414] border border-white/10 text-white text-sm px-3 py-2 rounded-lg outline-none focus:border-[#22d3ee]/50 w-full transition-colors";
    const labelClass = "text-xs font-semibold text-[#a3a3a3] mb-1.5 block uppercase tracking-wider";

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />
            
            <div className="relative w-full max-w-md h-full bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col transform transition-transform animate-slide-in-right overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0f0f0f]">
                    <div>
                        <h2 className="text-lg font-bold text-white">Edit Trade</h2>
                        <p className="text-xs text-[#a3a3a3] font-mono mt-0.5">{trade.id.substring(0, 12)}...</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-[#a3a3a3] hover:text-white bg-[#141414] hover:bg-white/10 rounded-full transition-colors border border-white/5"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Core Settings */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Symbol</label>
                                <input type="text" className={inputClass} value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value})} placeholder="e.g. BTCUSD" />
                            </div>
                            <div>
                                <label className={labelClass}>Side</label>
                                <select className={inputClass} value={form.action} onChange={e => setForm({...form, action: e.target.value as "BUY" | "SELL"})}>
                                    <option value="BUY">BUY</option>
                                    <option value="SELL">SELL</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Status</label>
                                <select className={inputClass} value={form.status} onChange={e => setForm({...form, status: e.target.value as "DRAFT" | "VERIFIED" | "SYNC"})}>
                                    <option value="DRAFT">DRAFT</option>
                                    <option value="SYNC">SYNC</option>
                                    <option value="VERIFIED">VERIFIED</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Lot Size</label>
                                <input type="number" step="0.01" className={inputClass} value={form.lot_size} onChange={e => setForm({...form, lot_size: e.target.value})} placeholder="0.10" />
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    {/* Price Data */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Entry Price</label>
                                <input type="number" step="0.00001" className={inputClass} value={form.entry_price} onChange={e => setForm({...form, entry_price: e.target.value})} />
                            </div>
                            <div>
                                <label className={labelClass}>Close Price</label>
                                <input type="number" step="0.00001" className={inputClass} value={form.close_price} onChange={e => setForm({...form, close_price: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Stop Loss</label>
                                <input type="number" step="0.00001" className={inputClass} value={form.stop_price} onChange={e => setForm({...form, stop_price: e.target.value})} />
                            </div>
                            <div>
                                <label className={labelClass}>Take Profit</label>
                                <input type="number" step="0.00001" className={inputClass} value={form.take_profit} onChange={e => setForm({...form, take_profit: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    {/* Timeline Data */}
                    <div>
                        <label className={labelClass}>Open Time (Local)</label>
                        <input type="datetime-local" className={inputClass} value={form.open_time} onChange={e => setForm({...form, open_time: e.target.value})} />
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    {/* Journaling */}
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>User Notes</label>
                            <textarea 
                                className={`${inputClass} min-h-[100px] resize-y placeholder:text-white/20`} 
                                value={form.user_notes} 
                                onChange={e => setForm({...form, user_notes: e.target.value})}
                                placeholder="What was your thought process for this trade?"
                            />
                        </div>
                        <div>
                            <label className={labelClass + " flex items-center gap-1.5"}>
                                <ImageIcon size={12} /> Chart Screenshots (One URL per line)
                            </label>
                            <textarea 
                                className={`${inputClass} min-h-[80px] font-mono text-xs whitespace-nowrap overflow-x-auto placeholder:text-white/20`} 
                                value={form.image_urls} 
                                onChange={e => setForm({...form, image_urls: e.target.value})}
                                placeholder="https://example.com/chart1.png&#10;https://example.com/chart2.png"
                            />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-[#0f0f0f] flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-black bg-[#22d3ee] hover:bg-[#1fbcd6] transition-colors disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : <><Save size={16} /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
