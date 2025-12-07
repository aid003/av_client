'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import { Input } from '@/shared/ui/components/ui/input';
import { Label } from '@/shared/ui/components/ui/label';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Switch } from '@/shared/ui/components/ui/switch';
import { Badge } from '@/shared/ui/components/ui/badge';
import { Card } from '@/shared/ui/components/ui/card';
import { cn } from '@/shared/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import {
  useScriptEditorSlots,
  useScriptEditorActions,
  useScriptEditorStore,
  useScriptEditorValidation,
} from '../../model/store';
import type { ScriptSlot, SlotType, QuestionBlockConfig } from '@/entities/sales-script';

interface SlotsManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SlotsManagementDialog({ open, onOpenChange }: SlotsManagementDialogProps) {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingSlot, setEditingSlot] = useState<ScriptSlot | null>(null);

  const handleEdit = (slot: ScriptSlot) => {
    setEditingSlot(slot);
    setMode('edit');
  };

  const handleBack = () => {
    setMode('list');
    setEditingSlot(null);
  };

  const handleCreateComplete = () => {
    setMode('list');
  };

  const handleEditComplete = () => {
    setMode('list');
    setEditingSlot(null);
  };

  // Сброс режима при закрытии диалога
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMode('list');
      setEditingSlot(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {mode === 'list' && <SlotsList onEdit={handleEdit} onCreate={() => setMode('create')} />}
        {mode === 'create' && <SlotForm mode="create" onComplete={handleCreateComplete} onCancel={handleBack} />}
        {mode === 'edit' && editingSlot && (
          <SlotForm mode="edit" slot={editingSlot} onComplete={handleEditComplete} onCancel={handleBack} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ========================================
// SlotsList
// ========================================

interface SlotsListProps {
  onEdit: (slot: ScriptSlot) => void;
  onCreate: () => void;
}

function SlotsList({ onEdit, onCreate }: SlotsListProps) {
  const slots = useScriptEditorSlots();
  const { removeSlot } = useScriptEditorActions();

  const handleDelete = (slotName: string) => {
    const nodes = useScriptEditorStore.getState().nodes;
    const usedInBlocks = nodes.filter(node => {
      if (node.data.blockType === 'QUESTION') {
        const config = node.data.config as QuestionBlockConfig;
        return config.slot === slotName;
      }
      return false;
    });

    if (usedInBlocks.length > 0) {
      const confirmed = window.confirm(
        `Слот "${slotName}" используется в ${usedInBlocks.length} блоке(ах). ` +
        `При удалении эти блоки станут невалидными. Продолжить?`
      );
      if (!confirmed) return;
    }

    removeSlot(slotName);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Управление слотами</DialogTitle>
        <DialogDescription>
          Слоты используются для сохранения информации о клиенте во время диалога
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto py-4 space-y-2">
        {slots.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Нет слотов</p>
            <p className="text-xs mt-1">Создайте первый слот для сбора информации</p>
          </div>
        )}

        {slots.map(slot => (
          <SlotCard
            key={slot.name}
            slot={slot}
            onEdit={() => onEdit(slot)}
            onDelete={() => handleDelete(slot.name)}
          />
        ))}
      </div>

      <DialogFooter>
        <Button onClick={onCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Создать слот
        </Button>
      </DialogFooter>
    </>
  );
}

// ========================================
// SlotCard
// ========================================

interface SlotCardProps {
  slot: ScriptSlot;
  onEdit: () => void;
  onDelete: () => void;
}

function SlotCard({ slot, onEdit, onDelete }: SlotCardProps) {
  const { bySlotName } = useScriptEditorValidation();
  const issues = bySlotName[slot.name] || [];
  const hasError = issues.some((issue) => issue.severity === 'error');
  const hasWarning = issues.some((issue) => issue.severity === 'warning');

  const getSlotTypeLabel = (type: SlotType): string => {
    switch (type) {
      case 'string': return 'Строка';
      case 'number': return 'Число';
      case 'boolean': return 'Да/Нет';
      case 'enum': return 'Список';
      default: return type;
    }
  };

  return (
    <Card
      className={cn(
        'p-4',
        hasError
          ? 'border-destructive/60 shadow-[0_0_0_2px_rgba(239,68,68,0.08)]'
          : hasWarning
            ? 'border-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.12)]'
            : null
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium truncate">{slot.name}</h4>
            <Badge variant="secondary" className="shrink-0">
              {getSlotTypeLabel(slot.type)}
            </Badge>
            {slot.required && (
              <Badge variant="outline" className="shrink-0">
                Обязательный
              </Badge>
            )}
            {hasError && (
              <Badge variant="destructive" className="shrink-0 text-[10px]">
                Ошибка
              </Badge>
            )}
            {!hasError && hasWarning && (
              <Badge
                variant="outline"
                className="shrink-0 text-[10px] border-amber-400 text-amber-700 dark:text-amber-300"
              >
                Предупреждение
              </Badge>
            )}
          </div>

          {slot.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {slot.description}
            </p>
          )}

          {slot.type === 'enum' && slot.enumValues && slot.enumValues.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {slot.enumValues.map(val => (
                <Badge key={val} variant="outline" className="text-xs">
                  {val}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={onEdit} title="Редактировать">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete} title="Удалить">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ========================================
// SlotForm
// ========================================

interface SlotFormProps {
  mode: 'create' | 'edit';
  slot?: ScriptSlot | null;
  onComplete: () => void;
  onCancel: () => void;
}

function SlotForm({ mode, slot, onComplete, onCancel }: SlotFormProps) {
  const slots = useScriptEditorSlots();
  const { addSlot, updateSlot } = useScriptEditorActions();

  const [formData, setFormData] = useState<ScriptSlot>(
    slot || {
      name: '',
      type: 'string',
      description: '',
      required: false,
      enumValues: [],
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Валидация имени
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    } else if (!/^[a-z_][a-z0-9_]*$/i.test(formData.name)) {
      newErrors.name = 'Используйте только буквы, цифры и подчеркивание (snake_case)';
    } else if (mode === 'create' && slots.some(s => s.name === formData.name)) {
      newErrors.name = 'Слот с таким именем уже существует';
    }

    // Валидация enum values
    if (formData.type === 'enum' && (!formData.enumValues || formData.enumValues.length === 0)) {
      newErrors.enumValues = 'Добавьте хотя бы одно значение для списка';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (mode === 'create') {
      addSlot(formData);
    } else {
      updateSlot(formData.name, formData);
    }

    onComplete();
  };

  const handleTypeChange = (newType: SlotType) => {
    const updates: Partial<ScriptSlot> = { type: newType };

    // Очищаем enumValues если меняем тип с enum на другой
    if (newType !== 'enum') {
      updates.enumValues = undefined;
    } else if (!formData.enumValues || formData.enumValues.length === 0) {
      updates.enumValues = [];
    }

    setFormData({ ...formData, ...updates });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {mode === 'create' ? 'Создать слот' : 'Редактировать слот'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'create'
            ? 'Слот будет доступен для выбора в блоках типа "Вопрос"'
            : 'Изменения применятся ко всем блокам, использующим этот слот'}
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="slot-name">
            Название <span className="text-destructive">*</span>
          </Label>
          <Input
            id="slot-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="client_name"
            disabled={mode === 'edit'}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
          {mode === 'create' && (
            <p className="text-xs text-muted-foreground">
              Используйте snake_case (например: client_phone, budget_amount)
            </p>
          )}
          {mode === 'edit' && (
            <p className="text-xs text-muted-foreground">
              Имя слота нельзя изменить после создания
            </p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="slot-type">
            Тип <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.type}
            onValueChange={(value: SlotType) => handleTypeChange(value)}
          >
            <SelectTrigger id="slot-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">Строка</SelectItem>
              <SelectItem value="number">Число</SelectItem>
              <SelectItem value="boolean">Да/Нет</SelectItem>
              <SelectItem value="enum">Список значений</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {formData.type === 'string' && 'Для текстовых данных (имя, адрес, email)'}
            {formData.type === 'number' && 'Для числовых данных (бюджет, количество)'}
            {formData.type === 'boolean' && 'Для ответов да/нет (является компанией)'}
            {formData.type === 'enum' && 'Для выбора из списка (способ доставки, тариф)'}
          </p>
        </div>

        {/* Enum Values */}
        {formData.type === 'enum' && (
          <EnumValuesInput
            values={formData.enumValues || []}
            onChange={(values) => setFormData({ ...formData, enumValues: values })}
            error={errors.enumValues}
          />
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="slot-description">Описание</Label>
          <Textarea
            id="slot-description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Для чего используется этот слот..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Опишите, какую информацию хранит этот слот
          </p>
        </div>

        {/* Required */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="slot-required" className="cursor-pointer">
              Обязательный
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Диалог не может завершиться без заполнения этого слота
            </p>
          </div>
          <Switch
            id="slot-required"
            checked={formData.required || false}
            onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button onClick={handleSubmit}>
          {mode === 'create' ? 'Создать' : 'Сохранить'}
        </Button>
      </DialogFooter>
    </>
  );
}

// ========================================
// EnumValuesInput
// ========================================

interface EnumValuesInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
}

function EnumValuesInput({ values, onChange, error }: EnumValuesInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      alert('Это значение уже добавлено');
      return;
    }

    onChange([...values, trimmed]);
    setInputValue('');
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        Возможные значения <span className="text-destructive">*</span>
      </Label>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите значение и нажмите Enter..."
        />
        <Button type="button" variant="outline" onClick={handleAdd} className="shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
          {values.map((value, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              {value}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-1 hover:bg-destructive/20 rounded-sm p-0.5 transition-colors"
                title="Удалить"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Добавьте все возможные варианты ответа. Например: pickup, courier, post
      </p>
    </div>
  );
}
