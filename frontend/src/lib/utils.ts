/**
 * Format a number as Vietnamese Dong currency
 * @param value - The numeric value to format
 * @returns Formatted string like "40.000 ₫"
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '0 ₫';
  }

  // Format with Vietnamese locale (thousands separator with dot)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

/**
 * Get the full URL for a dish image
 * @param imagePath - The image filename or path from the API
 * @returns Full URL to the image
 */
export function getDishImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return '';
  }

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // If imagePath is already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it starts with /api, use the base URL
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath}`;
  }

  // Otherwise, assume it's in the static images folder
  return `${baseUrl}/static/images/${imagePath}`;
}
