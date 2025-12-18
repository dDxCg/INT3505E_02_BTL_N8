import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";
import { apiClient } from "@/api/client";

interface EquipmentType {
  id: number;
  name: string;
}

const formFields: FormField<EquipmentType>[] = [
  { key: "name", label: "Name", type: "text" },
];

const fields: FilterField[] = [
  { key: "name", label: "Name", type: "text", col: 2 },
];

const EquipmentTypePage: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipmentType, setEditingEquipmentType] =
    useState<EquipmentType | null>(null);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchOptions = (key: string, url: string) => {
    console.log(`Fetch options for ${key} from ${url}`);
    // implement fetching inside SelectFetchField
  };

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (values.name) {
        params.append("name", values.name);
      }
      const query = params.toString();
      const url = `/resources/equipment-types${query ? "?" + query : ""}`;

      const res = await apiClient.get(url);
      const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      setEquipmentTypes(items);
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
    if (!window.confirm("Delete this equipment type?")) return;

    try {
      await apiClient.delete(`/resources/equipment-types/${row.id}`);
      // Refetch after delete
      await fetchTypes();
    } catch (err: any) {
      console.error("Delete failed:", err);
      const errorMsg = err.response?.data?.detail || err.message || "Delete failed";
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleFormSubmit = async (data: Partial<EquipmentType>) => {
    try {
      if (editingEquipmentType?.id) {
        // PUT: Update
        await apiClient.put(`/resources/equipment-types/${editingEquipmentType.id}`, data);
      } else {
        // POST: Create
        await apiClient.post(`/resources/equipment-types`, data);
      }
      closeForm();
      // Refetch after add or update
      await fetchTypes();
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
    setEditingEquipmentType(null);
    setShowForm(true);
  };
  const openEditForm = (equipmentType: EquipmentType) => {
    setEditingEquipmentType(equipmentType);
    setShowForm(true);
  };

  const fetchTypes = async () => {
    try {
      const res = await apiClient.get("/resources/equipment-types");
      const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      setEquipmentTypes(items);
    } catch (err) {
      console.error("Failed to fetch equipment types:", err);
    }
  };

  useEffect(() => {
    fetchTypes();
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
          Add Equipment Type
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <Table
          data={equipmentTypes}
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Type" },
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Popup open={showForm} onClose={closeForm}>
        <Form<EquipmentType>
          fields={formFields}
          initialData={editingEquipmentType || {}}
          onSubmitAdd={handleFormSubmit}
          onSubmitEdit={handleFormSubmit}
          onClose={closeForm}
        />
      </Popup>
    </div>
  );
};

export default EquipmentTypePage;
