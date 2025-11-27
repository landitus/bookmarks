import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // User check is handled in parent layout, but we need user object for Sidebar
  if (!user) return null;

  return (
    <>
      <Sidebar user={user} />
      <main className="ml-64 p-8">{children}</main>
    </>
  );
}
