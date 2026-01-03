import { getArchivedItems } from "@/lib/actions/items";
import { ItemsView } from "@/components/items/items-view";

export default async function ArchivePage() {
  const items = await getArchivedItems();

  return (
    <ItemsView
      items={items}
      context="archive"
      emptyState={
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          <p className="text-lg font-medium">Archive is empty</p>
          <p className="text-sm">Discarded items will appear here.</p>
        </div>
      }
    />
  );
}

