import { getSearchSuggestions } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const suggestions = await getSearchSuggestions(q);
  return Response.json({ suggestions });
}
