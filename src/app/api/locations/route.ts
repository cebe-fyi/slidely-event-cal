import { countries, searchCities } from "@/features/locations/catalog";

export const runtime = "nodejs";
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const country = params.get("country");
  const query = params.get("q") ?? "";
  if (!country)
    return Response.json(
      { countries },
      { headers: { "Cache-Control": "public, max-age=86400" } },
    );
  if (!/^[A-Z]{2}$/.test(country) || query.length > 100)
    return Response.json(
      { error: "Choose a valid country and a shorter city search." },
      { status: 400 },
    );
  const results = searchCities(country, query);
  if (!results)
    return Response.json({ error: "Country not found." }, { status: 400 });
  return Response.json(results, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
