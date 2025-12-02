import { useEffect } from "react";
import styles from "./FilterBar.module.css";
import { FilterField } from "./types";

interface Props {
  field: FilterField;
  value: string;
  onFetchOptions: (key: string, url: string) => void;
  onChange: (key: string, value: string) => void;
}

export const SelectFetchField: React.FC<Props> = ({
  field,
  value,
  onFetchOptions,
  onChange,
}) => {
  useEffect(() => {
    if (!field.options && field.fetchUrl) {
      onFetchOptions(field.key, field.fetchUrl);
    }
  }, []);

  return (
    <select
      aria-label={field.label}
      className={styles.select}
      value={value}
      onChange={(e) => onChange(field.key, e.target.value)}
    >
      <option value="">—</option>

      {field.options?.map((op) => (
        <option key={op.value} value={op.value}>
          {op.label}
        </option>
      ))}
    </select>
  );
};
