"use client";

import { useState } from "react";
import { brandPalette } from "@/design/system";
import { ConfirmModal, FormField, FormModal } from "@/components/ui/modal";
import {
  affectedEventCount,
  removeVocabulary,
  saveVocabulary,
  type VocabularyKind,
  type WorkspaceData,
} from "../workspace/model";

export type VocabularyRequest = {
  kind: VocabularyKind;
  action: "create" | "edit" | "merge" | "delete";
  id?: string;
};
type Props = {
  request: VocabularyRequest;
  data: WorkspaceData;
  error: string;
  onChange: (update: (data: WorkspaceData) => WorkspaceData) => boolean;
  onClose: () => void;
};

/** Configures shared form/confirmation templates; owns no modal markup. */
export function VocabularyModal({
  request,
  data,
  error,
  onChange,
  onClose,
}: Props) {
  const [target, setTarget] = useState("");
  const { kind, action, id } = request;
  const name = kind === "categories" ? "category" : "tag";
  const item = data[kind].find((item) => item.id === id);
  if (action !== "create" && !item)
    return (
      <ConfirmModal
        title="This item is no longer available"
        description="It may have been removed in another tab. Close this dialog and choose another item."
        confirmLabel="Close"
        onConfirm={onClose}
        onClose={onClose}
      />
    );
  if (action === "create" || action === "edit")
    return (
      <FormModal
        title={`${action === "create" ? "Create" : "Edit"} ${name}`}
        description={`Choose a name and a Slidely color for this ${name}.`}
        confirmLabel={`${action === "create" ? "Create" : "Save"} ${name}`}
        error={error}
        onClose={onClose}
        fields={[
          {
            name: "name",
            label: "Name",
            defaultValue: item?.name ?? "",
            required: true,
            maxLength: 64,
            autoFocus: true,
            placeholder:
              kind === "categories"
                ? "e.g. Healthcare"
                : "e.g. Speaker prospect",
          },
          {
            name: "color",
            label: "Color",
            type: "select",
            defaultValue:
              item?.color ??
              brandPalette[data[kind].length % brandPalette.length].color,
            options: brandPalette.map((color) => ({
              value: color.color,
              label: color.name,
            })),
          },
        ]}
        onSave={(fields) => {
          if (
            onChange((current) =>
              saveVocabulary(
                current,
                kind,
                id ?? crypto.randomUUID(),
                String(fields.get("name")),
                String(fields.get("color")),
              ),
            )
          )
            onClose();
        }}
      />
    );
  const count = affectedEventCount(data, kind, id!);
  const merging = action === "merge";
  return (
    <ConfirmModal
      title={`${merging ? "Merge" : "Delete"} ${item!.name}?`}
      description={
        merging
          ? `${count} linked events will use the destination ${name}. Existing tag links are kept without duplicates.`
          : kind === "categories"
            ? `${count} linked events will become Uncategorized. The events themselves will be kept.`
            : `This tag will be removed from ${count} linked events. The events themselves will be kept.`
      }
      confirmLabel={merging ? "Confirm merge" : `Delete ${name}`}
      danger={!merging}
      disabled={merging && !target}
      error={error}
      onClose={onClose}
      onConfirm={() => {
        if (
          onChange((current) =>
            removeVocabulary(
              current,
              kind,
              id!,
              merging ? target : "",
              merging,
            ),
          )
        )
          onClose();
      }}
    >
      {merging && (
        <FormField
          name="destination"
          label={`Merge into ${name}`}
          type="select"
          value={target}
          onChange={setTarget}
          options={[
            { value: "", label: "Choose a destination" },
            ...data[kind]
              .filter((item) => item.id !== id)
              .map((item) => ({ value: item.id, label: item.name })),
          ]}
        />
      )}
    </ConfirmModal>
  );
}
