import { MainLayout } from "@/components/layout";
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

  return <MainLayout user={user!}>{children}</MainLayout>;
}
