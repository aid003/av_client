// Types
export type {
  // Script Definition Types
  ScriptBlockType,
  EdgeConditionType,
  SlotType,
  RouterMode,
  LLMReplyStyle,
  StartBlockConfig,
  MessageBlockConfig,
  QuestionBlockConfig,
  RouterBlockConfig,
  LLMReplyBlockConfig,
  EndBlockConfig,
  ScriptBlockConfig,
  ScriptBlock,
  EdgeCondition,
  ScriptEdge,
  ScriptSlot,
  ScriptMeta,
  ScriptDefinition,
  // Constructor Schema
  BlockTypeSchema,
  ConstructorSchema,
  // Validation
  ValidationError,
  ValidationResult,
  // Sales Script Entity
  SalesScript,
  CreateSalesScriptDto,
  UpdateSalesScriptDto,
  SalesScriptListResponse,
  // Slots API
  AddSlotDto,
  UpdateSlotDto,
  RenameSlotDto,
  SlotsListResponse,
  // Bindings
  ScriptBinding,
  CreateScriptBindingDto,
  UpdateScriptBindingDto,
  ScriptBindingsResponse,
} from './model/types';

// API
export {
  // Sales Scripts CRUD
  getSalesScripts,
  getSalesScript,
  createSalesScript,
  updateSalesScript,
  deleteSalesScript,
  // Constructor Schema
  getConstructorSchema,
  // Validation
  validateScriptDefinition,
  // Slots
  getScriptSlots,
  addSlot,
  updateSlot,
  deleteSlot,
  renameSlot,
  // Bindings
  createScriptBinding,
  getScriptBindings,
  getAdScriptBindings,
  updateScriptBinding,
  deleteScriptBinding,
} from './api';

// Store
export {
  useSalesScriptsStore,
  useSalesScriptsForTenant,
  useSalesScriptsLoading,
  useSalesScriptsError,
  useSalesScriptsActions,
} from './model/store';

// UI
export { SalesScriptCard } from './ui/SalesScriptCard';
