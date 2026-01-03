import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Reader Layout
 * 
 * Handles authentication but provides NO navigation chrome.
 * The reader view provides its own full-page header.
 */
export default async function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication (same as protected layout)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Render children directly - no wrapper, no topbar
  return <>{children}</>;
}







