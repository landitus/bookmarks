import { getInboxItems } from "@/lib/actions/items"
import { ItemCard } from "@/components/items/item-card"
import { AddItemInput } from "@/components/items/add-item-input"

export default async function InboxPage() {
  const items = await getInboxItems()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <AddItemInput />
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
          <p>Your inbox is empty.</p>
          <p className="text-sm">Add a URL above to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

