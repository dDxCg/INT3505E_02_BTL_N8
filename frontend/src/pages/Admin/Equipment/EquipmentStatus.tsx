import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";

interface EquipmentStatus {
  id: number;
  status: string;
}

const formFields: FormField<EquipmentStatus>[] = [
  { key: "status", label: "Status", type: "text" },
];

const fields: FilterField[] = [
  { key: "name", label: "Name", type: "text", col: 2 },
];

const EquipmentStatusPage: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [equipmentStatuses, setEquipmentStatuses] = useState<EquipmentStatus[]>(
    []
  );
  const [showForm, setShowForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<EquipmentStatus | null>(
    null
  );

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchOptions = () => {
    // No select-fetch fields here
  };

  const handleSearch = () => {
    console.log("Search values:", values);
    // Later you'll plug API search here
  };

  const handleEdit = (row: EquipmentStatus) => {
    setEditingStatus(row);
    setShowForm(true);
  };

  const handleDelete = (row: EquipmentStatus) => {
    console.log("Delete row:", row);
    // Call delete API later
  };

  const handleFormSubmit = async (data: Partial<EquipmentStatus>) => {
    console.log("Form submitted with data:", data);
    // API submit logic later
  };

  const closeForm = () => setShowForm(false);

  const openAddForm = () => {
    setEditingStatus(null);
    setShowForm(true);
  };

  // 🔥 Fetch all statuses once
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/v1/resources/equipment-statuses"
        );
        const body = await res.json();
        const items = Array.isArray(body) ? body : body.data ?? [];
        setEquipmentStatuses(items);
      } catch (err) {
        console.error("Failed to fetch equipment statuses:", err);
      }
    };

    fetchStatuses();
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
          Add Equipment Status
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <Table
          data={equipmentStatuses}
          columns={[
            { key: "id", label: "ID" },
            { key: "status", label: "Status" },
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Popup open={showForm} onClose={closeForm}>
        <Form<EquipmentStatus>
          fields={formFields}
          initialData={editingStatus || {}}
          onSubmitAdd={handleFormSubmit}
          onSubmitEdit={handleFormSubmit}
          onClose={closeForm}
        />
      </Popup>
    </div>
  );
};

export default EquipmentStatusPage;
