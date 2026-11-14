"use client";
import { useEffect, useId, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { icons } from "@/design/system";

export type ComboOption = { value: string; label: string };
export function Combobox({
  label,
  value,
  selectedLabel,
  options,
  onChange,
  onSearch,
  disabled = false,
  loading = false,
  placeholder = "Search and select",
  hint,
}: {
  label: string;
  value: string;
  selectedLabel?: string;
  options: ComboOption[];
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const shown = onSearch
    ? options
    : options
        .filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase()),
        )
        .toSorted(
          (a, b) =>
            Number(b.label.toLowerCase() === query.toLowerCase()) -
              Number(a.label.toLowerCase() === query.toLowerCase()) ||
            Number(b.label.toLowerCase().startsWith(query.toLowerCase())) -
              Number(a.label.toLowerCase().startsWith(query.toLowerCase())) ||
            a.label.localeCompare(b.label),
        );
  useEffect(() => {
    if (open)
      document
        .getElementById(`${id}-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, id, open]);
  const selected =
    selectedLabel ?? options.find((item) => item.value === value)?.label ?? "";
  function search(text: string) {
    setQuery(text);
    setActive(0);
    onSearch?.(text);
  }
  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }
  return (
    <div
      className="form-field combo-field"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <label htmlFor={id}>{label}</label>
      <div className="combo-input">
        <input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          aria-activedescendant={
            open && shown[active] ? `${id}-${active}` : undefined
          }
          aria-describedby={hint ? `${id}-hint` : undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={open ? query : selected}
          onFocus={() => {
            setOpen(true);
            search("");
          }}
          onChange={(event) => {
            setOpen(true);
            search(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActive((index) =>
                Math.max(
                  0,
                  Math.min(
                    shown.length - 1,
                    index + (event.key === "ArrowDown" ? 1 : -1),
                  ),
                ),
              );
            }
            if (event.key === "Enter" && open) {
              event.preventDefault();
              if (shown[active]) choose(shown[active].value);
            }
          }}
        />
        <ChevronDown size={icons.control} />
      </div>
      {open && (
        <div
          className="combo-options"
          role="listbox"
          id={`${id}-options`}
          aria-label={`${label} options`}
        >
          {loading ? (
            <p role="status">Loading…</p>
          ) : shown.length ? (
            shown.map((item, index) => (
              <button
                type="button"
                key={item.value}
                role="option"
                id={`${id}-${index}`}
                aria-selected={value === item.value}
                className={active === index ? "active" : ""}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(item.value)}
              >
                {item.label}
                {value === item.value && <Check size={icons.control} />}
              </button>
            ))
          ) : (
            <p>No matches. Try another search.</p>
          )}
        </div>
      )}
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
    </div>
  );
}
