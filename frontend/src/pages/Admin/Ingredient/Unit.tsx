import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";

interface Unit {
  id: number;
  name: string;
}

const formFields: FormField<Unit>[] = [
  { key: "name", label: "Name", type: "text" },
];

const fields: FilterField[] = [
  { key: "name", label: "Name", type: "text", col: 2 },
];

const UnitPage: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [units, setUnits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchOptions = async (key: string, url: string) => {
    try {
      const res = await fetch(url);
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];

      const options = items.map((item: any) => ({
        label: item.name ?? String(item),
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
      if (values.name) params.append("name", values.name);

      const query = params.toString();
      const url = `${apiUrl}/v1/resources/ingredient-units${
        query ? "?" + query : ""
      }`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];
      setUnits(items);
    } catch (err: any) {
      console.error("Search failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = async (row: any) => {
    openEditForm(row);
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm("Delete this unit?")) return;

    const apiUrl = "http://localhost:8000/api";
    try {
      const res = await fetch(
        `${apiUrl}/v1/resources/ingredient-units/${row.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchUnits();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleFormSubmit = async (data: Partial<Unit>) => {
    const apiUrl = "http://localhost:8000/api";
    try {
      if (editingUnit?.id) {
        // PUT: Update
        const res = await fetch(
          `${apiUrl}/v1/resources/ingredient-units/${editingUnit.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // POST: Create
        const res = await fetch(`${apiUrl}/v1/resources/ingredient-units`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      closeForm();
      await fetchUnits();
    } catch (err: any) {
      console.error("Form submission failed:", err);
      alert(`Error: ${err.message}`);
    }
  };
  const closeForm = () => {
    setShowForm(false);
  };
  const openAddForm = () => {
    setEditingUnit(null);
    setShowForm(true);
  };
  const openEditForm = (unit: Unit) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  const fetchUnits = async () => {
    const apiUrl = "http://localhost:8000/api";
    try {
      const res = await fetch(`${apiUrl}/v1/resources/ingredient-units`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];
      setUnits(items);
    } catch (err: any) {
      console.error("Failed to fetch units:", err);
      alert(`Error loading units: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchUnits();
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
          Add Unit
        </button>
      </div>
      <div style={{ marginTop: "16px" }}>
        <Table
          data={units}
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Name" },
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <Popup open={showForm} onClose={closeForm}>
        <Form<Unit>
          fields={formFields}
          initialData={editingUnit || {}}
          onSubmitAdd={handleFormSubmit}
          onSubmitEdit={handleFormSubmit}
          onClose={closeForm}
        />
      </Popup>
    </div>
  );
};

export default UnitPage;
