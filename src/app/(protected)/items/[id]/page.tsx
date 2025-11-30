import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Item } from "@/lib/types";
import { ItemReaderView } from "./item-reader-view";

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getItem(id: string): Promise<Item | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: item, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !item) {
    return null;
  }

  return item as Item;
}

interface Topic {
  id: string;
  name: string;
  slug: string;
}

async function getItemTopics(itemId: string): Promise<Topic[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("item_topics")
    .select("topics(id, name, slug)")
    .eq("item_id", itemId);

  if (!data) return [];

  // Extract topics from nested response
  const topics: Topic[] = [];
  for (const row of data) {
    const topic = row.topics;
    if (topic && typeof topic === "object" && !Array.isArray(topic)) {
      topics.push(topic as Topic);
    }
  }
  return topics;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const item = await getItem(id);

  if (!item) {
    notFound();
  }

  const topics = await getItemTopics(id);

  return <ItemReaderView item={item} topics={topics} />;
}

