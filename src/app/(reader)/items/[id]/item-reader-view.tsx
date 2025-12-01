"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

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

function SourceDomainCenter({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
    >
      <Image
        src={getFaviconUrl(url)}
        alt=""
        width={16}
        height={16}
        className="w-4 h-4"
        unoptimized
      />
      <span className="max-w-[200px] truncate">{getDomain(url)}</span>
      <ExternalLink className="h-3 w-3 opacity-50" />
    </a>
  );
}

interface ReaderActionsProps {
  item: Item;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function ReaderActions({
  item,
  sidebarOpen,
  onToggleSidebar,
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

      {/* Item Actions (Later, Favorite, etc.) */}
      <ItemActions
        itemId={item.id}
        isLater={item.is_later}
        isFavorite={item.is_favorite}
        alwaysVisible
      />

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
// MAIN COMPONENT
// =============================================================================

export function ItemReaderView({ item, topics, user }: ItemReaderViewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const hasContent = item.content && item.content.length > 100;
  const isArticle = item.type === "article" && hasContent;

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
          />
        }
        bordered
      />

      {/* Main Content */}
      <div className="flex">
        {/* Reader Pane */}
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarOpen ? "sm:mr-80" : "mr-0"
          )}
        >
          {isArticle ? (
            // Article Reader View
            <article className="max-w-[750px] mx-auto px-6 py-12">
              {/* Article Header */}
              <header className="mb-12">
                <h1 className="text-[2.5rem] sm:text-[2.75rem] font-bold leading-[1.15] tracking-tight mb-5">
                  {item.title}
                </h1>

                {item.description && (
                  <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground border-t border-b py-4 border-border/50">
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
                <Markdown rehypePlugins={[rehypeRaw]}>{item.content}</Markdown>
              </div>
            </article>
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

                <Button asChild size="lg">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Read on {getDomain(item.url)}
                  </a>
                </Button>
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
