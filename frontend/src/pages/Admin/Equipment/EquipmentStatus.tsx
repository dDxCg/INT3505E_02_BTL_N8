import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";
import { apiClient } from "@/api/client";

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
    try {
      const params = new URLSearchParams();
      if (values.name) {
        params.append("status", values.name);
      }
      const query = params.toString();
      const url = `/resources/equipment-statuses${query ? "?" + query : ""}`;

      const res = await apiClient.get(url);
      const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      setEquipmentStatuses(items);
    } catch (err: any) {
      console.error("Search failed:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Search failed";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleEdit = (row: EquipmentStatus) => {
    setEditingStatus(row);
    setShowForm(true);
  };

  const handleDelete = async (row: EquipmentStatus) => {
    if (!window.confirm("Delete this status?")) return;

    try {
      await apiClient.delete(`/resources/equipment-statuses/${row.id}`);
      // Refetch after delete
      await fetchStatuses();
    } catch (err: any) {
      console.error("Delete failed:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Delete failed";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleFormSubmit = async (data: Partial<EquipmentStatus>) => {
    try {
      if (editingStatus?.id) {
        // PUT: Update
        await apiClient.put(`/resources/equipment-statuses/${editingStatus.id}`, data);
      } else {
        // POST: Create
        await apiClient.post(`/resources/equipment-statuses`, data);
      }
      closeForm();
      // Refetch after add or update
      await fetchStatuses();
    } catch (err: any) {
      console.error("Form submission failed:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Form submission failed";
      alert(`Error: ${errorMsg}`);
    }
  };

  const closeForm = () => setShowForm(false);

  const openAddForm = () => {
    setEditingStatus(null);
    setShowForm(true);
  };

  const fetchStatuses = async () => {
    try {
      const res = await apiClient.get("/resources/equipment-statuses");
      const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
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
