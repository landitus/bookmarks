import { getInboxItems } from "@/lib/actions/items";
import { ItemsView } from "@/components/items/items-view";

export default async function InboxPage() {
  const items = await getInboxItems();

  return (
    <ItemsView
      items={items}
      addItemTargetStatus="inbox"
      emptyState={
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          <p>Your inbox is empty.</p>
          <p className="text-sm">Add a URL above to get started.</p>
        </div>
      }
    />
  );
}

