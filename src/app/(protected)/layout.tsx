import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware ensures user is authenticated before reaching here
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Sidebar user={user!} />
      <main className="ml-64 p-8">{children}</main>
    </>
  );
}
