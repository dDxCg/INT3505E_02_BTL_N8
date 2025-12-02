import React, { useEffect, useState } from "react";
import styles from "./Form.module.css";

export interface FormField<T = any> {
  key: keyof T;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  options?: { value: string | number; label: string }[]; // for select
}

export interface FormProps<T> {
  fields: FormField<T>[];
  initialData?: Partial<T>; // empty for add, filled for edit
  onSubmitAdd: (values: Partial<T>) => Promise<void>;
  onSubmitEdit: (values: Partial<T>) => Promise<void>;
  onClose?: () => void;
}

const getSafeValue = <T, K extends keyof T>(val: T[K] | undefined) =>
  (val ?? "") as string | number | readonly string[];

export function Form<T>({
  fields,
  initialData = {},
  onSubmitAdd,
  onSubmitEdit,
  onClose,
}: FormProps<T>) {
  const [values, setValues] = useState<Partial<T>>(initialData);
  const [isEditing, setIsEditing] = useState(!!Object.keys(initialData).length);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValues(initialData);
    setIsEditing(!!Object.keys(initialData).length);
  }, [initialData]);

  const handleChange = (key: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await onSubmitEdit(values);
      } else {
        await onSubmitAdd(values);
      }
      onClose?.();
      setValues({});
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {fields.map((f) => (
        <div key={String(f.key)} className={styles.field}>
          <label>{f.label}</label>
          {f.type === "select" && f.options ? (
            <select
              aria-label={String(f.key)}
              value={getSafeValue(values[f.key])}
              onChange={(e) => handleChange(f.key, e.target.value)}
            >
              <option value="">—</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea
              aria-label={String(f.key)}
              value={getSafeValue(values[f.key])}
              onChange={(e) => handleChange(f.key, e.target.value)}
            />
          ) : (
            <input
              aria-label={String(f.key)}
              type={f.type ?? "text"}
              value={getSafeValue(values[f.key])}
              onChange={(e) => handleChange(f.key, e.target.value)}
            />
          )}
        </div>
      ))}

      <div className={styles.actions}>
        <button type="submit" disabled={loading}>
          {isEditing ? "Update" : "Add"}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
