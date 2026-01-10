"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createItem } from "@/lib/actions/items";
import { Loader2, Check, X } from "lucide-react";

export default function SharePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function handleShare() {
      // Get URL from share intent (can come as 'url' or 'text' params)
      const sharedUrl = searchParams.get("url");
      const sharedText = searchParams.get("text");
      const sharedTitle = searchParams.get("title");

      // Try to extract URL from text if url param is empty
      let urlToSave = sharedUrl;
      if (!urlToSave && sharedText) {
        // Try to find a URL in the shared text
        const urlMatch = sharedText.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          urlToSave = urlMatch[0];
        }
      }

      if (!urlToSave) {
        setStatus("error");
        setMessage("No URL found in shared content");
        setTimeout(() => router.push("/inbox"), 2000);
        return;
      }

      // Create form data and save
      const formData = new FormData();
      formData.set("url", urlToSave);
      if (sharedTitle) {
        formData.set("title", sharedTitle);
      }

      try {
        const result = await createItem(formData);
        if (result.success) {
          setStatus("success");
          setMessage("Saved!");
          setTimeout(() => router.push("/inbox"), 1000);
        } else {
          setStatus("error");
          setMessage(result.message || "Failed to save");
          setTimeout(() => router.push("/inbox"), 2000);
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong");
        setTimeout(() => router.push("/inbox"), 2000);
      }
    }

    handleShare();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF7] dark:bg-zinc-950">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">Saving link...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-zinc-900 dark:text-zinc-100 font-medium">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <X className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-zinc-900 dark:text-zinc-100 font-medium">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

