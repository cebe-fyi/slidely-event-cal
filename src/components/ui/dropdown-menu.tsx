"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Ellipsis } from "lucide-react";
import { icons, layout } from "@/design/system";

export type MenuAction = {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  danger?: boolean;
};

export function DropdownMenu({
  label,
  actions,
}: {
  label: string;
  actions: MenuAction[];
}) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  const open = position !== null;
  function close(restore = false) {
    setPosition(null);
    if (restore) trigger.current?.focus();
  }
  function show() {
    const rect = trigger.current!.getBoundingClientRect();
    const width = parseFloat(layout.menuWidth);
    const gap = parseFloat(layout.menuGap);
    const height = actions.length * parseFloat(layout.menuItemHeight) + gap * 3;
    setPosition({
      x: Math.max(
        gap,
        Math.min(rect.right - width, window.innerWidth - width - gap),
      ),
      y:
        rect.bottom + height + gap > window.innerHeight
          ? Math.max(gap, rect.top - height - gap)
          : rect.bottom + gap,
    });
  }
  useEffect(() => {
    if (!open) return;
    menu.current
      ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
      ?.focus();
    function outside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menu.current?.contains(event.target) &&
        !trigger.current?.contains(event.target)
      )
        setPosition(null);
    }
    function reposition() {
      setPosition(null);
    }
    function outsideScroll(event: Event) {
      if (event.target instanceof Node && menu.current?.contains(event.target))
        return;
      setPosition(null);
    }
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", reposition);
    document.addEventListener("scroll", outsideScroll, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("scroll", outsideScroll, true);
    };
  }, [open]);
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = [
      ...menu.current!.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled)",
      ),
    ];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    }
    if (event.key === "Tab") close(true);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? buttons.length - 1
            : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) %
              buttons.length;
      buttons[next]?.focus();
    }
  }
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="icon-button item-options"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => (open ? close(true) : show())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            show();
          }
        }}
      >
        <Ellipsis size={icons.control} />
      </button>
      {position &&
        createPortal(
          <div
            ref={menu}
            id={id}
            role="menu"
            aria-label={label}
            className="dropdown-menu"
            style={
              {
                "--menu-x": `${position.x}px`,
                "--menu-y": `${position.y}px`,
              } as CSSProperties
            }
            onKeyDown={navigate}
          >
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                className={action.danger ? "danger-menu-item" : undefined}
                disabled={action.disabled}
                onClick={() => {
                  close(true);
                  action.onSelect();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
