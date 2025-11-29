import { getLaterItems } from "@/lib/actions/items";
import { ItemsView } from "@/components/items/items-view";

export default async function LaterPage() {
  const items = await getLaterItems();

  return (
    <ItemsView
      items={items}
      emptyState={
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          <p>Nothing for later.</p>
          <p className="text-sm">
            Mark items as &quot;Later&quot; to watch or read them here.
          </p>
        </div>
      }
    />
  );
}

