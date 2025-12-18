import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";
import { apiClient } from "@/api/client";

interface Tag {
  id: number;
  name: string;
}

const formFields: FormField<Tag>[] = [
  { key: "name", label: "Tag Name", type: "text" },
];

const fields: FilterField[] = [
  { key: "name", label: "Name", type: "text", col: 2 },
];

const TagPage: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchOptions = () => {
    // No select-fetch fields here
  };

  const handleSearch = () => {
    console.log("Search values:", values);
    fetchTags(values);
  };

  const handleEdit = (row: Tag) => {
    setEditingTag(row);
    setShowForm(true);
  };

  const handleDelete = async (row: Tag) => {
    if (!window.confirm(`Are you sure you want to delete tag "${row.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/resources/tags/${row.id}`);
      alert("Tag deleted successfully!");
      fetchTags();
    } catch (err: any) {
      console.error("Delete failed:", err);
      const errorMsg = err.response?.data?.detail || "Failed to delete tag. Please try again.";
      alert(errorMsg);
    }
  };

  const handleFormSubmitAdd = async (data: Partial<Tag>) => {
    setLoading(true);
    try {
      await apiClient.post("/resources/tags", { name: data.name });
      alert("Tag created successfully!");
      closeForm();
      fetchTags();
    } catch (err: any) {
      console.error("Create failed:", err);
      const errorMsg = err.response?.data?.detail || "Failed to create tag. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmitEdit = async (data: Partial<Tag>) => {
    if (!editingTag) return;

    setLoading(true);
    try {
      await apiClient.put(`/resources/tags/${editingTag.id}`, { name: data.name });
      alert("Tag updated successfully!");
      closeForm();
      fetchTags();
    } catch (err: any) {
      console.error("Update failed:", err);
      const errorMsg = err.response?.data?.detail || "Failed to update tag. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTag(null);
  };

  const openAddForm = () => {
    setEditingTag(null);
    setShowForm(true);
  };

  const fetchTags = async (filters?: Record<string, string>) => {
    try {
      const params: Record<string, string> = {};
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params[key] = value;
        });
      }

      const res = await apiClient.get("/resources/tags", { params });
      const body = res.data;
      const items = Array.isArray(body) ? body : body.data ?? [];
      setTags(items);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  useEffect(() => {
    fetchTags();
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
          Add Tag
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <Table
          data={tags}
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Tag Name" },
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Popup open={showForm} onClose={closeForm}>
        <Form<Tag>
          fields={formFields}
          initialData={editingTag || {}}
          onSubmitAdd={handleFormSubmitAdd}
          onSubmitEdit={handleFormSubmitEdit}
          onClose={closeForm}
        />
      </Popup>
    </div>
  );
};

export default TagPage;
