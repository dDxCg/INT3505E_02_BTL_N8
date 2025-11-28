import React from "react";
import styles from "./Table.module.css";

interface TableProps<T extends Record<string, any>> {
  data: T[];
  className?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function Table<T extends Record<string, any>>({
  data,
  className,
  onEdit,
  onDelete,
}: TableProps<T>) {
  if (!data || !data.length) {
    return <div className={styles["table-container"]}>No data</div>;
  }

  const keys = Object.keys(data[0]) as (keyof T)[];

  return (
    <div className={styles["table-container"]}>
      <table className={`${styles.table} ${className ?? ""}`}>
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={String(key)}>{String(key)}</th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {keys.map((key) => (
                <td key={String(key)}>{row[key] ?? ""}</td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  {onEdit && (
                    <button
                      style={{ marginRight: 4 }}
                      onClick={() => onEdit(row)}
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(row)}>Delete</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
