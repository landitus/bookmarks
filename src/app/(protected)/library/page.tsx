import { getLibraryItems } from "@/lib/actions/views";
import { ItemsView } from "@/components/items/items-view";

export default async function LibraryPage() {
  const items = await getLibraryItems();

  return (
    <ItemsView
      items={items}
      addItemTargetStatus="library"
      emptyState={
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          <p>Your library is empty.</p>
          <p className="text-sm">
            Archive items from your queue to build your collection.
          </p>
        </div>
      }
    />
  );
}
