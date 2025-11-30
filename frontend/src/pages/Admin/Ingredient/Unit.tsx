import React, { useState } from "react";
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

  const handleFormSubmit = async (data: Partial<Unit>) => {
    console.log("Form submitted with data:", data);
    // Implement form submission logic here
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
        <Table data={units} onEdit={handleEdit} onDelete={handleDelete} />
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
