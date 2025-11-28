import { TopNav } from "@/components/layout/top-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav user={user} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

