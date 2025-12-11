import { ExternalLink } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';

export function LinkCell({ url }: { url: string }) {
  return (
    <Button variant="ghost" size="icon" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer" title="Открыть на Avito">
        <ExternalLink className="h-4 w-4" />
      </a>
    </Button>
  );
}
