import React, { useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";

interface Equipment {
  id: number;
  name: string;
  status: string;
  type: string;
}

const formFields: FormField<Equipment>[] = [
  { key: "name", label: "Name", type: "text" },
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
  {
    key: "type",
    label: "Type",
    type: "select",
  },
];

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
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );

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

  const handleEdit = (row: any) => {
    console.log("Edit row:", row);
    // Implement edit functionality here
  };

  const handleDelete = (row: any) => {
    console.log("Delete row:", row);
    // Implement delete functionality here
  };

  const handleFormSubmit = async (data: Partial<Equipment>) => {
    console.log("Form submitted with data:", data);
    // Implement form submission logic here
  };

  const closeForm = () => setShowForm(false);
  const openAddForm = () => {
    setEditingEquipment(null);
    setShowForm(true);
  };
  const openEditForm = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setShowForm(true);
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
        <button onClick={openAddForm} style={{ marginLeft: "16px" }}>
          Add Equipment
        </button>
      </div>
      <div style={{ marginTop: "16px" }}>
        <Table data={equipments} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
      <Popup open={showForm} onClose={closeForm}>
        <Form<Equipment>
          fields={formFields}
          initialData={editingEquipment || {}}
          onSubmitAdd={handleFormSubmit}
          onSubmitEdit={handleFormSubmit}
          onClose={closeForm}
        />
      </Popup>
    </div>
  );
};

export default EquipmentPage;
