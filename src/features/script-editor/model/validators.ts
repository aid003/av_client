import type { ScriptDefinition } from '@/entities/sales-script';

/**
 * Проверяет, является ли структура скрипта валидной для создания/сохранения
 * Требования:
 * - Есть хотя бы один блок типа START
 * - От START отходит хотя бы одно ребро с condition.type = 'ALWAYS'
 */
export function isDefinitionValid(definition: ScriptDefinition): boolean {
  // Проверяем наличие блоков
  if (!definition.blocks || definition.blocks.length === 0) {
    return false;
  }

  // Проверяем наличие блока START
  const startBlocks = definition.blocks.filter((block) => block.type === 'START');
  if (startBlocks.length === 0) {
    return false;
  }

  // Должен быть ровно один блок START
  if (startBlocks.length > 1) {
    return false;
  }

  const startBlockId = startBlocks[0].id;

  // Проверяем наличие рёбер от START с условием ALWAYS
  if (!definition.edges || definition.edges.length === 0) {
    return false;
  }

  const edgesFromStart = definition.edges.filter(
    (edge) => edge.from === startBlockId && edge.condition.type === 'ALWAYS'
  );

  if (edgesFromStart.length === 0) {
    return false;
  }

  return true;
}

