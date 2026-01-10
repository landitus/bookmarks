"use client";

import { useState, useTransition } from "react";
import { Item } from "@/lib/types";
import { updateItem } from "@/lib/actions/items";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditItemDialogProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditItemDialog({
  item,
  open,
  onOpenChange,
}: EditItemDialogProps) {
  // Use key-based remounting via conditional rendering
  // When item is null, don't render form content
  if (!item) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
        </DialogHeader>
        <EditItemForm item={item} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

// Inner form component - remounts when item changes via key in parent
interface EditItemFormProps {
  item: Item;
  onSuccess: () => void;
}

function EditItemForm({ item, onSuccess }: EditItemFormProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(item.title || "");
  const [url, setUrl] = useState(item.url || "");
  const [description, setDescription] = useState(item.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateItem(item.id, {
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || null,
      });

      if (result.success) {
        toast.success("Bookmark updated");
        onSuccess();
      } else {
        toast.error(result.message || "Failed to update bookmark");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bookmark title"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
          className={cn(
            "placeholder:text-muted-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "resize-none"
          )}
        />
      </div>
      <DialogFooter>
        <Button size="sm" type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}
