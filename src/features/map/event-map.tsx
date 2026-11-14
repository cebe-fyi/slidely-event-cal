"use client";
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { LocateFixed } from "lucide-react";
import { icons, layout } from "@/design/system";
import { categoryFor, type Category, type TeamEvent } from "../events/types";
import { groupMapEvents } from "../locations/event-location";
import { placeLabel } from "../locations/types";
import { dateRange } from "@/lib/dates/calendar";
import { mapConfig } from "./config";

export default function EventMap({
  events,
  categories,
  onOpen,
}: {
  events: TeamEvent[];
  categories: Category[];
  onOpen: (event: TeamEvent) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const tileRef = useRef<Leaflet.TileLayer | null>(null);
  const fitRef = useRef<() => void>(() => {});
  const openRef = useRef(onOpen);
  const [api, setApi] = useState<typeof Leaflet | null>(null);
  const [failed, setFailed] = useState(false);
  const [tileFailed, setTileFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    openRef.current = onOpen;
  }, [onOpen]);
  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    let auditTimer: ReturnType<typeof setTimeout> | undefined;
    import("leaflet")
      .then((L) => {
        if (disposed || !container.current) return;
        const map = L.map(container.current, {
          center: [20, 20],
          zoom: 2,
          minZoom: 0,
          maxZoom: 18,
          worldCopyJump: true,
          scrollWheelZoom: false,
        });
        mapRef.current = map;
        const tiles = L.tileLayer(mapConfig.tileUrl, {
          attribution: mapConfig.attribution,
          maxZoom: 19,
        }).addTo(map);
        tileRef.current = tiles;
        function auditTiles() {
          clearTimeout(auditTimer);
          auditTimer = setTimeout(() => {
            if (disposed || !container.current) return;
            const bounds = container.current.getBoundingClientRect();
            const failed = [
              ...container.current.querySelectorAll<HTMLImageElement>(
                "img.leaflet-tile",
              ),
            ].some((image) => {
              const rect = image.getBoundingClientRect();
              return (
                image.complete &&
                !image.naturalWidth &&
                rect.right > bounds.left &&
                rect.left < bounds.right &&
                rect.bottom > bounds.top &&
                rect.top < bounds.bottom
              );
            });
            setTileFailed(failed);
          }, 0);
        }
        tiles.on("tileerror tileload tileunload load", auditTiles);
        observer = new ResizeObserver(() => {
          map.invalidateSize();
          fitRef.current();
        });
        observer.observe(container.current);
        setApi(L);
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      clearTimeout(auditTimer);
      observer?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      tileRef.current = null;
    };
  }, [retry]);
  const dataKey = JSON.stringify({ events, categories });
  useEffect(() => {
    const map = mapRef.current;
    if (!api || !map) return;
    const data = JSON.parse(dataKey) as {
      events: TeamEvent[];
      categories: Category[];
    };
    const { groups } = groupMapEvents(data.events);
    const markers = api.layerGroup().addTo(map);
    for (const group of groups) {
      const category = categoryFor(group.events[0].categoryId, data.categories);
      const badge = document.createElement("span");
      badge.className = "map-marker-badge";
      badge.style.setProperty("--event-color", category.color);
      badge.textContent = String(group.events.length);
      const size = parseFloat(layout.mapMarkerSize);
      const marker = api
        .marker([group.place.latitude, group.place.longitude], {
          icon: api.divIcon({
            html: badge,
            className: "event-map-marker",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          }),
          title: `${placeLabel(group.place)} — ${group.events.length} ${group.events.length === 1 ? "event" : "events"}`,
          alt: `Events in ${group.place.city}`,
          keyboard: true,
        })
        .addTo(markers);
      marker
        .getElement()
        ?.setAttribute(
          "aria-label",
          `${placeLabel(group.place)} — ${group.events.length} ${group.events.length === 1 ? "event" : "events"}`,
        );
      if (group.events.length === 1)
        marker.on("click", () => openRef.current(group.events[0]));
      else {
        const popup = document.createElement("div");
        popup.className = "map-popup-events";
        const heading = document.createElement("strong");
        heading.textContent = placeLabel(group.place);
        popup.append(heading);
        for (const event of group.events) {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = `${event.title} · ${dateRange(event.startDate, event.endDate)}`;
          button.addEventListener("click", () => openRef.current(event));
          popup.append(button);
        }
        marker.bindPopup(popup);
      }
    }
    function fit() {
      if (!map || !api) return;
      if (groups.length)
        map.fitBounds(
          api.latLngBounds(
            groups.map(
              (group) =>
                [group.place.latitude, group.place.longitude] as [
                  number,
                  number,
                ],
            ),
          ),
          {
            padding: [
              Math.min(35, (container.current?.clientWidth ?? 420) / 12),
              Math.min(35, (container.current?.clientWidth ?? 420) / 12),
            ],
            maxZoom: 7,
            animate: false,
          },
        );
      else map.setView([20, 20], 2, { animate: false });
    }
    fitRef.current = fit;
    fit();
    return () => {
      markers.remove();
    };
  }, [api, dataKey]);
  const { groups, unmapped } = groupMapEvents(events);
  return (
    <section className="map-workspace" aria-label="Event locations">
      <div className="map-summary">
        <span>
          {events.length - unmapped.length} mapped · {groups.length}{" "}
          {groups.length === 1 ? "city" : "cities"} · {unmapped.length} online /
          unlocated
        </span>
        <button
          type="button"
          className="secondary-button"
          onClick={() => fitRef.current()}
        >
          <LocateFixed size={icons.control} />
          Fit events
        </button>
      </div>
      <div className="map-frame">
        <div
          className="event-map"
          ref={container}
          role="region"
          aria-label="Interactive event map"
        />
        {!api && !failed && (
          <p className="map-message" role="status">
            Loading map…
          </p>
        )}
        {failed && (
          <p className="map-message" role="alert">
            Could not open the map.{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setFailed(false);
                setRetry((n) => n + 1);
              }}
            >
              Retry
            </button>
          </p>
        )}
        {tileFailed && (
          <p className="map-message" role="status">
            Map tiles could not load. Event pins and the list below still work.{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setTileFailed(false);
                tileRef.current?.redraw();
              }}
            >
              Retry tiles
            </button>
          </p>
        )}
      </div>
      <p className="field-hint">
        Pins show city centres. Numbers group events at the same city
        coordinates; click a pin to view events. Use + / − to zoom or drag to
        explore.
      </p>
      <MapEventList
        title={
          events.length
            ? "Mapped events"
            : "No events match this period and filters"
        }
        events={groups.flatMap((group) => group.events)}
        onOpen={onOpen}
      />
      {!!unmapped.length && (
        <MapEventList
          title="Online & location to confirm"
          events={unmapped}
          onOpen={onOpen}
        />
      )}
    </section>
  );
}

function MapEventList({
  title,
  events,
  onOpen,
}: {
  title: string;
  events: TeamEvent[];
  onOpen: (event: TeamEvent) => void;
}) {
  return (
    <div className="map-event-index">
      <h3>{title}</h3>
      {events
        .toSorted(
          (a, b) =>
            a.startDate.localeCompare(b.startDate) ||
            a.title.localeCompare(b.title),
        )
        .map((event) => (
          <button
            type="button"
            className="map-index-event"
            key={event.id}
            onClick={() => onOpen(event)}
          >
            <strong>{event.title}</strong>
            <span>
              {dateRange(event.startDate, event.endDate)} ·{" "}
              {event.location || "Location to confirm"}
            </span>
          </button>
        ))}
    </div>
  );
}
