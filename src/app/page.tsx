import { Button } from "@/components/ui/button";
import { BookMarked } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#FFFBF7]">
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Warm gradient wash */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-amber-200/40 via-orange-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-rose-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tl from-amber-100/40 to-transparent rounded-full blur-3xl" />
      </div>

      <main className="flex flex-col items-center gap-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo mark */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-20 scale-150" />
          <div className="relative p-4 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl shadow-2xl shadow-neutral-900/20">
            <BookMarked className="h-8 w-8 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">
            Portable
          </h1>
          <p className="text-neutral-500 text-center text-[17px] leading-relaxed max-w-[260px]">
            A little pocket for the internet things you love.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 mt-2">
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 h-12 text-[15px] bg-neutral-900 hover:bg-neutral-800 shadow-lg shadow-neutral-900/10"
          >
            <Link href="/login">Start saving things</Link>
          </Button>
          <Button
            asChild
            variant="link"
            className="text-neutral-500 hover:text-neutral-700 text-sm"
          >
            <Link href="/login">Already have an account? Sign in →</Link>
          </Button>
        </div>
      </main>

      {/* Footer accent */}
      <div className="absolute bottom-8 flex items-center gap-2 text-[13px] text-neutral-400">
        <span className="w-8 h-px bg-neutral-300" />
        <span>save · watch · read</span>
        <span className="w-8 h-px bg-neutral-300" />
      </div>
    </div>
  );
}
