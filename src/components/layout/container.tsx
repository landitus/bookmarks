import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared container for consistent max-width and horizontal padding.
 * Use this to ensure header and main content align properly.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("max-w-3xl mx-auto px-4", className)}>{children}</div>
  );
}
