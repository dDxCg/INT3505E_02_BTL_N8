import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";
import { apiClient } from "@/api/client";

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
      const res = await apiClient.get(url);
      const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];

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
    try {
      const params = new URLSearchParams();
      if (values.name) params.append("name", values.name);

      const query = params.toString();
      const url = `/resources/ingredient-units${query ? "?" + query : ""}`;

      const res = await apiClient.get(url);
      const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      setUnits(items);
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
    if (!window.confirm("Delete this unit?")) return;

    try {
      await apiClient.delete(`/resources/ingredient-units/${row.id}`);
      await fetchUnits();
    } catch (err: any) {
      console.error("Delete failed:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Delete failed";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleFormSubmit = async (data: Partial<Unit>) => {
    try {
      if (editingUnit?.id) {
        // PUT: Update
        await apiClient.put(`/resources/ingredient-units/${editingUnit.id}`, data);
      } else {
        // POST: Create
        await apiClient.post(`/resources/ingredient-units`, data);
      }
      closeForm();
      await fetchUnits();
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
    setEditingUnit(null);
    setShowForm(true);
  };
  const openEditForm = (unit: Unit) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  const fetchUnits = async () => {
    try {
      const res = await apiClient.get(`/resources/ingredient-units`);
      const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      setUnits(items);
    } catch (err: any) {
      console.error("Failed to fetch units:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Failed to fetch units";
      alert(`Error loading units: ${errorMsg}`);
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
