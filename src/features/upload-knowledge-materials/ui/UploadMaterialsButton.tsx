'use client';

import { Button } from '@/shared/ui/components/ui/button';
import type { KnowledgeBase } from '@/entities/knowledge-base';

interface UploadMaterialsButtonProps {
  knowledgeBase: KnowledgeBase;
}

export function UploadMaterialsButton({
  knowledgeBase,
}: UploadMaterialsButtonProps) {
  const handleClick = () => {
    // Заглушка - функционал будет добавлен позже
    console.log('Upload materials for:', knowledgeBase.name);
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleClick}>
      Загрузить материалы
    </Button>
  );
}
