import os
import uuid
from typing import BinaryIO
from configs.supabase import get_supabase, get_public_url, SUPABASE_BUCKET_NAME


class StorageService:
    """Service for handling file uploads to Supabase Storage"""

    def __init__(self):
        self.supabase = get_supabase()
        self.bucket_name = SUPABASE_BUCKET_NAME

    async def upload_dish_image(self, file: BinaryIO, filename: str) -> str:
        """
        Upload a dish image to Supabase Storage

        Args:
            file: Binary file object
            filename: Original filename

        Returns:
            Public URL of the uploaded image
        """
        # Generate unique filename to avoid collisions
        file_ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = f"dishes/{unique_filename}"

        # Read file content as bytes
        file.seek(0)  # Reset file pointer to beginning
        file_content = file.read()

        # Upload to Supabase
        response = self.supabase.storage.from_(self.bucket_name).upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": self._get_content_type(file_ext)}
        )

        # Get public URL
        public_url = get_public_url(file_path)
        return public_url

    async def delete_dish_image(self, file_path: str) -> None:
        """
        Delete a dish image from Supabase Storage

        Args:
            file_path: Path to the file in storage (extract from URL)

        Raises:
            Exception if delete fails
        """
        original_path = file_path

        # Extract the path from the public URL if needed
        if file_path.startswith("http"):
            # Parse the path from the URL
            # Example: https://project.supabase.co/storage/v1/object/public/dish-images/dishes/file.jpg?t=123
            # Extract: dishes/file.jpg

            # Remove query parameters first (everything after ?)
            if "?" in file_path:
                file_path = file_path.split("?")[0]

            # Split by bucket name
            parts = file_path.split(f"{self.bucket_name}/")
            if len(parts) > 1:
                file_path = parts[1]
            else:
                raise ValueError(f"Invalid Supabase URL format: {file_path}")

        # Clean up any trailing special characters
        file_path = file_path.rstrip("?&/")

        print(f"Attempting to delete file from Supabase:")
        print(f"  Original URL: {original_path}")
        print(f"  Extracted path: {file_path}")
        print(f"  Bucket: {self.bucket_name}")

        # Delete from Supabase storage
        try:
            response = self.supabase.storage.from_(self.bucket_name).remove([file_path])
            print(f"  Delete response: {response}")

            # Check if deletion was successful
            # Supabase returns a list of deleted files or error info
            if not response:
                raise Exception(f"No response from Supabase when deleting: {file_path}")

        except Exception as e:
            print(f"  Delete failed with error: {str(e)}")
            raise Exception(f"Failed to delete file from Supabase bucket '{self.bucket_name}': {str(e)}")

    def _get_content_type(self, file_ext: str) -> str:
        """Get MIME type based on file extension"""
        content_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
        }
        return content_types.get(file_ext.lower(), "application/octet-stream")


# Global instance
storage_service = StorageService()
