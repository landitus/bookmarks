import { Item } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { ItemActions } from "./item-actions";
import Link from "next/link";
import { Clock, Star, Play, BookOpen, ShoppingBag, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface ItemCardProps {
  item: Item;
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

function getTypeIcon(type: string) {
  switch (type) {
    case "video":
      return Play;
    case "article":
      return BookOpen;
    case "product":
      return ShoppingBag;
    default:
      return Globe;
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case "video":
      return "bg-red-500";
    case "article":
      return "bg-emerald-500";
    case "product":
      return "bg-violet-500";
    case "thread":
      return "bg-sky-500";
    case "image":
      return "bg-pink-500";
    default:
      return "bg-slate-500";
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ItemCard({ item }: ItemCardProps) {
  // Determine link destination
  // Articles with content go to reader view, everything else goes to external URL
  const hasReaderContent = item.type === "article" && item.content && item.content.length > 100;
  const href = hasReaderContent ? `/items/${item.id}` : item.url;
  const isExternal = !hasReaderContent;

  const TypeIcon = getTypeIcon(item.type);
  const typeColor = getTypeColor(item.type);

  return (
    <Card className="group overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        <div className="relative aspect-video bg-muted">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No Preview
            </div>
          )}

          {/* Video play overlay */}
          {item.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-black/80 transition-colors">
                <Play className="h-6 w-6 text-white fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Type badge */}
          <div
            className={cn(
              "absolute top-2 right-2 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider flex items-center gap-1",
              typeColor
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {item.type}
          </div>

          {/* Status badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {item.is_later && (
              <div className="bg-blue-500 text-white p-1 rounded">
                <Clock className="h-3 w-3" />
              </div>
            )}
            {item.is_favorite && (
              <div className="bg-yellow-400 text-white p-1 rounded">
                <Star className="h-3 w-3 fill-current" />
              </div>
            )}
          </div>

          {/* Processing indicator (bottom right) */}
          {(item.processing_status === "pending" || item.processing_status === "processing") && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing
            </div>
          )}

          {/* Reading time badge (bottom right for articles, only when processed) */}
          {item.type === "article" && item.reading_time && item.processing_status !== "pending" && item.processing_status !== "processing" && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.reading_time} min
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="p-4 pb-2 flex-row items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
          >
            <h3
              className="font-semibold leading-tight line-clamp-2 mb-1 hover:underline"
              title={item.title}
            >
              {item.title}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground truncate">{getDomain(item.url)}</p>
        </div>
        <ItemActions
          itemId={item.id}
          url={item.url}
          isLater={item.is_later}
          isFavorite={item.is_favorite}
        />
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-grow">
        {/* AI Summary or Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {item.ai_summary || item.description || "No description available."}
        </p>
      </CardContent>
    </Card>
  );
}
