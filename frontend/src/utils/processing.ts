export function getNestedValue(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object") {
      return acc[key];
    }
    return undefined;
  }, obj);
}

export function renderCell(value: any) {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    return Object.values(value).join(" / ");
  }

  return String(value);
}