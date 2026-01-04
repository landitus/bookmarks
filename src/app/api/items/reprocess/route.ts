import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";

// Shared utilities
import {
  corsHeaders,
  jsonResponse,
  createServiceClient,
  authenticateRequest,
  processItemInBackground,
} from "@/lib/api/items-shared";

/**
 * POST /api/items/reprocess - Reprocess an item's content extraction
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);

  if ("error" in auth) {
    return jsonResponse({ success: false, error: auth.error }, auth.status);
  }

  const { userId } = auth;

  let body: { itemId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
  }

  const { itemId } = body;

  if (!itemId) {
    return jsonResponse({ success: false, error: "itemId is required" }, 400);
  }

  const supabase = createServiceClient();

  // Get the item
  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("id, url, user_id")
    .eq("id", itemId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !item) {
    return jsonResponse({ success: false, error: "Item not found" }, 404);
  }

  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    const shortId = itemId.slice(0, 8);
    console.log(`[${timestamp}] [Reprocess] [Item:${shortId}] ${message}`);
  };

  log(`Starting reprocess for: ${item.url}`);

  // Use after() to run processing after response is sent
  // This keeps the serverless function alive until processing completes
  after(async () => {
    try {
      await processItemInBackground(item.id, item.url, userId, {
        updateMetadata: false, // Don't overwrite user's saved title during reprocess
      });
    } catch (e) {
      log(`❌ Processing failed: ${e}`);
    }
  });

  return jsonResponse({ success: true, message: "Reprocessing started" });
}

/**
 * OPTIONS - Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
