'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createItem } from "@/lib/actions/items"
import { Plus } from "lucide-react"
import { useRef } from "react"

export function AddItemInput() {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form 
      ref={formRef}
      action={async (formData) => {
        await createItem(formData)
        formRef.current?.reset()
      }}
      className="flex w-full max-w-sm items-center space-x-2"
    >
      <Input 
        type="url" 
        name="url" 
        placeholder="Paste a URL to save..." 
        required 
      />
      <Button type="submit" size="icon">
        <Plus className="h-4 w-4" />
        <span className="sr-only">Add Item</span>
      </Button>
    </form>
  )
}

