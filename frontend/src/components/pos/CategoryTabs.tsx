import { Badge } from '../ui/badge';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className="focus:outline-none"
          >
            <Badge
              variant={isActive ? 'default' : 'outline'}
              className="whitespace-nowrap cursor-pointer"
            >
              {category}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
