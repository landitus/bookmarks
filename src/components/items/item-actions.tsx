"use client";

import { updateItemStatus } from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Archive, Layers, Library, MoreVertical, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { ItemStatus } from "@/lib/types";

interface ItemActionsProps {
  itemId: string;
  currentStatus: ItemStatus;
}

export function ItemActions({ itemId, currentStatus }: ItemActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: ItemStatus) => {
    startTransition(async () => {
      await updateItemStatus(itemId, newStatus);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isPending}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Move to</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {currentStatus !== "queue" && (
          <DropdownMenuItem
            onClick={() => handleStatusChange("queue")}
            disabled={isPending}
          >
            <Layers className="mr-2 h-4 w-4" />
            Queue
          </DropdownMenuItem>
        )}
        
        {currentStatus !== "library" && (
          <DropdownMenuItem
            onClick={() => handleStatusChange("library")}
            disabled={isPending}
          >
            <Library className="mr-2 h-4 w-4" />
            Library
          </DropdownMenuItem>
        )}
        
        {currentStatus !== "archive" && (
          <DropdownMenuItem
            onClick={() => handleStatusChange("archive")}
            disabled={isPending}
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          disabled={isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

