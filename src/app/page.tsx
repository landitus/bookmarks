import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-4xl font-bold tracking-tight">Welcome to Internet Shelf</h1>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Your personal corner of the internet. Capture, consume, and curate the things that matter.
          </p>
      <div className="flex gap-4 mt-4">
        <Button asChild>
          <Link href="/inbox">Go to Inbox</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/library">View Library</Link>
        </Button>
        </div>
    </div>
  );
}
