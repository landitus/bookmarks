/**
 * Shared API utilities
 * Reusable helpers for any API route
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// =============================================================================
// CONSTANTS
// =============================================================================

// CORS headers for API responses
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Create JSON response with CORS headers
 */
export function jsonResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

/**
 * Create a Supabase client with service role for API access
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type ServiceClient = ReturnType<typeof createServiceClient>;

/**
 * Authenticate request via Bearer token (api_key from profiles)
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ userId: string } | { error: string; status: number }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }

  const apiKey = authHeader.slice(7); // Remove "Bearer " prefix

  if (!apiKey) {
    return { error: "API key is required", status: 401 };
  }

  const supabase = createServiceClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("api_key", apiKey)
    .single();

  if (error || !profile) {
    return { error: "Invalid API key", status: 401 };
  }

  return { userId: profile.id };
}
