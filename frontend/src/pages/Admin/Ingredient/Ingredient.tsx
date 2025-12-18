import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";
import { apiClient } from "@/api/client";

interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  threshold: number;
  unit_id: number;
  unit: {
    id: number;
    name: string;
  };
}

const ingredientColumns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "unit.name", label: "Unit" },
  { key: "quantity", label: "Quantity" },
  { key: "threshold", label: "Threshold" },
];

const formFields: FormField<Ingredient>[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "quantity", label: "Quantity", type: "number" },
  { key: "threshold", label: "Threshold", type: "number" },
  {
    key: "unit_id",
    label: "Unit",
    type: "select-fetch",
    fetchUrl: "/resources/ingredient-units",
  },
];

const fields: FilterField[] = [
  { key: "name", label: "Name", type: "text", col: 2 },
  { key: "quantity", label: "Quantity", type: "text" },
  { key: "threshold", label: "Threshold", type: "text" },
  {
    key: "unit",
    label: "Unit",
    type: "select-fetch",
    fetchUrl: "/resources/ingredient-units",
  },
];

const IngredientPage: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchOptions = async (key: string, url: string) => {
    try {
      const res = await apiClient.get(url);
      const body = res.data;
      const items = Array.isArray(body) ? body : body.data ?? [];

      const options = items.map((item: any) => ({
        label: item.name ?? item.status ?? String(item),
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
      const params: Record<string, string> = {};
      if (values.name) params.name = values.name;
      if (values.quantity) params.quantity = values.quantity;
      if (values.threshold) params.threshold = values.threshold;
      if (values.unit) params.unit_id = values.unit;

      const res = await apiClient.get("/resources/ingredients", { params });
      const body = res.data;
      const items = Array.isArray(body) ? body : body.data ?? [];
      setIngredients(items);
    } catch (err: any) {
      console.error("Search failed:", err);
      alert(`Error: ${err.message || "Search failed"}`);
    }
  };

  const handleEdit = async (row: any) => {
    openEditForm(row);
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm("Delete this ingredient?")) return;

    try {
      await apiClient.delete(`/resources/ingredients/${row.id}`);
      await fetchIngredients();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Error: ${err.message || "Delete failed"}`);
    }
  };

  const handleFormSubmit = async (data: Partial<Ingredient>) => {
    try {
      if (editingIngredient?.id) {
        // PUT: Update
        await apiClient.put(`/resources/ingredients/${editingIngredient.id}`, data);
      } else {
        // POST: Create
        await apiClient.post("/resources/ingredients", data);
      }
      closeForm();
      await fetchIngredients();
    } catch (err: any) {
      console.error("Form submission failed:", err);
      alert(`Error: ${err.message || "Form submission failed"}`);
    }
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const openAddForm = () => {
    setEditingIngredient(null);
    setShowForm(true);
  };
  const openEditForm = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const fetchIngredients = async () => {
    try {
      const res = await apiClient.get("/resources/ingredients");
      const body = res.data;
      const items = Array.isArray(body) ? body : body.data ?? [];
      setIngredients(items);
    } catch (err) {
      console.error("Failed to fetch ingredients:", err);
    }
  };

  useEffect(() => {
    fetchIngredients();
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
          Add Ingredient
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <Table
          data={ingredients}
          columns={ingredientColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Popup open={showForm} onClose={closeForm}>
        <Form<Ingredient>
          fields={formFields}
          initialData={editingIngredient || {}}
          onSubmitAdd={handleFormSubmit}
          onSubmitEdit={handleFormSubmit}
          onClose={closeForm}
        />
      </Popup>
    </div>
  );
};

export default IngredientPage;
