import React, { useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";

const fields: FilterField[] = [
  { key: "name", label: "Name", type: "text", col: 2 },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "available", value: "available" },
      { label: "in_use", value: "in_use" },
      { label: "maintenance", value: "maintenance" },
      { label: "missing", value: "missing" },
      { label: "broken", value: "broken" },
    ],
  },
  { key: "type", label: "Type", type: "select-fetch", fetchUrl: "/api/types" },
];

const EquipmentPage: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [equipments, setEquipments] = useState<any[]>([]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchOptions = (key: string, url: string) => {
    console.log(`Fetch options for ${key} from ${url}`);
    // implement fetching inside SelectFetchField
  };

  const handleSearch = () => {
    console.log("Search values:", values);
    // You can call your API here with the current filter values
  };

  return (
    <div>
      <FilterBar
        fields={fields}
        values={values}
        onChange={handleChange}
        onFetchOptions={handleFetchOptions}
      />
      <div style={{ marginTop: "16px" }}>
        <button onClick={handleSearch}>Search</button>
      </div>
      <div style={{ marginTop: "16px" }}>
        <Table data={equipments} />
      </div>
    </div>
  );
};

export default EquipmentPage;
