import { getQueueItems } from "@/lib/actions/views";
import { ItemsView } from "@/components/items/items-view";

export default async function QueuePage() {
  const items = await getQueueItems();

  return (
    <ItemsView
      items={items}
      addItemTargetStatus="queue"
      emptyState={
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          <p>Your queue is empty.</p>
          <p className="text-sm">
            Move items from your inbox to get started.
          </p>
        </div>
      }
    />
  );
}

