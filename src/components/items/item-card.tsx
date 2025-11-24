import { Item } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Archive, Layers, Trash2 } from "lucide-react"
import Image from "next/image"

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative aspect-video bg-muted">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No Preview
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/75 text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider">
          {item.type}
        </div>
      </div>
      
      <CardHeader className="p-4 pb-0">
        <h3 className="font-semibold leading-tight line-clamp-2 mb-1" title={item.title}>
          {item.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {item.url}
        </p>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
           {item.description || "No description available."}
        </p>
      </CardContent>

      <CardFooter className="p-2 bg-muted/20 flex justify-between">
         <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Layers className="h-4 w-4" />
            <span className="sr-only">Move to Queue</span>
         </Button>
         <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Archive className="h-4 w-4" />
            <span className="sr-only">Archive</span>
         </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
         </Button>
      </CardFooter>
    </Card>
  )
}

