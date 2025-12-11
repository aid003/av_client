import { Badge } from '@/shared/ui/components/ui/badge';
import type { AvitoAdCategory } from '../../../model/types';

export function CategoryCell({ category }: { category: AvitoAdCategory }) {
  return (
    <Badge variant="secondary" className="text-xs">
      {category.name}
    </Badge>
  );
}
