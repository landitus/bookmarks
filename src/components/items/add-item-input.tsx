"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { createItem } from "@/lib/actions/items";
import { Plus, Search, Loader2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AddItemInputProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function AddItemInput({
  onSearch,
  placeholder = "Search or add URL...",
}: AddItemInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Regex to check if string is a valid URL
  const isUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const isUrlValue = isUrl(value);

  const handleSubmit = async (formData: FormData) => {
    if (isUrlValue) {
      startTransition(async () => {
        const result = await createItem(formData);
        if (result.success) {
          toast.success("Bookmark added successfully");
          setValue("");
          onSearch?.(""); // Clear search query in parent
          formRef.current?.reset();
          router.refresh();
        } else {
          toast.error(result.message || "Failed to add bookmark");
        }
      });
    }
  };

  return (
    <div className="relative w-full">
      <form
        ref={formRef}
        action={handleSubmit}
        className="flex w-full items-center"
        onSubmit={(e) => {
          if (!isUrlValue) {
            e.preventDefault();
          }
        }}
      >
        <div className="absolute left-2.5 top-2.5 flex items-center">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isUrlValue ? (
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
              title="Add URL"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Item</span>
            </Button>
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Input
          type="text"
          name="url"
          placeholder={placeholder}
          className="pl-9 pr-20 w-full"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onSearch?.(e.target.value);
          }}
          autoComplete="off"
        />
        {isUrlValue && !isPending && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <Kbd className="text-[10px]">Enter</Kbd>
          </div>
        )}
      </form>
    </div>
  );
}
