import React, { useEffect, useState } from "react";
import { FilterBar } from "@/components/Admin/Filter/FilterBar";
import { FilterField } from "@/components/Admin/Filter/types";
import { Table } from "@/components/Admin/Table/Table";
import { Form, FormField } from "@/components/Admin/Form/Form";
import { Popup } from "@/components/Admin/Wrapper/Popup";
import ImageUpload from "@/components/Admin/Upload/ImageUpload";

interface Tag {
  id: number;
  name: string;
}

interface Dish {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  tags?: Tag[];
}

const dishColumns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "price", label: "Price" },
  { key: "description", label: "Description" },
];

const formFields: FormField<Dish>[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "price", label: "Price", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
];

const fields: FilterField[] = [
  { key: "name", label: "Name", type: "text", col: 2 },
  { key: "price", label: "Price", type: "text" },
];

const DishPage: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchOptions = async (key: string, url: string) => {
    try {
      const res = await fetch(url);
      const body = await res.json();

      const items = Array.isArray(body) ? body : body.data ?? [];

      const options = items.map((item: any) => ({
        label: item.name,
        value: String(item.id),
      }));

      fields.find((f) => f.key === key)!.options = options;
      setValues((prev) => ({ ...prev }));
    } catch (err) {
      console.error("fetch options failed:", err);
    }
  };

  const handleSearch = () => {
    console.log("Search values:", values);
    fetchDishes(values);
  };

  const handleEdit = (row: Dish) => {
    openEditForm(row);
  };

  const handleDelete = async (row: Dish) => {
    if (!window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/resources/dishes/${row.id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        alert("Dish deleted successfully!");
        fetchDishes();
      } else {
        const error = await res.json();
        alert(`Failed to delete dish: ${error.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete dish. Please try again.");
    }
  };

  const handleFormSubmitAdd = async (data: Partial<Dish>) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        price: Number(data.price),
        description: data.description || null,
        image_url: data.image_url || null,
        tag_ids: [],
      };

      const res = await fetch("http://localhost:8000/api/v1/resources/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Dish created successfully!");
        closeForm();
        fetchDishes();
      } else {
        const error = await res.json();
        alert(`Failed to create dish: ${error.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Create failed:", err);
      alert("Failed to create dish. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmitEdit = async (data: Partial<Dish>) => {
    console.log("[Dish] handleFormSubmitEdit called");
    console.log("[Dish] Form data:", data);
    console.log("[Dish] Selected image file:", selectedImageFile);

    if (!editingDish) return;

    setLoading(true);
    try {
      let newImageUrl: string | undefined = undefined;

      // Step 1: Upload image if a file is selected
      if (selectedImageFile) {
        console.log("[Dish] Uploading image first...");
        const formData = new FormData();
        formData.append("file", selectedImageFile);

        const uploadRes = await fetch(
          `http://localhost:8000/api/v1/resources/dishes/${editingDish.id}/upload-image`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          newImageUrl = uploadData.image_url;
          console.log("[Dish] Image uploaded successfully:", newImageUrl);
        } else {
          const uploadError = await uploadRes.json();
          alert(`Failed to upload image: ${uploadError.detail || "Unknown error"}`);
          setLoading(false);
          return; // Stop if image upload fails
        }
      }

      // Step 2: Update dish details
      console.log("[Dish] Updating dish details...");
      const payload = {
        name: data.name,
        price: data.price ? Number(data.price) : undefined,
        description: data.description,
        // Use the newly uploaded image URL if available, otherwise keep existing
        image_url: newImageUrl || data.image_url,
      };

      const res = await fetch(
        `http://localhost:8000/api/v1/resources/dishes/${editingDish.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        alert(selectedImageFile
          ? "Dish and image updated successfully!"
          : "Dish updated successfully!");
        setSelectedImageFile(null); // Clear selected file after successful update
        closeForm();
        fetchDishes();
      } else {
        const error = await res.json();
        alert(`Failed to update dish: ${error.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update dish. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDish(null);
    setSelectedImageFile(null); // Clear selected image when closing form
  };

  const openAddForm = () => {
    setEditingDish(null);
    setShowForm(true);
  };

  const openEditForm = (dish: Dish) => {
    setEditingDish(dish);
    setShowForm(true);
  };

  const handleUploadSuccess = (imageUrl: string) => {
    console.log("[Dish] handleUploadSuccess called with imageUrl:", imageUrl);
    alert("Image uploaded successfully!");
    // Refresh the dish list to show updated image
    fetchDishes();
    // Update editing dish with new image URL
    if (editingDish) {
      setEditingDish({ ...editingDish, image_url: imageUrl });
    }
  };

  const handleUploadError = (error: string) => {
    alert(`Upload failed: ${error}`);
  };

  const handleDeleteSuccess = () => {
    alert("Image deleted successfully!");
    // Refresh the dish list to show updated dish
    fetchDishes();
    // Update editing dish to remove image URL
    if (editingDish) {
      setEditingDish({ ...editingDish, image_url: null });
    }
  };

  const handleFileSelected = (file: File | null) => {
    console.log("[Dish] Image file selected:", file?.name || "null");
    setSelectedImageFile(file);
  };

  const fetchDishes = async (filters?: Record<string, string>) => {
    try {
      let url = "http://localhost:8000/api/v1/resources/dishes";

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
      setDishes(items);
    } catch (err) {
      console.error("fetch all dishes fail:", err);
      setError("Failed to fetch dishes");
    }
  };

  useEffect(() => {
    fetchDishes();
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
          Add Dish
        </button>
      </div>
      <div style={{ marginTop: "16px" }}>
        <Table
          data={dishes}
          columns={dishColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <Popup open={showForm} onClose={closeForm}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <Form<Dish>
              fields={formFields}
              initialData={editingDish || {}}
              onSubmitAdd={handleFormSubmitAdd}
              onSubmitEdit={handleFormSubmitEdit}
              onClose={closeForm}
            />
          </div>
          {editingDish && editingDish.id && (
            <div style={{ borderTop: "1px solid #ddd", paddingTop: "20px" }}>
              <ImageUpload
                dishId={editingDish.id}
                currentImageUrl={editingDish.image_url}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                onDeleteSuccess={handleDeleteSuccess}
                onFileSelected={handleFileSelected}
              />
            </div>
          )}
        </div>
      </Popup>
    </div>
  );
};

export default DishPage;
