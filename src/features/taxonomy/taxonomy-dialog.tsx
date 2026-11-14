"use client";

import { brandPalette, icons } from "@/design/system";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Merge, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import {
  affectedEventCount,
  removeVocabulary,
  restoreEvent,
  saveVocabulary,
  type VocabularyKind,
  type WorkspaceData,
} from "../workspace/model";
import { dateRange } from "@/lib/dates/calendar";

type Tab = VocabularyKind | "trash";
type Props = {
  initialTab: Tab;
  data: WorkspaceData;
  error: string;
  onChange: (update: (data: WorkspaceData) => WorkspaceData) => boolean;
  onClose: () => void;
};
const singular = (kind: VocabularyKind) =>
  kind === "categories" ? "category" : "tag";

export function TaxonomyDialog({
  initialTab,
  data,
  error,
  onChange,
  onClose,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [editor, setEditor] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);
  const [action, setAction] = useState<{
    id: string;
    type: "merge" | "delete";
  } | null>(null);
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  function switchTab(tab: Tab) {
    setTab(tab);
    setEditor(null);
    setAction(null);
    setMessage("");
  }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editor || tab === "trash") return;
    const fields = new FormData(e.currentTarget);
    const creating = !editor.id;
    const id = editor.id || crypto.randomUUID();
    if (
      onChange((current) =>
        saveVocabulary(
          current,
          tab,
          id,
          String(fields.get("name")),
          String(fields.get("color")),
        ),
      )
    ) {
      setEditor(null);
      setMessage(
        `${singular(tab) === "category" ? "Category" : "Tag"} ${creating ? "created" : "updated"}.`,
      );
    }
  }
  function confirmAction() {
    if (!action || tab === "trash") return;
    if (
      onChange((current) =>
        removeVocabulary(
          current,
          tab,
          action.id,
          target,
          action.type === "merge",
        ),
      )
    ) {
      setMessage(
        `${tab === "categories" ? "Category" : "Tag"} ${action.type === "merge" ? "merged" : "deleted"}. Event associations updated.`,
      );
      setAction(null);
      setEditor(null);
    }
  }
  const currentItem =
    tab === "trash"
      ? undefined
      : data[tab].find((item) => item.id === action?.id);

  return (
    <dialog
      ref={dialog}
      className="event-dialog taxonomy-dialog"
      aria-labelledby="manage-title"
      onCancel={onClose}
    >
      <div className="manage-content">
        <div className="dialog-header">
          <div>
            <span className="small-muted">Saved in this browser</span>
            <h2 id="manage-title">Organize your calendar</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close calendar settings"
          >
            <X size={icons.navigation} />
          </button>
        </div>
        <div className="manage-tabs" aria-label="Calendar settings section">
          {(["categories", "tags", "trash"] as const).map((item) => (
            <button
              key={item}
              aria-pressed={tab === item}
              onClick={() => switchTab(item)}
            >
              {item === "categories"
                ? "Categories"
                : item === "tags"
                  ? "Tags"
                  : `Trash (${data.trash.length})`}
            </button>
          ))}
        </div>
        <p className="manage-description">
          {tab === "categories"
            ? "One category gives each event its calendar color. Merges keep all events."
            : tab === "tags"
              ? "Use tags to group opportunities across industries. Events can have several tags."
              : "Deleted events stay here until you restore them. This local preview never permanently deletes events."}
        </p>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="manage-success">
            {message}
          </p>
        )}
        {tab === "trash" ? (
          <div className="trash-list">
            {data.trash.length === 0 ? (
              <p className="manage-empty">
                No deleted events. Everything is right where it belongs.
              </p>
            ) : (
              data.trash.map((event) => (
                <div className="manage-row" key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <span>
                      {dateRange(event.startDate, event.endDate)} ·{" "}
                      {event.location || "Location to confirm"}
                    </span>
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      if (
                        onChange((current) => restoreEvent(current, event.id))
                      )
                        setMessage("Event restored to your calendar.");
                    }}
                    aria-label={`Restore ${event.title}`}
                  >
                    <RotateCcw size={icons.control} />
                    Restore
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="manage-list">
              {data[tab].length ? (
                [...data[tab]]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <div className="manage-row" key={item.id}>
                      <span
                        className="manage-color"
                        style={{ background: item.color }}
                      />
                      <div className="manage-item-name">
                        <strong>{item.name}</strong>
                        <span>
                          {affectedEventCount(data, tab, item.id)} linked
                          events, including trash
                        </span>
                      </div>
                      <button
                        className="icon-button"
                        aria-label={`Edit ${item.name}`}
                        onClick={() => {
                          setEditor(item);
                          setAction(null);
                          setMessage("");
                        }}
                      >
                        <Pencil size={icons.control} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Merge ${item.name}`}
                        disabled={data[tab].length < 2}
                        onClick={() => {
                          setAction({ id: item.id, type: "merge" });
                          setTarget("");
                          setEditor(null);
                          setMessage("");
                        }}
                      >
                        <Merge size={icons.control} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Delete ${item.name}`}
                        onClick={() => {
                          setAction({ id: item.id, type: "delete" });
                          setTarget("");
                          setEditor(null);
                          setMessage("");
                        }}
                      >
                        <Trash2 size={icons.control} />
                      </button>
                    </div>
                  ))
              ) : (
                <p className="manage-empty">
                  No {tab} yet. Create your first one below.
                </p>
              )}
            </div>
            {!editor && !action && (
              <button
                className="secondary-button new-vocabulary"
                onClick={() => {
                  setEditor({ id: "", name: "", color: brandPalette[0].color });
                  setMessage("");
                }}
              >
                <Plus size={icons.control} />
                New {singular(tab)}
              </button>
            )}
            {editor && (
              <form
                className="vocabulary-editor"
                onSubmit={save}
                key={`${tab}-${editor.id}`}
              >
                <h3>
                  {editor.id ? "Edit" : "New"} {singular(tab)}
                </h3>
                <div className="vocabulary-fields">
                  <label htmlFor="vocabulary-name">
                    Name
                    <input
                      id="vocabulary-name"
                      name="name"
                      defaultValue={editor.name}
                      maxLength={64}
                      placeholder={
                        tab === "categories"
                          ? "e.g. Healthcare"
                          : "e.g. Speaker prospect"
                      }
                      required
                      autoFocus
                    />
                  </label>
                  <label htmlFor="vocabulary-color">
                    Color
                    <select
                      id="vocabulary-color"
                      name="color"
                      defaultValue={editor.color}
                    >
                      {brandPalette.map((color) => (
                        <option key={color.id} value={color.color}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="dialog-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setEditor(null)}
                  >
                    Cancel
                  </button>
                  <button className="primary-button" type="submit">
                    Save {singular(tab)}
                  </button>
                </div>
              </form>
            )}
            {action && currentItem && (
              <div className="vocabulary-confirm">
                <h3>
                  {action.type === "merge" ? "Merge" : "Delete"}{" "}
                  {currentItem.name}?
                </h3>
                <p>
                  {affectedEventCount(data, tab, action.id)} linked events
                  (including trash) will be updated.{" "}
                  {tab === "categories"
                    ? "Choose where their category should go."
                    : action.type === "merge"
                      ? "Existing destination tags will not be duplicated."
                      : "Only the tag is removed; all events are kept."}
                </p>
                {(action.type === "merge" || tab === "categories") && (
                  <label htmlFor="vocabulary-target">
                    {action.type === "merge"
                      ? "Merge into"
                      : "Reassign events to"}
                    <select
                      id="vocabulary-target"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                    >
                      <option value="">
                        {action.type === "merge"
                          ? "Choose a destination"
                          : "Uncategorized"}
                      </option>
                      {data[tab]
                        .filter((item) => item.id !== action.id)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                <div className="dialog-actions">
                  <button
                    className="secondary-button"
                    onClick={() => setAction(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="primary-button"
                    disabled={action.type === "merge" && !target}
                    onClick={confirmAction}
                  >
                    {action.type === "merge"
                      ? "Confirm merge"
                      : `Delete ${singular(tab)}`}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        <div className="manage-footer">
          Local preview only. These changes are not shared with the team.
        </div>
      </div>
    </dialog>
  );
}
