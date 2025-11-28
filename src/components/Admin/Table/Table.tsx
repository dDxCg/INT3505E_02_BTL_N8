import React from "react";
import styles from "./Table.module.css";

interface TableProps<T> {
  data: T[];
  className?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  className,
}: TableProps<T>) {
  if (!data || !data.length) {
    return <div className={styles["table-container"]}>No data</div>;
  }

  // dynamically get all keys from the first row
  const keys = Object.keys(data[0]) as (keyof T)[];

  return (
    <div className={styles["table-container"]}>
      <table className={`${styles.table} ${className ?? ""}`}>
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={String(key)}>{String(key)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {keys.map((key) => (
                <td key={String(key)}>{String(row[key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
