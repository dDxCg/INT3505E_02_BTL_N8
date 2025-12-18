import { useState } from 'react';
import { Utensils } from 'lucide-react';
import { getDishImageUrl } from '../../lib/utils';

interface DishImageProps {
  imagePath: string | null | undefined;
  dishName: string;
  className?: string;
}

export function DishImage({ imagePath, dishName, className = '' }: DishImageProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getDishImageUrl(imagePath);

  // Use Unsplash food image as fallback
  const fallbackUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';

  // If no image path or image failed to load, use fallback
  const displayUrl = (!imageUrl || imageError) ? fallbackUrl : imageUrl;

  return (
    <img
      src={displayUrl}
      alt={dishName}
      className={className}
      onError={(e) => {
        // If the API image fails, try the fallback
        if (!imageError && displayUrl !== fallbackUrl) {
          setImageError(true);
        }
      }}
      loading="lazy"
    />
  );
}
