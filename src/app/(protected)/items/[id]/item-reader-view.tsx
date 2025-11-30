"use client";

import { useState } from "react";
import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ItemActions } from "@/components/items/item-actions";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  Calendar,
  User,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
// COMPONENT
// =============================================================================

export function ItemReaderView({ item, topics }: ItemReaderViewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const hasContent = item.content && item.content.length > 100;
  const isArticle = item.type === "article" && hasContent;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link href="/everything">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
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
          </div>

          <div className="flex items-center gap-2">
            {item.reading_time && (
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{item.reading_time} min read</span>
              </div>
            )}

            <Button variant="outline" size="sm" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Open Original</span>
              </a>
            </Button>

            <ItemActions
              itemId={item.id}
              isLater={item.is_later}
              isFavorite={item.is_favorite}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-2"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Reader Pane */}
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarOpen ? "mr-80" : "mr-0"
          )}
        >
          {isArticle ? (
            // Article Reader View
            <article className="max-w-2xl mx-auto px-6 py-12">
              {/* Article Header */}
              <header className="mb-10">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold leading-tight mb-4">
                  {item.title}
                </h1>

                {item.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {item.author && (
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span>{item.author}</span>
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
                      {item.word_count && (
                        <span className="text-muted-foreground/60">
                          ({item.word_count.toLocaleString()} words)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </header>

              {/* Feature Image */}
              {item.image_url && (
                <div className="relative aspect-video mb-10 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={item.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-a:text-primary">
                <Markdown>{item.content}</Markdown>
              </div>
            </article>
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
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="gap-2">
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
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="p-6 space-y-6">
            {/* Source */}
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Source</h3>
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
                  <p className="text-xs text-muted-foreground truncate">{item.url}</p>
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
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">{item.ai_content_type || item.type}</span>
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
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
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

