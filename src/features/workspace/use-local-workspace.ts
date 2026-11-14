"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CATEGORIES, TAGS } from "../events/types";
import { sampleEvents } from "../events/sample-events";
import { parseWorkspace, type WorkspaceData } from "./model";

const STORAGE_KEY = "slidely.events.workspace.v1";
const CHANGE_EVENT = "slidely-workspace-changed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}
function snapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
const serverSnapshot = () => null;

export function useLocalWorkspace(year: number, month: number) {
  const [initial] = useState<WorkspaceData>(() => ({
    version: 1,
    categories: CATEGORIES,
    tags: TAGS,
    events: sampleEvents(year, month),
    trash: [],
  }));
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [writeError, setWriteError] = useState("");
  const parsed = useMemo(() => {
    if (!raw) return { data: initial, error: "" };
    try {
      return { data: parseWorkspace(raw), error: "" };
    } catch {
      return {
        data: initial,
        error:
          "Saved preview data could not be read. Your saved copy has been left untouched. Restore browser storage or use another browser profile before saving.",
      };
    }
  }, [raw, initial]);

  function updateWorkspace(
    update: (data: WorkspaceData) => WorkspaceData,
  ): boolean {
    try {
      // Read at the moment of writing to avoid overwriting a more recent change from another tab.
      const existing = snapshot();
      const current = existing ? parseWorkspace(existing) : initial;
      const next = update(current);
      const serialized = JSON.stringify(next);
      parseWorkspace(serialized);
      localStorage.setItem(STORAGE_KEY, serialized);
      setWriteError("");
      window.dispatchEvent(new Event(CHANGE_EVENT));
      return true;
    } catch (error) {
      setWriteError(
        error instanceof DOMException
          ? "Your browser could not save this change. Check available storage and browser privacy settings, then try again."
          : error instanceof Error
            ? error.message
            : "The change could not be saved. Please try again.",
      );
      return false;
    }
  }
  return {
    workspace: parsed.data,
    updateWorkspace,
    storageError: writeError || parsed.error,
  };
}
