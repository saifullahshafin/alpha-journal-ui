export type TradeStatus = "DRAFT" | "VERIFIED" | "SYNC";

export interface Trade {
    id: string;
    status: TradeStatus;
    symbol: string | null;
    lot_size: number | null;
    entry_price: number | null;
    stop_price: number | null;
    take_profit: number | null;
    close_price: number | null;
    risk_reward: number | null;
    action: "BUY" | "SELL" | null;
    image_urls: string[] | null;
    ai_truth_note: string | null;
    user_notes: string | null;
    mfx_id: string | null;
    created_at: string;
    // Myfxbook fields
    open_time: string | null;
    close_time: string | null;
    pips: number | null;
    net_profit: number | null;
    duration: string | null;
    profit: number | null;
    human_date: string | null;
}

export type SystemLogSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface SystemLog {
    id: string;
    component: string;
    severity: SystemLogSeverity;
    message: string;
    stack_trace: string | null;
    created_at?: string;
}
