"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { dateRange, prettyDate } from "@/lib/dates/calendar";
import { layout } from "@/design/system";
import { categoryFor, type Category, type Tag, type TeamEvent } from "./types";

/** One event trigger/preview for agenda rows and calendar strips. Hover or focus
 * reveals supporting details; click opens the full sheet. Touch stays click-only. */
export function EventButton({
  event,
  categories,
  tags,
  className,
  style,
  children,
  onOpen,
}: {
  event: TeamEvent;
  categories: Category[];
  tags: Tag[];
  className: string;
  style?: CSSProperties;
  children: ReactNode;
  onOpen: (event: TeamEvent) => void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{
    x: number;
    y: number;
    above: boolean;
  } | null>(null);
  const id = useId();
  const category = categoryFor(event.categoryId, categories);
  function cancelTimer() {
    if (timer.current) clearTimeout(timer.current);
  }
  function hide() {
    cancelTimer();
    setPosition(null);
  }
  function show(delay = 0) {
    cancelTimer();
    timer.current = setTimeout(() => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(
        parseFloat(layout.hoverCardWidth),
        window.innerWidth - 24,
      );
      const above =
        rect.bottom + parseFloat(layout.hoverCardMaxHeight) + 8 >
          window.innerHeight && rect.top > window.innerHeight / 2;
      setPosition({
        x: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
        y: above ? window.innerHeight - rect.top + 8 : rect.bottom + 8,
        above,
      });
    }, delay);
  }
  function leave() {
    cancelTimer();
    timer.current = setTimeout(() => setPosition(null), 120);
  }
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!position) return;
    const close = () => setPosition(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [position]);
  return (
    <>
      <button
        ref={trigger}
        className={className}
        style={style}
        aria-label={`${event.title}, ${dateRange(event.startDate, event.endDate)}`}
        aria-describedby={position ? id : undefined}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") show(200);
        }}
        onPointerLeave={leave}
        onFocus={() => show()}
        onBlur={hide}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            hide();
          }
        }}
        onClick={() => {
          hide();
          onOpen(event);
        }}
      >
        {children}
      </button>
      {position &&
        createPortal(
          <div
            id={id}
            role="tooltip"
            className="event-hover-card"
            style={
              {
                left: position.x,
                ...(position.above
                  ? { bottom: position.y }
                  : { top: position.y }),
                "--event-color": category.color,
              } as CSSProperties & { "--event-color": string }
            }
            onPointerEnter={cancelTimer}
            onPointerLeave={leave}
          >
            <span className="hover-category">{category.name}</span>
            <strong>{event.title}</strong>
            <span>
              {prettyDate(event.startDate, true)}
              {event.endDate !== event.startDate
                ? ` – ${prettyDate(event.endDate, true)}`
                : ""}
            </span>
            <span>{event.location || "Location to confirm"}</span>
            {!!event.tagIds.length && (
              <span className="hover-tags">
                {event.tagIds
                  .map((id) => tags.find((t) => t.id === id)?.name)
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
            {event.description && <p>{event.description}</p>}
          </div>,
          document.body,
        )}
    </>
  );
}
