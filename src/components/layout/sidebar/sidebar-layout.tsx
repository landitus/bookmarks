import { SidebarNav } from "./sidebar-nav";

interface SidebarLayoutProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  children: React.ReactNode;
}

export function SidebarLayout({ user, children }: SidebarLayoutProps) {
  return (
    <>
      <SidebarNav user={user} />
      <main className="ml-64 p-2 md:p-8">{children}</main>
    </>
  );
}
