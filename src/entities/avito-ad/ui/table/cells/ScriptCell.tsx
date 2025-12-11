import { FileText } from 'lucide-react';
import { useAdScriptBindings } from '@/entities/ad-script-binding/model/store';

export function ScriptCell({ adId }: { adId: string }) {
  const scriptBindings = useAdScriptBindings(adId);
  const activeBinding = scriptBindings?.find((b) => b.isActive) ?? null;

  if (!activeBinding) {
    return <span className="text-muted-foreground text-sm">Не привязано</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-primary shrink-0" />
      <span className="truncate text-sm" title={activeBinding.salesScriptName}>
        {activeBinding.salesScriptName}
      </span>
    </div>
  );
}
