import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";

interface Equipment {
  id: number;
  name: string;
  status_id: number;
  type_id: number;
  status: {
    id: number;
    status: string;
  };
  type: {
    id: number;
    name: string;
  };
}

const equipmentColumns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "status.status", label: "Status" },
  { key: "type.name", label: "Type" },
];

const formFields: FormField<Equipment>[] = [
  { key: "name", label: "Name", type: "text" },
  {
    key: "status_id",
    label: "Status",
    type: "select-fetch",
    fetchUrl: "http://localhost:8000/api/v1/resources/equipment-statuses",
  },
  {
    key: "type_id",
    label: "Type",
    type: "select-fetch",
    fetchUrl: "http://localhost:8000/api/v1/resources/equipment-types",
  },
];

const fields: FilterField[] = [
  { key: "name", label: "Name", type: "text", col: 2 },
  {
    key: "status",
    label: "Status",
    type: "select-fetch",
    fetchUrl: "http://localhost:8000/api/v1/resources/equipment-statuses",
  },
  {
    key: "type",
    label: "Type",
    type: "select-fetch",
    fetchUrl: "http://localhost:8000/api/v1/resources/equipment-types",
  },
];

const EquipmentPage: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
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

      // Patch into fields so FilterBar re-renders
      const field = fields.find((f) => f.key === key);
      if (field) {
        field.options = options;
      }

      // Force a state update so React re-renders
      setValues((prev) => ({ ...prev }));
    } catch (err) {
      console.error("fetch options failed:", err);
    }
  };

  const handleSearch = async () => {
    const apiUrl = "http://localhost:8000/api";
    try {
      setLoading(true);

      // Build query params from filter values
      const params = new URLSearchParams();

      if (values.name) {
        params.append("name", values.name);
      }
      if (values.status) {
        // status is the ID from select-fetch
        params.append("status_id", values.status);
      }
      if (values.type) {
        // type is the ID from select-fetch
        params.append("type_id", values.type);
      }

      const query = params.toString();
      const url = `${apiUrl}/v1/resources/equipments${
        query ? "?" + query : ""
      }`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];
      setEquipments(items);
      setError(null);
    } catch (err: any) {
      console.error("Search failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: any) => {
    console.log("Edit row:", row);
    // Implement edit functionality here
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm("Delete this equipment?")) return;

    const apiUrl = "http://localhost:8000/api";
    try {
      const res = await fetch(`${apiUrl}/v1/resources/equipments/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Refetch after delete
      await fetchEquipments();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleFormSubmit = async (data: Partial<Equipment>) => {
    const apiUrl = "http://localhost:8000/api";
    try {
      if (editingEquipment?.id) {
        // PUT: Update existing equipment
        const res = await fetch(
          `${apiUrl}/v1/resources/equipments/${editingEquipment.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // POST: Create new equipment
        const res = await fetch(`${apiUrl}/v1/resources/equipments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      closeForm();
      // Refetch the full list after add or update
      await fetchEquipments();
    } catch (err: any) {
      console.error("Form submission failed:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const closeForm = () => setShowForm(false);
  const openAddForm = () => {
    setEditingEquipment(null);
    setShowForm(true);
  };
  const openEditForm = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setShowForm(true);
  };

  const fetchEquipments = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/resources/equipments"
      );
      const body = await res.json();
      const items = Array.isArray(body) ? body : body.data ?? [];
      setEquipments(items);
    } catch (err) {
      console.error("fetch all equipments fail:", err);
    }
  };

  useEffect(() => {
    fetchEquipments();
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
          Add Equipment
        </button>
      </div>
      <div style={{ marginTop: "16px" }}>
        <Table
          data={equipments}
          columns={equipmentColumns}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      </div>
      <Popup open={showForm} onClose={closeForm}>
        <Form<Equipment>
          fields={formFields}
          initialData={editingEquipment || {}}
          onSubmitAdd={handleFormSubmit}
          onSubmitEdit={handleFormSubmit}
          onClose={closeForm}
        />
      </Popup>
    </div>
  );
};

export default EquipmentPage;
