import { getLibraryItems } from "@/lib/actions/views";
import { ItemCard } from "@/components/items/item-card";

export default async function LibraryPage() {
  const items = await getLibraryItems();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground mt-1">
            Your permanent collection
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          <p>Your library is empty.</p>
          <p className="text-sm">Archive items from your queue to build your collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

