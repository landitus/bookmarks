import { AuthForm } from "@/components/auth/auth-form";
import { BookMarked } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <BookMarked className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">Portable</h1>
        </div>
        <p className="text-muted-foreground text-center max-w-md">
          Your personal corner of the internet. Capture, consume, and curate the
          things that matter.
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
