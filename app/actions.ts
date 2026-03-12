"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateTradeAction(id: string, updates: any) {
    const { error } = await supabase.from("trades").update(updates).eq("id", id);
    if (error) {
        console.error("Update failed:", error);
        throw new Error(error.message);
    }
    revalidatePath("/");
    revalidatePath("/journal");
}

export async function deleteTradeAction(id: string) {
    const { error } = await supabase.from("trades").delete().eq("id", id);
    if (error) {
        console.error("Delete failed:", error);
        throw new Error(error.message);
    }
    revalidatePath("/");
    revalidatePath("/journal");
}

export async function triggerSyncAction() {
    try {
        const webhookUrl = process.env.NEXT_PUBLIC_MODAL_WEBHOOK_URL;
        if (!webhookUrl) throw new Error("Missing Modal Webhook URL");

        await fetch(webhookUrl, { method: "POST" });
        revalidatePath("/");
        revalidatePath("/journal");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
