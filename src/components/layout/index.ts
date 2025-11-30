import { LAYOUT_MODE } from "@/lib/config";
import { SidebarLayout } from "./sidebar";
import { TopbarLayout } from "./topbar";

export type LayoutProps = {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  children: React.ReactNode;
};

export const ActiveLayout =
  LAYOUT_MODE === "sidebar" ? SidebarLayout : TopbarLayout;

