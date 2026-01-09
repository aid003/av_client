import type { LucideIcon } from 'lucide-react';
import { Palette, Bell } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  { id: 'appearance', label: 'Внешний вид', icon: Palette },
  { id: 'notifications', label: 'Уведомления', icon: Bell },
];

interface SettingsSidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function SettingsSidebar({
  activeCategory,
  onCategoryChange,
}: SettingsSidebarProps) {
  return (
    <nav className="space-y-1">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{category.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
