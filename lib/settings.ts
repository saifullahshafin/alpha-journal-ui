import { supabase } from "./supabase";

export interface AISettings {
    id?: string;
    system_prompt: string;
    temperature: number;
    max_tokens: number;
    model_name: string;
    updated_at?: string;
    sync_source?: "ifxhub" | "myfxbook";
    ifxhub_token_expiry?: string | null;
    ifx_email?: string;
    ifx_password?: string;
    forex_account_no?: string;
    account_name?: string;
}

export async function getAISettings(): Promise<AISettings | null> {
    const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .limit(1)
        .single();

    if (error) {
        console.error("Error fetching AI settings:", error.message);
        return null;
    }
    return data as AISettings;
}

