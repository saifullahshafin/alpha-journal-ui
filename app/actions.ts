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

export async function clearDuplicatesAction(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    // Delete all legacy Myfxbook/null-ticket trades that have no user data attached.
    // A "clean" duplicate is a SYNC trade with no broker_ticket, no user_notes, and no image_urls.
    const { data: toDelete, error: fetchError } = await supabase
        .from("trades")
        .select("id")
        .is("broker_ticket", null)
        .eq("status", "SYNC")
        .is("user_notes", null)
        .is("image_urls", null);

    if (fetchError) {
        console.error("Fetch error during dedup:", fetchError);
        return { success: false, error: fetchError.message };
    }

    if (!toDelete || toDelete.length === 0) {
        return { success: true, deletedCount: 0 };
    }

    const ids = toDelete.map((r) => r.id);

    // Delete in batches of 50 to avoid URL limit issues
    let deleted = 0;
    for (let i = 0; i < ids.length; i += 50) {
        const batch = ids.slice(i, i + 50);
        const { error: deleteError } = await supabase.from("trades").delete().in("id", batch);
        if (deleteError) {
            console.error("Delete batch error:", deleteError);
            return { success: false, error: deleteError.message, deletedCount: deleted };
        }
        deleted += batch.length;
    }

    revalidatePath("/");
    revalidatePath("/journal");
    return { success: true, deletedCount: deleted };
}

export async function getSyncSourceAction(): Promise<"ifxhub" | "myfxbook"> {
    const { data } = await supabase
        .from("ai_settings")
        .select("sync_source")
        .limit(1)
        .single();
    return (data?.sync_source as "ifxhub" | "myfxbook") ?? "ifxhub";
}

export async function setSyncSourceAction(source: "ifxhub" | "myfxbook") {
    const { data: existing } = await supabase.from("ai_settings").select("id").limit(1).single();
    if (existing?.id) {
        await supabase.from("ai_settings").update({ sync_source: source }).eq("id", existing.id);
    }
    revalidatePath("/sentinel");
    return { success: true };
}

export async function triggerSyncAction() {
    try {
        // Determine which engine to call based on the toggle persisted in Supabase
        const { data } = await supabase.from("ai_settings").select("sync_source").limit(1).single();
        const syncSource = data?.sync_source ?? "ifxhub";

        const ifxhubUrl  = process.env.NEXT_PUBLIC_IFXHUB_WEBHOOK_URL;
        const myfxbookUrl = process.env.NEXT_PUBLIC_MODAL_WEBHOOK_URL;

        const webhookUrl = syncSource === "myfxbook" ? myfxbookUrl : ifxhubUrl;

        if (!webhookUrl) {
            // Demo/dev mode — simulate success
            return { success: true, source: syncSource };
        }

        await fetch(webhookUrl, { method: "POST" });
        revalidatePath("/");
        revalidatePath("/journal");
        return { success: true, source: syncSource };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateAISettingsAction(settings: any) {
    const { error } = await supabase.from("ai_settings").update(settings).match({ id: settings.id });
    if (error) {
        console.error("Update AI settings failed:", error);
        throw new Error(error.message);
    }
    revalidatePath("/settings");
    return { success: true };
}
