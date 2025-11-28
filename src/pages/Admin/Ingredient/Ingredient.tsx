import React, { useState } from "react";
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
  unit: string;
}

const formFields: FormField<Ingredient>[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "quantity", label: "Quantity", type: "number" },
  { key: "threshold", label: "Threshold", type: "number" },
  {
    key: "unit",
    label: "Unit",
    type: "select",
  },
];

const fields: FilterField[] = [
  { key: "name", label: "Name", type: "text", col: 2 },
  { key: "quantity", label: "Quantity", type: "text" },
  { key: "threshold", label: "Threshold", type: "text" },
  { key: "unit", label: "Unit", type: "select-fetch", fetchUrl: "/api/units" },
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

  const handleFetchOptions = (key: string, url: string) => {
    console.log(`Fetch options for ${key} from ${url}`);
    // implement fetching inside SelectFetchField
  };

  const handleSearch = () => {
    console.log("Search values:", values);
    // You can call your API here with the current filter values
  };

  const handleEdit = (row: any) => {
    console.log("Edit row:", row);
    // Implement edit functionality here
  };

  const handleDelete = (row: any) => {
    console.log("Delete row:", row);
    // Implement delete functionality here
  };

  const handleFormSubmit = async (data: Partial<Ingredient>) => {
    console.log("Form submitted with data:", data);
    // Implement form submission logic here
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
        <Table data={ingredients} onEdit={handleEdit} onDelete={handleDelete} />
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
