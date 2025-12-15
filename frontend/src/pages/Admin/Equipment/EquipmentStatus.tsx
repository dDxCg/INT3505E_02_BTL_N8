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

  const handleSearch = async () => {
    const apiUrl = "http://localhost:8000/api";
    try {
      const params = new URLSearchParams();
      if (values.name) {
        params.append("status", values.name);
      }
      const query = params.toString();
      const url = `${apiUrl}/v1/resources/equipment-statuses${
        query ? "?" + query : ""
      }`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];
      setEquipmentStatuses(items);
    } catch (err: any) {
      console.error("Search failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (row: EquipmentStatus) => {
    setEditingStatus(row);
    setShowForm(true);
  };

  const handleDelete = async (row: EquipmentStatus) => {
    if (!window.confirm("Delete this status?")) return;

    const apiUrl = "http://localhost:8000/api";
    try {
      const res = await fetch(
        `${apiUrl}/v1/resources/equipment-statuses/${row.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Refetch after delete
      await fetchStatuses();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleFormSubmit = async (data: Partial<EquipmentStatus>) => {
    const apiUrl = "http://localhost:8000/api";
    try {
      if (editingStatus?.id) {
        // PUT: Update
        const res = await fetch(
          `${apiUrl}/v1/resources/equipment-statuses/${editingStatus.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // POST: Create
        const res = await fetch(`${apiUrl}/v1/resources/equipment-statuses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      closeForm();
      // Refetch after add or update
      await fetchStatuses();
    } catch (err: any) {
      console.error("Form submission failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const closeForm = () => setShowForm(false);

  const openAddForm = () => {
    setEditingStatus(null);
    setShowForm(true);
  };

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

  useEffect(() => {
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
