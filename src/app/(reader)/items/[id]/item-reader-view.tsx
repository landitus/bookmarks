"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/lib/types";
import {
  refreshContent,
  getItemProcessingStatus,
  markProcessingTimedOut,
} from "@/lib/actions/items";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemActions } from "@/components/items/item-actions";
import { AppHeader } from "@/components/layout/app-header";
import Image from "next/image";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  ExternalLink,
  Calendar,
  User as UserIcon,
  BookOpen,
  Sparkles,
  Tag,
  PanelRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { ReaderSettingsProvider, useReaderSettings } from "@/components/reader";
import { ReaderSettingsPopover } from "@/components/reader";

// =============================================================================
// MODULE-LEVEL STATE (persists across remounts)
// =============================================================================

// Track which items are currently being polled (persists across component remounts)
const pollingItems = new Set<string>();
// Track which items have shown error toast (prevents duplicate toasts)
const errorShownItems = new Set<string>();

// =============================================================================
// TYPES
// =============================================================================

interface Topic {
  id: string;
  name: string;
  slug: string;
}

interface ItemReaderViewProps {
  item: Item;
  topics: Topic[];
  user: User;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getDomain(url: string) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

// =============================================================================
// HEADER COMPONENTS
// =============================================================================

interface ReaderActionsProps {
  item: Item;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onRefreshContent: () => void;
  isRefreshing: boolean;
}

function ReaderActions({
  item,
  sidebarOpen,
  onToggleSidebar,
  onRefreshContent,
  isRefreshing,
}: ReaderActionsProps) {
  return (
    <>
      {/* Open Original */}
      <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden md:inline">Original</span>
        </a>
      </Button>

      {/* Triage Actions (Keep/Discard for Inbox, Favorite for Library, Restore for Archive) */}
      <ItemActions
        itemId={item.id}
        url={item.url}
        isKept={item.is_kept}
        isFavorite={item.is_favorite}
        isArchived={item.is_archived}
        showTriageButtons
        alwaysVisible
        onRefreshContent={onRefreshContent}
        isRefreshing={isRefreshing}
      />

      {/* Reader Settings */}
      <ReaderSettingsPopover />

      {/* Toggle Sidebar */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        className="hidden sm:flex"
      >
        <PanelRight className={cn("h-4 w-4", sidebarOpen && "text-primary")} />
      </Button>
    </>
  );
}

// =============================================================================
// READER PANE WRAPPER
// Applies theme and display mode data attributes
// =============================================================================

interface ReaderPaneProps {
  children: React.ReactNode;
  className?: string;
}

function ReaderPane({ children, className }: ReaderPaneProps) {
  const { settings, isLoaded } = useReaderSettings();

  // Don't apply attributes until settings are loaded to prevent flash
  if (!isLoaded) {
    return <div className={cn("reader-pane", className)}>{children}</div>;
  }

  return (
    <div
      className={cn("reader-pane", className)}
      data-reader-theme={settings.theme}
      data-reader-display={settings.display}
    >
      {children}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ItemReaderView({ item, topics, user }: ItemReaderViewProps) {
  return (
    <ReaderSettingsProvider>
      <ItemReaderViewContent item={item} topics={topics} user={user} />
    </ReaderSettingsProvider>
  );
}

function ItemReaderViewContent({ item, topics, user }: ItemReaderViewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const hasContent = item.content && item.content.length > 100;
  const isArticle = item.type === "article" && hasContent;

  // Poll for processing status when refreshing
  const pollForCompletion = useCallback(async () => {
    // Prevent multiple polling loops using module-level Set
    if (pollingItems.has(item.id)) return;
    pollingItems.add(item.id);
    // Clear error flag when starting new poll
    errorShownItems.delete(item.id);

    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    const poll = async () => {
      // Check if still polling (might have been cancelled)
      if (!pollingItems.has(item.id)) return;

      attempts++;
      const { status, hasContent } = await getItemProcessingStatus(item.id);

      if (status === "completed" || status === "failed" || hasContent) {
        pollingItems.delete(item.id);
        setIsRefreshing(false);
        router.refresh();
        // Only show toast on failure, and only once per item
        if (
          status === "failed" &&
          !hasContent &&
          !errorShownItems.has(item.id)
        ) {
          errorShownItems.add(item.id);
          toast.error("Content extraction failed");
        }
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, 1000);
      } else {
        pollingItems.delete(item.id);
        setIsRefreshing(false);
        // Mark as failed in database so list view updates
        markProcessingTimedOut(item.id);
        // Show timeout error only once
        if (!errorShownItems.has(item.id)) {
          errorShownItems.add(item.id);
          toast.error("Content extraction timed out. Try again later.");
        }
        router.refresh();
      }
    };

    poll();
  }, [item.id, router]);

  const handleRefreshContent = () => {
    // Reset error flag when manually refreshing
    errorShownItems.delete(item.id);
    // Stop any existing poll for this item
    pollingItems.delete(item.id);
    setIsRefreshing(true);
    startTransition(async () => {
      await refreshContent(item.id);
      pollForCompletion();
    });
  };

  // Auto-start polling if item is in pending/processing state (e.g., page was refreshed during processing)
  useEffect(() => {
    const isProcessing =
      item.processing_status === "pending" ||
      item.processing_status === "processing";
    // Only start polling if not already polling for this item
    if (isProcessing && !pollingItems.has(item.id)) {
      setIsRefreshing(true);
      pollForCompletion();
    }
    // Cleanup: remove from polling set when component unmounts
    return () => {
      // Don't delete - let the polling complete naturally
      // pollingItems.delete(item.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, item.processing_status]);

  return (
    <div className="min-h-screen bg-background">
      {/* Shared Header */}
      <AppHeader
        user={user}
        // center={<SourceDomainCenter url={item.url} />}
        actions={
          <ReaderActions
            item={item}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onRefreshContent={handleRefreshContent}
            isRefreshing={isRefreshing}
          />
        }
        bordered
      />

      {/* Main Content */}
      <div className="flex relative">
        {/* Reader Pane */}
        <main
          className={cn(
            "flex-1 min-w-0 transition-all duration-300 w-full",
            sidebarOpen && "sm:mr-80"
          )}
        >
          {isRefreshing ? (
            // Loading state while refreshing content
            <div className="max-w-2xl mx-auto px-6 py-12">
              <div className="text-center space-y-6">
                {item.image_url && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.image_url}
                      alt=""
                      fill
                      className="object-cover opacity-50"
                      unoptimized
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-background/90 rounded-full p-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    </div>
                  </div>
                )}

                {!item.image_url && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                )}

                <h1 className="text-2xl sm:text-3xl font-bold">{item.title}</h1>

                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Extracting content...</span>
                </div>

                <p className="text-sm text-muted-foreground">
                  This usually takes a few seconds
                </p>
              </div>
            </div>
          ) : isArticle ? (
            // Article Reader View - Wrapped in ReaderPane for theme/display styling
            <ReaderPane className="min-h-[calc(100vh-3.5rem)]">
              <article className="max-w-[750px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-20">
                {/* Article Header */}
                <header className="reader-header mb-12">
                  <h1 className="text-[2.5rem] sm:text-[2.75rem] font-bold leading-[1.15] tracking-tight mb-5">
                    {item.title}
                  </h1>

                  {item.description && (
                    <p className="text-xl leading-relaxed mb-8 opacity-70">
                      {item.description}
                    </p>
                  )}

                  <div className="reader-meta flex flex-wrap items-center gap-x-5 gap-y-2 text-sm border-t border-b py-4">
                    {item.author && (
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="h-4 w-4" />
                        <span className="font-medium">{item.author}</span>
                      </div>
                    )}

                    {item.publish_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(item.publish_date)}</span>
                      </div>
                    )}

                    {item.reading_time && (
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        <span>{item.reading_time} min read</span>
                      </div>
                    )}
                  </div>
                </header>

                {/* Article Content */}
                <div className="prose-reader">
                  <Markdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      // Custom image component with error handling and lazy loading
                      img: ({ src, alt, ...props }) => {
                        if (!src) return null;
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={src}
                            alt={alt || ""}
                            loading="lazy"
                            onError={(e) => {
                              // Hide broken images
                              e.currentTarget.style.display = "none";
                            }}
                            className="rounded-lg max-w-full h-auto my-6"
                            {...props}
                          />
                        );
                      },
                    }}
                  >
                    {item.content}
                  </Markdown>
                </div>
              </article>
            </ReaderPane>
          ) : item.processing_status === "failed" ? (
            // Failed extraction view (likely paywall)
            <div className="max-w-2xl mx-auto px-6 py-12">
              <div className="text-center space-y-6">
                {item.image_url && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.image_url}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <h1 className="text-2xl sm:text-3xl font-bold">{item.title}</h1>

                {item.description && (
                  <p className="text-muted-foreground">{item.description}</p>
                )}

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm">
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
                    Content couldn&apos;t be extracted
                  </p>
                  <p className="text-muted-foreground mt-1">
                    This article may be behind a paywall or require login.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button asChild size="lg">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Read on {getDomain(item.url)}
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleRefreshContent}
                    disabled={isPending}
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4 mr-2",
                        isPending && "animate-spin"
                      )}
                    />
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Non-Article View (Preview + Link)
            <div className="max-w-2xl mx-auto px-6 py-12">
              <div className="text-center space-y-6">
                {item.image_url && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.image_url}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <h1 className="text-2xl sm:text-3xl font-bold">{item.title}</h1>

                {item.description && (
                  <p className="text-muted-foreground">{item.description}</p>
                )}

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Image
                    src={getFaviconUrl(item.url)}
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4"
                    unoptimized
                  />
                  <span>{getDomain(item.url)}</span>
                </div>

                <Button asChild size="lg">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in {getDomain(item.url)}
                  </a>
                </Button>

                {item.type === "video" && (
                  <p className="text-sm text-muted-foreground">
                    Video content - click above to watch
                  </p>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed right-0 top-14 bottom-0 w-80 bg-muted/30 border-l overflow-y-auto transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "translate-x-full",
            "hidden sm:block"
          )}
        >
          <div className="p-6 space-y-6">
            {/* Source */}
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Source
              </h3>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-accent transition-colors"
              >
                <Image
                  src={getFaviconUrl(item.url)}
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6"
                  unoptimized
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{getDomain(item.url)}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.url}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              </a>
            </section>

            {/* AI Summary */}
            {item.ai_summary && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Summary
                </h3>
                <p className="text-sm leading-relaxed bg-background p-3 rounded-lg">
                  {item.ai_summary}
                </p>
              </section>
            )}

            {/* Topics */}
            {topics.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <span
                      key={topic.id}
                      className="px-2.5 py-1 text-xs font-medium bg-background rounded-full border"
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Metadata */}
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">
                    {item.ai_content_type || item.type}
                  </span>
                </div>

                {item.reading_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reading time</span>
                    <span>{item.reading_time} min</span>
                  </div>
                )}

                {item.word_count && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Word count</span>
                    <span>{item.word_count.toLocaleString()}</span>
                  </div>
                )}

                {item.author && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Author</span>
                    <span className="truncate ml-4">{item.author}</span>
                  </div>
                )}

                {item.publish_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span>{formatDate(item.publish_date)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saved</span>
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
            </section>

            {/* Actions */}
            <section className="pt-4 border-t">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open Original
                  </a>
                </Button>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
