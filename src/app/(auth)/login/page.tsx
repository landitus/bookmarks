import { AuthForm } from "@/components/auth/auth-form";
import { BookMarked } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo icon only */}
        <Link href="/" className="group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-20 scale-150 group-hover:opacity-30 transition-opacity" />
            <div className="relative p-3 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl shadow-2xl shadow-neutral-900/20">
              <BookMarked className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </Link>
        
        <AuthForm />
      </div>
    </div>
  );
}
