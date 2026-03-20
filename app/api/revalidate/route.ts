import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/revalidate
 * Called by the Modal sync engine after a sync job completes.
 * Purges the Next.js cache for the journal and home pages so new trades
 * appear without a manual browser refresh.
 *
 * Optionally secured with CRON_SECRET env var (set the same value in Modal secrets).
 */
export async function POST(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (secret) {
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    revalidatePath("/", "layout");
    revalidatePath("/journal");
    revalidatePath("/sentinel");

    return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}

// Also expose a GET so the URL can be sanity-checked in the browser
export async function GET() {
    return NextResponse.json({ status: "ok", endpoint: "/api/revalidate" });
}
