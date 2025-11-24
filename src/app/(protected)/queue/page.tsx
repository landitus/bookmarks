import { getQueueItems } from "@/lib/actions/views";
import { ItemCard } from "@/components/items/item-card";

export default async function QueuePage() {
  const items = await getQueueItems();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Queue</h1>
          <p className="text-muted-foreground mt-1">
            Items ready to consume
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          <p>Your queue is empty.</p>
          <p className="text-sm">Move items from your inbox to get started.</p>
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

