export type EventPlace = {
  countryCode: string;
  countryName: string;
  city: string;
  stateCode: string;
  stateName: string;
  latitude: number;
  longitude: number;
};
export type LocationKind = "city" | "online" | "unknown";
export function placeKey(place: EventPlace) {
  return `${place.countryCode}:${place.stateCode}:${place.city}`;
}
export function placeLabel(place: EventPlace) {
  return `${place.city}, ${place.countryName}`;
}
export function isEventPlace(value: unknown): value is EventPlace {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.countryCode === "string" &&
    /^[A-Z]{2}$/.test(p.countryCode) &&
    ["countryName", "city", "stateCode", "stateName"].every(
      (key) =>
        typeof p[key] === "string" &&
        (p[key] as string).length > 0 &&
        (p[key] as string).length <= 160,
    ) &&
    typeof p.latitude === "number" &&
    Number.isFinite(p.latitude) &&
    Math.abs(p.latitude) <= 90 &&
    typeof p.longitude === "number" &&
    Number.isFinite(p.longitude) &&
    Math.abs(p.longitude) <= 180
  );
}
