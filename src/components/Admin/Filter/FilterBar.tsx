import React from "react";
import styles from "./FilterBar.module.css";
import { FilterField } from "./types";
import { SelectFetchField } from "./SelectField";

interface FilterBarProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onFetchOptions: (key: string, url: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  fields,
  values,
  onChange,
  onFetchOptions,
}) => {
  return (
    <div className={styles.filterBar}>
      {fields.map((f) => {
        const col = f.col ?? 1;

        return (
          <div
            key={f.key}
            className={`${styles.field} ${f.className ?? ""}`}
            style={{ gridColumn: `span ${col}` }}
          >
            <label className={styles.label}>{f.label}</label>

            {f.type === "text" && (
              <input
                aria-label={f.label}
                className={styles.input}
                value={values[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            )}

            {f.type === "select" && (
              <select
                aria-label={f.label}
                className={styles.select}
                value={values[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
              >
                <option value="">—</option>
                {f.options?.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            )}

            {f.type === "select-fetch" && (
              <SelectFetchField
                field={f}
                value={values[f.key] ?? ""}
                onFetchOptions={onFetchOptions}
                onChange={onChange}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
