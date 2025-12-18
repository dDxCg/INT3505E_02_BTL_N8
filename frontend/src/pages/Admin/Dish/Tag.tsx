import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";

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
      const res = await fetch(
        `http://localhost:8000/api/v1/resources/tags/${row.id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        alert("Tag deleted successfully!");
        fetchTags();
      } else {
        const error = await res.json();
        alert(`Failed to delete tag: ${error.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete tag. Please try again.");
    }
  };

  const handleFormSubmitAdd = async (data: Partial<Tag>) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/resources/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });

      if (res.ok) {
        alert("Tag created successfully!");
        closeForm();
        fetchTags();
      } else {
        const error = await res.json();
        alert(`Failed to create tag: ${error.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Create failed:", err);
      alert("Failed to create tag. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmitEdit = async (data: Partial<Tag>) => {
    if (!editingTag) return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/resources/tags/${editingTag.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: data.name }),
        }
      );

      if (res.ok) {
        alert("Tag updated successfully!");
        closeForm();
        fetchTags();
      } else {
        const error = await res.json();
        alert(`Failed to update tag: ${error.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update tag. Please try again.");
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
      let url = "http://localhost:8000/api/v1/resources/tags";

      if (filters && Object.keys(filters).length > 0) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const res = await fetch(url);
      const body = await res.json();
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
