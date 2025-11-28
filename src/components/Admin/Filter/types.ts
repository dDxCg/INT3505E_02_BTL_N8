export type FilterFieldType = "text" | "select" | "select-fetch";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: FilterFieldType;

  // for static dropdown
  options?: FilterOption[];

  // for async dropdown
  fetchUrl?: string;

  // layout
  col?: number; // grid column span
  className?: string; // extra CSS override
}
