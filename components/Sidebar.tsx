"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Shield,
    Brain,
    Activity,
    Zap,
    Settings as SettingsIcon,
} from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/vault", label: "The Vault", icon: Shield },
    { href: "/sentinel", label: "AI Sentinel", icon: Brain },
    { href: "/health", label: "System Health", icon: Activity },
    { href: "/settings", label: "AI Settings", icon: SettingsIcon },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-50"
            style={{
                background: "rgba(10,10,10,0.85)",
                backdropFilter: "blur(12px)",
                borderRight: "1px solid rgba(255,255,255,0.05)",
            }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)" }}>
                    <Zap size={16} className="text-white" />
                </div>
                <div>
                    <p className="text-white font-bold text-sm tracking-wide">AlphaJournal</p>
                    <p className="text-[10px] text-[#a3a3a3] tracking-widest uppercase">Elite Shell</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link key={href} href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active
                                    ? "bg-[#141414] text-white border border-white/10"
                                    : "text-[#a3a3a3] hover:text-white hover:bg-[#141414]"
                                }`}
                        >
                            <Icon
                                size={16}
                                className={`transition-colors ${active ? "text-[#22d3ee]" : "text-[#a3a3a3] group-hover:text-white"
                                    }`}
                            />
                            {label}
                            {active && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5">
                <p className="text-[10px] text-[#a3a3a3] tracking-widest uppercase">Phase 4: S — Stylize</p>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                    <p className="text-[11px] text-[#34d399] font-medium">LIVE</p>
                </div>
            </div>
        </aside>
    );
}
