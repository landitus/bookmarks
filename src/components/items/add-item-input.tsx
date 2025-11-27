"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createItem } from "@/lib/actions/items";
import { Plus, Search, Loader2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface AddItemInputProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  targetStatus?: "inbox" | "library";
}

export function AddItemInput({
  onSearch,
  placeholder = "Search or add URL...",
  targetStatus = "inbox",
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
    } catch (_) {
      return false;
    }
  };

  const isUrlValue = isUrl(value);

  const handleSubmit = async (formData: FormData) => {
    if (isUrlValue) {
      // Add status to formData
      formData.append("status", targetStatus);
      startTransition(async () => {
        await createItem(formData);
        setValue("");
        onSearch?.(""); // Clear search query in parent
        formRef.current?.reset();
        router.refresh();
      });
    }
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
        <Input
          type="text" // Changed to text to allow searching
          name="url"
          placeholder={placeholder}
          className="pl-9 pr-10 w-full"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onSearch?.(e.target.value);
          }}
          autoComplete="off"
        />
        <div className="absolute right-1 top-1 bottom-1 flex items-center">
          {isPending ? (
            <div className="h-8 w-8 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : isUrlValue ? (
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
              title="Add URL"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Item</span>
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
