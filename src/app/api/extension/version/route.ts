import { NextResponse } from "next/server";

/**
 * GET /api/extension/version - Get the latest extension version
 *
 * Response:
 *   { version: string }
 *
 * This endpoint can be used by the extension to check for updates.
 * Update the version here when releasing a new version.
 */
export async function GET() {
  // Update this version when releasing a new extension version
  const latestVersion = "0.0.1";

  return NextResponse.json(
    { version: latestVersion },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    }
  );
}

