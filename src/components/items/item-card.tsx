import { Item } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { ItemActions } from "./item-actions";
import Link from "next/link";
import { Clock, Star } from "lucide-react";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <Link href={item.url} target="_blank" rel="noopener noreferrer">
        <div className="relative aspect-video bg-muted">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No Preview
            </div>
          )}
          {/* Type badge */}
          <div className="absolute top-2 right-2 bg-black/75 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider">
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
        </div>
      </Link>

      <CardHeader className="p-4 pb-2 flex-row items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link href={item.url} target="_blank" rel="noopener noreferrer">
            <h3
              className="font-semibold leading-tight line-clamp-2 mb-1 hover:underline"
              title={item.title}
            >
              {item.title}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground truncate">{item.url}</p>
        </div>
        <ItemActions
          itemId={item.id}
          isLater={item.is_later}
          isFavorite={item.is_favorite}
        />
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {item.description || "No description available."}
        </p>
      </CardContent>
    </Card>
  );
}
