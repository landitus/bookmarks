import Link from "next/link";
import { Inbox, Layers, Library, Folder, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-muted/10 h-screen p-4 flex flex-col gap-4 fixed left-0 top-0">
      <div className="font-bold text-xl px-4 py-2">Internet Shelf</div>
      
      <nav className="flex flex-col gap-1">
        <Button variant="ghost" asChild className="justify-start">
          <Link href="/inbox">
            <Inbox className="mr-2 h-4 w-4" />
            Inbox
          </Link>
        </Button>
        <Button variant="ghost" asChild className="justify-start">
          <Link href="/queue">
            <Layers className="mr-2 h-4 w-4" />
            Queue
          </Link>
        </Button>
        <Button variant="ghost" asChild className="justify-start">
          <Link href="/library">
            <Library className="mr-2 h-4 w-4" />
            Library
          </Link>
        </Button>
      </nav>

      <div className="mt-4">
        <h4 className="px-4 text-xs font-semibold text-muted-foreground mb-2">PROJECTS</h4>
        <nav className="flex flex-col gap-1">
           {/* Placeholder for projects list */}
          <Button variant="ghost" size="sm" asChild className="justify-start text-muted-foreground">
             <Link href="/projects">
                <Folder className="mr-2 h-4 w-4" />
                All Projects
             </Link>
          </Button>
        </nav>
      </div>
    </div>
  );
}

