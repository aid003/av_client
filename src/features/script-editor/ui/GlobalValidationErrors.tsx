'use client';

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useScriptEditorValidation } from '../model/store';

/**
 * Компонент для отображения глобальных ошибок валидации (не привязанных к блокам)
 */
export function GlobalValidationErrors() {
  const { errors } = useScriptEditorValidation();

  // Фильтруем ошибки, которые не привязаны к блокам, ребрам или слотам
  const globalErrors = errors.filter(
    (error) => !error.context?.blockId && !error.context?.edgeId && !error.context?.slotName
  );

  if (globalErrors.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none">
      <Alert variant="destructive" className="pointer-events-auto shadow-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ошибки валидации скрипта</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            {globalErrors.map((error, index) => (
              <li key={`${error.code}-${index}`}>{error.message}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
