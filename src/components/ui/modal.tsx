"use client";

import {
  useEffect,
  useId,
  useRef,
  type FormEventHandler,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { icons } from "@/design/system";

type ModalProps = {
  title: string;
  description?: ReactNode;
  error?: string;
  children?: ReactNode;
  actions?: ReactNode;
  placement?: "center" | "right";
  headerActions?: ReactNode;
  onClose: () => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  closeLabel?: string;
};

/** One shell owns focus, Escape, headings, errors and spacing for every app modal. */
export function Modal({
  title,
  description,
  error,
  children,
  actions,
  placement = "center",
  headerActions,
  onClose,
  onSubmit,
  closeLabel = "Close dialog",
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.showModal();
    ref.current
      ?.querySelector<HTMLElement>("[autofocus], [data-autofocus]")
      ?.focus({ preventScroll: true });
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus({ preventScroll: true });
    };
  }, []);
  const contents = (
    <>
      <div className="dialog-header">
        {placement === "right" && (
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X size={icons.navigation} />
          </button>
        )}
        <h2 id={`${id}-title`}>{title}</h2>
        {headerActions}
        {placement === "center" && (
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X size={icons.navigation} />
          </button>
        )}
      </div>
      {description && (
        <p className="modal-description" id={`${id}-description`}>
          {description}
        </p>
      )}
      <div className="modal-body">{children}</div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {actions && <div className="dialog-actions">{actions}</div>}
    </>
  );
  return (
    <dialog
      ref={ref}
      className={`event-dialog shared-modal ${placement === "right" ? "side-modal" : ""}`}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {onSubmit ? (
        <form className="modal-content" onSubmit={onSubmit}>
          {contents}
        </form>
      ) : (
        <div className="modal-content">{contents}</div>
      )}
    </dialog>
  );
}

export function ModalActions({
  onCancel,
  confirmLabel,
  disabled = false,
  danger = false,
  onConfirm,
  leading,
}: {
  onCancel: () => void;
  confirmLabel: string;
  disabled?: boolean;
  danger?: boolean;
  onConfirm?: () => void;
  leading?: ReactNode;
}) {
  return (
    <>
      {leading && <div className="modal-leading-action">{leading}</div>}
      <button type="button" className="secondary-button" onClick={onCancel}>
        Cancel
      </button>
      <button
        type={onConfirm ? "button" : "submit"}
        className={`primary-button ${danger ? "danger-button" : ""}`}
        disabled={disabled}
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </>
  );
}

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "url" | "date" | "select" | "textarea";
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  min?: string;
  max?: string;
};

export function FormField({
  name,
  label,
  type = "text",
  options,
  onChange,
  ...config
}: FieldConfig) {
  const id = useId();
  const attributes = {
    ...config,
    "data-autofocus": config.autoFocus || undefined,
    id,
    name,
    onChange: onChange
      ? (
          event: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >,
        ) => onChange(event.target.value)
      : undefined,
  };
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {type === "select" ? (
        <select {...attributes}>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea {...attributes} rows={3} />
      ) : (
        <input {...attributes} type={type} />
      )}
    </div>
  );
}

export function FormModal({
  fields,
  onSave,
  ...props
}: Omit<ModalProps, "actions" | "onSubmit" | "children"> & {
  fields: FieldConfig[];
  onSave: (fields: FormData) => void;
  confirmLabel: string;
}) {
  const { confirmLabel, ...modalProps } = props;
  return (
    <Modal
      {...modalProps}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(new FormData(event.currentTarget));
      }}
      actions={
        <ModalActions onCancel={props.onClose} confirmLabel={confirmLabel} />
      }
    >
      {fields.map((field) => (
        <FormField key={field.name} {...field} />
      ))}
    </Modal>
  );
}

export function ConfirmModal({
  confirmLabel,
  onConfirm,
  danger,
  disabled,
  ...props
}: Omit<ModalProps, "actions" | "onSubmit"> & {
  confirmLabel: string;
  onConfirm: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Modal
      {...props}
      actions={
        <ModalActions
          onCancel={props.onClose}
          confirmLabel={confirmLabel}
          onConfirm={onConfirm}
          danger={danger}
          disabled={disabled}
        />
      }
    />
  );
}
