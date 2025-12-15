import React, { useEffect, useState } from "react";
import styles from "./Form.module.css";

export interface FormField<T = any> {
  key: keyof T;
  label: string;
  type?: "text" | "number" | "select" | "select-fetch" | "textarea";
  options?: { value: string | number; label: string }[]; // for select
  fetchUrl?: string; // for select-fetch
  dataPath?: string; // JSON path to options array in response (e.g., "data" or "items")
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
  const [fetchedOptions, setFetchedOptions] = useState<
    Record<string, { value: string | number; label: string }[]>
  >({});
  const [selectedOptionsData, setSelectedOptionsData] = useState<
    Record<string, { id: string | number; name: string }>
  >({});

  useEffect(() => {
    setValues(initialData);
    setIsEditing(!!Object.keys(initialData).length);
  }, [initialData]);

  // Fetch options for all select-fetch fields on mount
  useEffect(() => {
    const fetchAllOptions = async () => {
      const fetchPromises: { key: string; promise: Promise<any> }[] = [];

      fields.forEach((f) => {
        if (f.type === "select-fetch" && f.fetchUrl) {
          fetchPromises.push({
            key: String(f.key),
            promise: fetch(f.fetchUrl).then((res) => res.json()),
          });
        }
      });

      if (fetchPromises.length === 0) return;

      try {
        const results = await Promise.all(fetchPromises.map((p) => p.promise));
        const optionsMap: typeof fetchedOptions = {};

        fetchPromises.forEach((p, idx) => {
          const field = fields.find((f) => String(f.key) === p.key);
          const dataPath = field?.dataPath || "data";
          const data = results[idx];
          const items =
            dataPath.split(".").reduce((obj, key) => obj?.[key], data) || data;

          // Normalize to array of {value, label}
          if (Array.isArray(items)) {
            optionsMap[p.key] = items.map((item: any) => ({
              value: item.id ?? item.value,
              label: item.name ?? item.status ?? item.label ?? String(item),
            }));
          }
        });

        setFetchedOptions(optionsMap);
      } catch (err) {
        console.error("Error fetching form options:", err);
      }
    };

    fetchAllOptions();
  }, [fields]);

  const handleChange = (key: keyof T, value: any) => {
    // For all fields, store only the value (ID for select-fetch, display value for others)
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
      setSelectedOptionsData({});
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
          ) : f.type === "select-fetch" ? (
            <select
              aria-label={String(f.key)}
              value={getSafeValue(values[f.key])}
              onChange={(e) => handleChange(f.key, e.target.value)}
            >
              <option value="">—</option>
              {(fetchedOptions[String(f.key)] || []).map((o) => (
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
