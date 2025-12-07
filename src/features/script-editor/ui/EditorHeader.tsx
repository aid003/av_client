'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Settings,
} from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import { Badge } from '@/shared/ui/components/ui/badge';
import {
  useScriptEditorMeta,
  useScriptEditorStatus,
  useScriptEditorActions,
} from '../model/store';
import { isDefinitionValid } from '../model/validators';
import {
  createSalesScript,
  updateSalesScript,
  validateScriptDefinition,
  useSalesScriptsActions,
  type ScriptValidationResult,
} from '@/entities/sales-script';
import { SlotsManagementDialog } from './dialogs/SlotsManagementDialog';
import { LLMSettingsDialog } from './dialogs/LLMSettingsDialog';
import { UnsavedChangesDialog } from './dialogs/UnsavedChangesDialog';

interface EditorHeaderProps {
  tenantId: string;
}

export function EditorHeader({ tenantId }: EditorHeaderProps) {
  const router = useRouter();
  const meta = useScriptEditorMeta();
  const status = useScriptEditorStatus();
  const {
    getDefinition,
    setSaving,
    setError,
    markClean,
    initFromDefinition,
    setValidationResult: setValidationResultInStore,
    clearValidation,
  } = useScriptEditorActions();
  const { addSalesScript } = useSalesScriptsActions();

  const [validationResult, setValidationResult] = useState<ScriptValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showSlotsDialog, setShowSlotsDialog] = useState(false);
  const [showLLMSettingsDialog, setShowLLMSettingsDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  useEffect(() => {
    if (validationResult) {
      const timer = setTimeout(() => {
        setValidationResult(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [validationResult]);

  useEffect(() => {
    if (status.error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status.error, setError]);

  const handleBack = () => {
    if (status.isDirty) {
      setShowUnsavedDialog(true);
    } else {
      router.push('/sales-scripts');
    }
  };

  const handleConfirmExit = () => {
    setShowUnsavedDialog(false);
    router.push('/sales-scripts');
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setValidationResult(null); // Очищаем результат валидации при сохранении
    clearValidation();

    try {
      const definition = getDefinition();

      // Если скрипт еще не создан
      if (!meta.scriptId) {
        // Валидируем структуру перед созданием
        if (!isDefinitionValid(definition)) {
          setError(
            'Скрипт должен содержать блок START и хотя бы одно ребро с условием ALWAYS от START'
          );
          setSaving(false);
          return;
        }

        // Создаем новый скрипт
        const newScript = await createSalesScript(tenantId, {
          name: meta.scriptName,
          description: meta.scriptDescription || undefined,
          definition,
          isActive: meta.isActive,
        });

        // Добавляем скрипт в store списка скриптов
        addSalesScript(tenantId, newScript);

        // Обновляем store редактора с новым scriptId
        initFromDefinition(
          newScript.id,
          newScript.name,
          newScript.description,
          newScript.isActive,
          newScript.definition
        );

        // Очищаем localStorage
        localStorage.removeItem('newScriptData');

        // Редирект на страницу редактирования
        router.push(`/sales-scripts/${newScript.id}/edit`);
        markClean();
      } else {
        // Обновляем существующий скрипт
        await updateSalesScript(meta.scriptId, tenantId, {
          name: meta.scriptName,
          description: meta.scriptDescription || undefined,
          definition,
        });
        markClean();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);
    clearValidation();

    try {
      const definition = getDefinition();
      const result = await validateScriptDefinition(definition);

      const normalizedResult: ScriptValidationResult = {
        isValid:
          typeof result.isValid === 'boolean'
            ? result.isValid
            : !result.errors || result.errors.length === 0,
        errors: result.errors || [],
        warnings: result.warnings || [],
      };

      setValidationResult(normalizedResult);
      setValidationResultInStore(normalizedResult);
    } catch (err) {
      const fallback: ScriptValidationResult = {
        isValid: false,
        errors: [
          {
            severity: 'error',
            code: 'CLIENT_VALIDATION_ERROR',
            message: err instanceof Error ? err.message : 'Ошибка валидации',
          },
        ],
        warnings: [],
      };
      setValidationResult(fallback);
      setValidationResultInStore(fallback);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold leading-tight">
            {meta.scriptName || 'Новый скрипт'}
          </h1>
          {meta.scriptDescription && (
            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
              {meta.scriptDescription}
            </p>
          )}
        </div>

        {status.isDirty && (
          <Badge variant="secondary" className="text-xs">
            Не сохранено
          </Badge>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Validation result or Save error */}
        {(validationResult || status.error) && (
          <div className="flex items-center gap-1.5 mr-2">
            {validationResult ? (
              validationResult.errors.length > 0 ? (
                <>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    {validationResult.errors.length === 1
                      ? '1 ошибка'
                      : `${validationResult.errors.length} ошибок`}
                  </span>
                  {validationResult.warnings.length > 0 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      + {validationResult.warnings.length} предупрежд.
                    </span>
                  )}
                </>
              ) : validationResult.warnings.length > 0 ? (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-amber-600 dark:text-amber-400">
                    {validationResult.warnings.length === 1
                      ? '1 предупреждение'
                      : `${validationResult.warnings.length} предупреждений`}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Скрипт валиден
                  </span>
                </>
              )
            ) : status.error ? (
              <>
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{status.error}</span>
              </>
            ) : null}
          </div>
        )}

        {/* Slots management button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSlotsDialog(true)}
          title="Управление слотами"
        >
          <Database className="w-4 h-4 mr-2" />
          Слоты
        </Button>

        {/* Settings button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLLMSettingsDialog(true)}
          title="Настройки"
        >
          <Settings className="w-4 h-4 mr-2" />
          Настройки
        </Button>

        {/* Validate button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleValidate}
          disabled={isValidating}
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Проверить
        </Button>

        {/* Save button */}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={status.isSaving || (!status.isDirty && meta.scriptId !== null)}
        >
          {status.isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {meta.scriptId === null ? 'Создать скрипт' : 'Сохранить'}
        </Button>
      </div>

      {/* Slots management dialog */}
      <SlotsManagementDialog
        open={showSlotsDialog}
        onOpenChange={setShowSlotsDialog}
      />

      {/* LLM Settings dialog */}
      <LLMSettingsDialog
        open={showLLMSettingsDialog}
        onOpenChange={setShowLLMSettingsDialog}
        tenantId={tenantId}
      />

      {/* Unsaved changes dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onConfirm={handleConfirmExit}
      />
    </header>
  );
}

