"use client";
import { useEffect, useState } from "react";
import { FormField } from "@/components/ui/modal";
import { Combobox, type ComboOption } from "@/components/ui/combobox";
import { placeKey, type EventPlace, type LocationKind } from "./types";

export function LocationFields({
  kind,
  place,
  legacyLocation,
  onKindChange,
  onPlaceChange,
}: {
  kind: LocationKind;
  place: EventPlace | undefined;
  legacyLocation?: string;
  onKindChange: (kind: LocationKind) => void;
  onPlaceChange: (place: EventPlace | undefined) => void;
}) {
  const [country, setCountry] = useState(place?.countryCode ?? "");
  const [countries, setCountries] = useState<ComboOption[]>([]);
  const [cities, setCities] = useState<EventPlace[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/locations", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => setCountries(data.countries))
      .catch((error) => {
        if (error.name !== "AbortError")
          setError("Could not load locations. Try again.");
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    if (!country || kind !== "city") return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      fetch(
        `/api/locations?country=${country}&q=${encodeURIComponent(query)}`,
        { signal: controller.signal },
      )
        .then((response) => {
          if (!response.ok) throw new Error();
          return response.json();
        })
        .then((data) => {
          setCities(data.cities);
          setTotal(data.total);
          setLoading(false);
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            setError("Could not load cities. Try again.");
            setLoading(false);
          }
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [country, kind, query, retry]);
  return (
    <>
      <FormField
        name="locationKind"
        label="Event location"
        type="select"
        value={kind}
        onChange={(value) => {
          onKindChange(value as LocationKind);
          onPlaceChange(undefined);
          setCountry("");
          setCities([]);
        }}
        options={[
          { value: "city", label: "In person" },
          { value: "online", label: "Online" },
          { value: "unknown", label: "Location to confirm" },
        ]}
      />
      {kind === "city" && (
        <>
          <Combobox
            label="Country"
            value={country}
            selectedLabel={place?.countryName}
            options={countries}
            loading={!countries.length && !error}
            placeholder="Search countries"
            onChange={(value) => {
              setCountry(value);
              setCities([]);
              setQuery("");
              onPlaceChange(undefined);
            }}
          />
          <Combobox
            label="City"
            value={place ? placeKey(place) : ""}
            selectedLabel={
              place ? `${place.city}, ${place.stateName}` : undefined
            }
            options={cities.map((city) => ({
              value: placeKey(city),
              label: `${city.city}, ${city.stateName}`,
            }))}
            disabled={!country}
            loading={loading}
            placeholder={country ? "Search cities" : "Choose a country first"}
            onSearch={(value) => {
              if (value === query) return;
              setQuery(value);
              setCities([]);
              setLoading(true);
            }}
            onChange={(value) =>
              onPlaceChange(cities.find((city) => placeKey(city) === value))
            }
            hint={
              place
                ? "Map pin uses the city centre, not an exact venue."
                : total > 100
                  ? "Type to search all cities in this country."
                  : "Select a city to place the event on the map."
            }
          />
        </>
      )}
      {legacyLocation && !place && kind === "unknown" && (
        <p className="field-hint">
          Previous location: {legacyLocation}. Choose In person to add a city
          and map pin, or keep this text.
        </p>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setError("");
              setRetry((n) => n + 1);
            }}
          >
            Retry
          </button>
        </p>
      )}
    </>
  );
}
