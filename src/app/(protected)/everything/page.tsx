import { getItems } from "@/lib/actions/items";
import { ItemsView } from "@/components/items/items-view";

export default async function EverythingPage() {
  const items = await getItems();

  return (
    <ItemsView
      items={items}
      emptyState={
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          <p>No items yet.</p>
          <p className="text-sm">Paste a URL above to save your first link.</p>
        </div>
      }
    />
  );
}
