import { BookText } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import { useAdKbLinks } from '@/entities/ad-knowledge-link/model/store';
import type { AvitoAd } from '../../../model/types';

interface KnowledgeBasesCellProps {
  ad: AvitoAd;
  onViewKnowledgeBases: (ad: AvitoAd) => void;
}

export function KnowledgeBasesCell({
  ad,
  onViewKnowledgeBases,
}: KnowledgeBasesCellProps) {
  const kbLinks = useAdKbLinks(ad.id);
  const kbCount = kbLinks?.length ?? 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={() => onViewKnowledgeBases(ad)}
    >
      <BookText className="h-4 w-4 mr-1" />
      {kbCount > 0 ? kbCount : 'Нет'}
    </Button>
  );
}
