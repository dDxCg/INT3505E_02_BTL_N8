import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";
import { apiClient } from "@/api/client";

interface TableStatus {
  id: number;
  status: string;
}

const formFields: FormField<TableStatus>[] = [
  { key: "status", label: "Status", type: "text" },
];

const fields: FilterField[] = [
  { key: "status", label: "Status", type: "text", col: 2 },
];

const TableStatusPage: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [tableStatuses, setTableStatuses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTableStatus, setEditingTableStatus] =
    useState<TableStatus | null>(null);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchOptions = async (key: string, url: string) => {
    try {
      const res = await apiClient.get(url);
      const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];

      const options = items.map((item: any) => ({
        label: item.status ?? String(item),
        value: String(item.id),
      }));

      const field = fields.find((f) => f.key === key);
      if (field) {
        field.options = options;
      }

      setValues((prev) => ({ ...prev }));
    } catch (err) {
      console.error("fetch options failed:", err);
    }
  };

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (values.status) params.append("status", values.status);

      const query = params.toString();
      const url = `/tables/statuses${query ? "?" + query : ""}`;

      const res = await apiClient.get(url);
      const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      setTableStatuses(items);
    } catch (err: any) {
      console.error("Search failed:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Search failed";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleEdit = async (row: any) => {
    openEditForm(row);
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm("Delete this table status?")) return;

    try {
      await apiClient.delete(`/tables/statuses/${row.id}`);
      await fetchTableStatuses();
    } catch (err: any) {
      console.error("Delete failed:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Delete failed";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleFormSubmit = async (data: Partial<TableStatus>) => {
    try {
      if (editingTableStatus?.id) {
        // PUT: Update
        await apiClient.put(`/tables-statuses/${editingTableStatus.id}`, data);
      } else {
        // POST: Create
        await apiClient.post(`/tables-statuses`, data);
      }
      closeForm();
      await fetchTableStatuses();
    } catch (err: any) {
      console.error("Form submission failed:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Form submission failed";
      alert(`Error: ${errorMsg}`);
    }
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const openAddForm = () => {
    setEditingTableStatus(null);
    setShowForm(true);
  };

  const openEditForm = (tableStatus: TableStatus) => {
    setEditingTableStatus(tableStatus);
    setShowForm(true);
  };

  const fetchTableStatuses = async () => {
    try {
      const res = await apiClient.get(`/tables-statuses`);
      const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      setTableStatuses(items);
    } catch (err: any) {
      console.error("Failed to fetch table statuses:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Failed to fetch table statuses";
      alert(`Error loading table statuses: ${errorMsg}`);
    }
  };

  useEffect(() => {
    fetchTableStatuses();
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
          Add Table Status
        </button>
      </div>
      <div style={{ marginTop: "16px" }}>
        <Table
          data={tableStatuses}
          columns={[
            { key: "id", label: "ID" },
            { key: "status", label: "Status" },
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <Popup open={showForm} onClose={closeForm}>
        <Form<TableStatus>
          fields={formFields}
          initialData={editingTableStatus || {}}
          onSubmitAdd={handleFormSubmit}
          onSubmitEdit={handleFormSubmit}
          onClose={closeForm}
        />
      </Popup>
    </div>
  );
};

export default TableStatusPage;
