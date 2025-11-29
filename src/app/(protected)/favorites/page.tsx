import { getFavoriteItems } from "@/lib/actions/items";
import { ItemsView } from "@/components/items/items-view";

export default async function FavoritesPage() {
  const items = await getFavoriteItems();

  return (
    <ItemsView
      items={items}
      emptyState={
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          <p>No favorites yet.</p>
          <p className="text-sm">
            Star items to add them to your favorites collection.
          </p>
        </div>
      }
    />
  );
}

