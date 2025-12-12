import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";

interface Equipment {
  id: number;
  name: string;
  status_id: number;
  type_id: number;
  status: {
    id: number;
    status: string;
  };
  type: {
    id: number;
    name: string;
  };
}

const equipmentColumns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "status.status", label: "Status" },
  { key: "type.name", label: "Type" },
];

const formFields: FormField<Equipment>[] = [
  { key: "name", label: "Name", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "available", value: "1" },
      { label: "in_use", value: "2" },
      { label: "maintenance", value: "3" },
      { label: "missing", value: "4" },
      { label: "broken", value: "5" },
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
      { label: "available", value: "1" },
      { label: "in_use", value: "2" },
      { label: "maintenance", value: "3" },
      { label: "missing", value: "4" },
      { label: "broken", value: "5" },
    ],
  },
  {
    key: "type",
    label: "Type",
    type: "select-fetch",
    fetchUrl: "http://localhost:8000/api/v1/resources/equipment-types",
  },
];

const EquipmentPage: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchOptions = async (key: string, url: string) => {
    try {
      const res = await fetch(url);
      const body = await res.json();

      const items = Array.isArray(body) ? body : body.data ?? [];

      const options = items.map((item: any) => ({
        label: item.name, // your API for types returns { id, name }
        value: String(item.id),
      }));

      // Patch into fields so FilterBar re-renders
      fields.find((f) => f.key === key)!.options = options;

      // Force a state update so React re-renders
      setValues((prev) => ({ ...prev }));
    } catch (err) {
      console.error("fetch options failed:", err);
    }
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

  const fetchEquipments = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/resources/equipments"
      );
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];
      setEquipments(items);
    } catch (err) {
      console.error("fetch all equipments fail:", err);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

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
        <Table
          data={equipments}
          columns={equipmentColumns}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
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
