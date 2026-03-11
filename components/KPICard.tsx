"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface KPICardProps {
    label: string;
    value: string | number;
    sub?: string;
    icon: ReactNode;
    accent?: "cyan" | "success" | "danger" | "warning" | "default";
    delay?: number;
}

const accentMap = {
    cyan: { color: "#22d3ee", bg: "rgba(34,211,238,0.08)" },
    success: { color: "#34d399", bg: "rgba(52,211,153,0.08)" },
    danger: { color: "#fb7185", bg: "rgba(251,113,133,0.08)" },
    warning: { color: "#eab308", bg: "rgba(234,179,8,0.08)" },
    default: { color: "#a3a3a3", bg: "rgba(255,255,255,0.05)" },
};

export default function KPICard({
    label,
    value,
    sub,
    icon,
    accent = "default",
    delay = 0,
}: KPICardProps) {
    const { color, bg } = accentMap[accent];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="relative rounded-xl p-5 flex flex-col gap-4 cursor-default"
            style={{
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.05)",
                transition: "transform 0.2s",
            }}
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-center justify-between">
                <p className="text-[#a3a3a3] text-xs font-medium uppercase tracking-widest">
                    {label}
                </p>
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: bg, color }}
                >
                    {icon}
                </div>
            </div>
            <div>
                <p
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: color !== "#a3a3a3" ? color : "#ffffff" }}
                >
                    {value}
                </p>
                {sub && <p className="text-[#a3a3a3] text-xs mt-1">{sub}</p>}
            </div>
        </motion.div>
    );
}
