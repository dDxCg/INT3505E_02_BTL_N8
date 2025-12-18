import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";

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
    fetchUrl: "http://localhost:8000/api/v1/resources/ingredient-units",
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
    fetchUrl: "http://localhost:8000/api/v1/resources/ingredient-units",
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
      const res = await fetch(url);
      const body = await res.json();
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
    const apiUrl = "http://localhost:8000/api";
    try {
      const params = new URLSearchParams();
      if (values.name) params.append("name", values.name);
      if (values.quantity) params.append("quantity", values.quantity);
      if (values.threshold) params.append("threshold", values.threshold);
      if (values.unit) params.append("unit_id", values.unit);

      const query = params.toString();
      const url = `${apiUrl}/v1/resources/ingredients${
        query ? "?" + query : ""
      }`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];
      setIngredients(items);
    } catch (err: any) {
      console.error("Search failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = async (row: any) => {
    openEditForm(row);
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm("Delete this ingredient?")) return;

    const apiUrl = "http://localhost:8000/api";
    try {
      const res = await fetch(`${apiUrl}/v1/resources/ingredients/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchIngredients();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleFormSubmit = async (data: Partial<Ingredient>) => {
    const apiUrl = "http://localhost:8000/api";
    try {
      if (editingIngredient?.id) {
        // PUT: Update
        const res = await fetch(
          `${apiUrl}/v1/resources/ingredients/${editingIngredient.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // POST: Create
        const res = await fetch(`${apiUrl}/v1/resources/ingredients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      closeForm();
      await fetchIngredients();
    } catch (err: any) {
      console.error("Form submission failed:", err);
      alert(`Error: ${err.message}`);
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
      const res = await fetch(
        "http://localhost:8000/api/v1/resources/ingredients"
      );
      const body = await res.json();
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
