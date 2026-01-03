import { getInboxItems } from "@/lib/actions/items";
import { ItemsView } from "@/components/items/items-view";

export default async function InboxPage() {
  const items = await getInboxItems();

  return (
    <ItemsView
      items={items}
      context="inbox"
      emptyState={
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          <p className="text-lg font-medium">Inbox zero!</p>
          <p className="text-sm">Paste a URL above to capture your first link.</p>
        </div>
      }
    />
  );
}

