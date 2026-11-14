// Server-side only: keep the full city dataset out of the browser bundle.
import { Country, State, City } from "country-state-city";
import type { EventPlace } from "./types";

export const countries = Country.getAllCountries().map((country) => ({
  value: country.isoCode,
  label: country.name,
}));
const cache = new Map<string, EventPlace[]>();
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function searchCities(countryCode: string, query: string) {
  const country = Country.getCountryByCode(countryCode);
  if (!country) return null;
  let cities = cache.get(countryCode);
  if (!cities) {
    const states = new Map(
      State.getStatesOfCountry(countryCode).map((state) => [
        state.isoCode,
        state.name,
      ]),
    );
    cities = (City.getCitiesOfCountry(countryCode) ?? [])
      .filter((city) => city.latitude && city.longitude)
      .map((city) => ({
        countryCode,
        countryName: country.name,
        city: city.name,
        stateCode: city.stateCode,
        stateName: states.get(city.stateCode) ?? city.stateCode,
        latitude: Number(city.latitude),
        longitude: Number(city.longitude),
      }));
    // Bound the per-country derived cache; npm's dataset itself stays module-cached.
    if (cache.size >= 12) cache.delete(cache.keys().next().value!);
    cache.set(countryCode, cities);
  }
  const q = normalize(query.trim());
  const matches = cities.filter((city) =>
    normalize(`${city.city} ${city.stateName}`).includes(q),
  );
  matches.sort(
    (a, b) =>
      Number(normalize(b.city) === q) - Number(normalize(a.city) === q) ||
      Number(normalize(b.city).startsWith(q)) -
        Number(normalize(a.city).startsWith(q)) ||
      a.city.localeCompare(b.city) ||
      a.stateCode.localeCompare(b.stateCode),
  );
  return { cities: matches.slice(0, 100), total: matches.length };
}
