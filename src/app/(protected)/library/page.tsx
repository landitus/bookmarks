import { getLibraryItems } from "@/lib/actions/items";
import { ItemsView } from "@/components/items/items-view";

interface LibraryPageProps {
  searchParams: Promise<{ favorites?: string }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const favoritesOnly = params.favorites === "true";
  const items = await getLibraryItems(favoritesOnly);

  return (
    <ItemsView
      items={items}
      context="library"
      showFavoritesFilter
      favoritesOnly={favoritesOnly}
      emptyState={
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          {favoritesOnly ? (
            <>
              <p className="text-lg font-medium">No favorites yet</p>
              <p className="text-sm">Star items in your Library to see them here.</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">Your Library is empty</p>
              <p className="text-sm">Keep items from your Inbox to build your collection.</p>
            </>
          )}
        </div>
      }
    />
  );
}

