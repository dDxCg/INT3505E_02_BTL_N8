import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table as TableComponent } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";

interface Table {
  id: number;
  number: string;
  seats: number;
  status_id: number;
}

const formFields: FormField<Table>[] = [
  { key: "number", label: "Table Number", type: "text" },
  { key: "seats", label: "Seats", type: "number" },
  {
    key: "status_id",
    label: "Status",
    type: "select-fetch",
    fetchUrl: "http://localhost:8000/api/v1/tables-statuses",
  },
];

const fields: FilterField[] = [
  { key: "number", label: "Table Number", type: "text", col: 2 },
  { key: "seats", label: "Seats", type: "text", col: 2 },
  {
    key: "status_id",
    label: "Status",
    type: "select-fetch",
    fetchUrl: "http://localhost:8000/api/v1/tables-statuses",
    col: 2,
  },
];

const TablePage: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [tables, setTables] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

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
      if (values.number) params.append("number", values.number);
      if (values.seats) params.append("seats", values.seats);
      if (values.status_id) params.append("status_id", values.status_id);

      const query = params.toString();
      const url = `${apiUrl}/v1/tables${query ? "?" + query : ""}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];
      setTables(items);
    } catch (err: any) {
      console.error("Search failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = async (row: any) => {
    openEditForm(row);
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm("Delete this table?")) return;

    const apiUrl = "http://localhost:8000/api";
    try {
      const res = await fetch(`${apiUrl}/v1/tables/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchTables();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleFormSubmit = async (data: Partial<Table>) => {
    const apiUrl = "http://localhost:8000/api";
    try {
      // Convert status_id to number
      const payload = {
        ...data,
        seats: data.seats ? parseInt(String(data.seats)) : undefined,
        status_id: data.status_id
          ? parseInt(String(data.status_id))
          : undefined,
      };

      if (editingTable?.id) {
        // PUT: Update
        const res = await fetch(`${apiUrl}/v1/tables/${editingTable.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // POST: Create
        const res = await fetch(`${apiUrl}/v1/tables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      closeForm();
      await fetchTables();
    } catch (err: any) {
      console.error("Form submission failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const openAddForm = () => {
    setEditingTable(null);
    setShowForm(true);
  };

  const openEditForm = (table: Table) => {
    setEditingTable(table);
    setShowForm(true);
  };

  const fetchTables = async () => {
    const apiUrl = "http://localhost:8000/api";
    try {
      const res = await fetch(`${apiUrl}/v1/tables`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];
      setTables(items);
    } catch (err: any) {
      console.error("Failed to fetch tables:", err);
      alert(`Error loading tables: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchTables();
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
          Add Table
        </button>
      </div>
      <div style={{ marginTop: "16px" }}>
        <TableComponent
          data={tables}
          columns={[
            { key: "id", label: "ID" },
            { key: "number", label: "Table Number" },
            { key: "seats", label: "Seats" },
            { key: "status_id", label: "Status ID" },
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <Popup open={showForm} onClose={closeForm}>
        <Form<Table>
          fields={formFields}
          initialData={editingTable || {}}
          onSubmitAdd={handleFormSubmit}
          onSubmitEdit={handleFormSubmit}
          onClose={closeForm}
        />
      </Popup>
    </div>
  );
};

export default TablePage;
