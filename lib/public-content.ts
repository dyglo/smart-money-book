import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

// Public server reads always run with the publishable key and public RLS.
export const publicTutorial = cache(async (slug: string) => {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  const { data, error } = await client.from("posts").select("title,description").eq("slug", slug).eq("kind", "tutorial").eq("status", "published").maybeSingle();
  if (error) throw error;
  return data;
});
