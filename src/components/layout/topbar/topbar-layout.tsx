import { TopbarNav } from "./topbar-nav";

interface TopbarLayoutProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  children: React.ReactNode;
}

export function TopbarLayout({ user, children }: TopbarLayoutProps) {
  return (
    <>
      <TopbarNav user={user} />
      <main className="p-2 md:p-8">{children}</main>
    </>
  );
}
