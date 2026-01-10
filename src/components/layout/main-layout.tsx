import { Nav } from "./nav";
import { Container } from "./container";

interface MainLayoutProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  children: React.ReactNode;
}

export function MainLayout({ user, children }: MainLayoutProps) {
  return (
    <>
      <Nav user={user} />
      <main className="py-8">
        <Container>{children}</Container>
      </main>
    </>
  );
}
