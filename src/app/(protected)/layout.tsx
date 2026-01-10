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

  // Fetch profile to get avatar_url (may differ from OAuth metadata)
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user!.id)
    .single();

  // Merge profile avatar_url into user metadata (profile takes precedence)
  const userWithAvatar = {
    ...user!,
    user_metadata: {
      ...user!.user_metadata,
      avatar_url: profile?.avatar_url || user!.user_metadata?.avatar_url,
    },
  };

  return <MainLayout user={userWithAvatar}>{children}</MainLayout>;
}
