import { getInboxItems } from "@/lib/actions/items";
import { ItemsView } from "@/components/items/items-view";
import { AddItemInput } from "@/components/items/add-item-input";

export default async function InboxPage() {
  const items = await getInboxItems();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <AddItemInput />
      </div>

      <ItemsView
        items={items}
        emptyState={
          <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
            <p>Your inbox is empty.</p>
            <p className="text-sm">Add a URL above to get started.</p>
          </div>
        }
      />
    </div>
  );
}
