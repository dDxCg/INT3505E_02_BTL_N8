import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";

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
      const res = await fetch(url);
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];

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
    const apiUrl = "http://localhost:8000/api";
    try {
      const params = new URLSearchParams();
      if (values.status) params.append("status", values.status);

      const query = params.toString();
      const url = `${apiUrl}/v1/tables/statuses${query ? "?" + query : ""}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];
      setTableStatuses(items);
    } catch (err: any) {
      console.error("Search failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = async (row: any) => {
    openEditForm(row);
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm("Delete this table status?")) return;

    const apiUrl = "http://localhost:8000/api";
    try {
      const res = await fetch(`${apiUrl}/v1/tables/statuses/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchTableStatuses();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleFormSubmit = async (data: Partial<TableStatus>) => {
    const apiUrl = "http://localhost:8000/api";
    try {
      if (editingTableStatus?.id) {
        // PUT: Update
        const res = await fetch(
          `${apiUrl}/v1/tables-statuses/${editingTableStatus.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // POST: Create
        const res = await fetch(`${apiUrl}/v1/tables-statuses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      closeForm();
      await fetchTableStatuses();
    } catch (err: any) {
      console.error("Form submission failed:", err);
      alert(`Error: ${err.message}`);
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
    const apiUrl = "http://localhost:8000/api";
    try {
      const res = await fetch(`${apiUrl}/v1/tables-statuses`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];
      setTableStatuses(items);
    } catch (err: any) {
      console.error("Failed to fetch table statuses:", err);
      alert(`Error loading table statuses: ${err.message}`);
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
