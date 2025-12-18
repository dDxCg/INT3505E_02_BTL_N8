import React from "react";
import styles from "./Table.module.css";
import { getNestedValue, renderCell } from "@/utils/processing";

interface Column {
  key: string; // supports nested
  label?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column[]; // required for full control
  className?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  className,
  onEdit,
  onDelete,
}: TableProps<T>) {
  if (!data || !data.length) {
    return <div className={styles["table-container"]}>No data</div>;
  }

  return (
    <div className={styles["table-container"]}>
      <table className={`${styles.table} ${className ?? ""}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label ?? col.key}</th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => {
                const value = getNestedValue(row, col.key);
                return <td key={col.key}>{renderCell(value)}</td>;
              })}

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
