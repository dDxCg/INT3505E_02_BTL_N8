import React, { useState, useRef } from "react";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
  dishId: number;
  currentImageUrl?: string | null;
  onUploadSuccess?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  onDeleteSuccess?: () => void;
  onFileSelected?: (file: File | null) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  dishId,
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  onDeleteSuccess,
  onFileSelected,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus("Invalid file type. Please select an image file (JPEG, PNG, GIF, or WebP).");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadStatus("File is too large. Maximum size is 5MB.");
      return;
    }

    setSelectedFile(file);
    setUploadStatus("");

    // Notify parent about file selection
    if (onFileSelected) {
      onFileSelected(file);
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    console.log("[ImageUpload] handleUpload ENTRY - event:", e?.type, "button type:", e?.currentTarget?.type);
    e?.preventDefault();
    e?.stopPropagation();

    console.log("[ImageUpload] After preventDefault/stopPropagation");
    console.log("[ImageUpload] handleUpload called with dishId:", dishId);

    if (!selectedFile) {
      setUploadStatus("Please select an image first.");
      return;
    }

    setUploading(true);
    setUploadStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const url = `http://localhost:8000/api/v1/resources/dishes/${dishId}/upload-image`;
      console.log("[ImageUpload] Calling POST:", url);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      console.log("[ImageUpload] Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("[ImageUpload] Upload successful, image_url:", data.image_url);
        setUploadStatus("Image uploaded successfully!");

        // Clear selection
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Notify parent
        if (onUploadSuccess) {
          onUploadSuccess(data.image_url);
        }
      } else {
        const error = await response.json();
        const errorMessage = error.detail || "Failed to upload image";
        console.error("[ImageUpload] Upload failed:", errorMessage);
        setUploadStatus(`Error: ${errorMessage}`);
        if (onUploadError) {
          onUploadError(errorMessage);
        }
      }
    } catch (error) {
      console.error("[ImageUpload] Network error:", error);
      const errorMessage = "Network error. Please try again.";
      setUploadStatus(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Notify parent that file is cleared
    if (onFileSelected) {
      onFileSelected(null);
    }
  };

  const handleDeleteImage = async () => {
    if (!currentImageUrl) {
      setUploadStatus("No image to delete.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    setUploading(true);
    setUploadStatus("Deleting image...");

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/resources/dishes/${dishId}/delete-image`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setUploadStatus("Image deleted successfully!");
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        const error = await response.json();
        const errorMessage = error.detail || "Failed to delete image";
        setUploadStatus(`Error: ${errorMessage}`);
        if (onUploadError) {
          onUploadError(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = "Network error. Please try again.";
      setUploadStatus(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.imageUploadContainer}>
      <h3 className={styles.title}>Dish Image</h3>

      {/* Current Image */}
      {currentImageUrl && !previewUrl && (
        <div className={styles.currentImageSection}>
          <label className={styles.label}>Current Image:</label>
          <div className={styles.imageWrapper}>
            <img
              src={currentImageUrl}
              alt="Current dish"
              className={styles.currentImage}
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteImage();
            }}
            className={styles.deleteImageButton}
            disabled={uploading}
          >
            {uploading ? "Deleting..." : "🗑️ Delete Image"}
          </button>
        </div>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className={styles.fileInput}
      />

      {/* Browse Button */}
      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBrowseClick();
          }}
          className={styles.browseButton}
          disabled={uploading}
        >
          📁 Browse Image
        </button>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className={styles.previewSection}>
          <label className={styles.label}>Preview:</label>
          <div className={styles.imageWrapper}>
            <img
              src={previewUrl}
              alt="Preview"
              className={styles.previewImage}
            />
          </div>
          <p className={styles.fileName}>{selectedFile?.name}</p>
          <p className={styles.helperText}>Click "Update" to save this image with your changes</p>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClearSelection();
              }}
              className={styles.clearButton}
              disabled={uploading}
            >
              ✖️ Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Status Message */}
      {uploadStatus && (
        <div
          className={
            uploadStatus.includes("success")
              ? styles.statusSuccess
              : uploadStatus.includes("Error") || uploadStatus.includes("Invalid")
              ? styles.statusError
              : styles.statusInfo
          }
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
