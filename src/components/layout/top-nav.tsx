import { UserMenu } from "@/components/layout/user-menu";
import Link from "next/link";

interface TopNavProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export function TopNav({ user }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full  bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <div className="h-6 w-6 bg-primary rounded-md" />
            Internet Shelf
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
