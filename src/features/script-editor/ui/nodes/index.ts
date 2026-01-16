import type { NodeTypes } from '@xyflow/react';
import { StartNode } from './StartNode';
import { EndNode } from './EndNode';
import { MessageNode } from './MessageNode';
import { QuestionNode } from './QuestionNode';
import { RouterNode } from './RouterNode';
import { MultiRouterNode } from './MultiRouterNode';
import { LLMReplyNode } from './LLMReplyNode';

export { BaseNode } from './BaseNode';
export { StartNode } from './StartNode';
export { EndNode } from './EndNode';
export { MessageNode } from './MessageNode';
export { QuestionNode } from './QuestionNode';
export { RouterNode } from './RouterNode';
export { MultiRouterNode } from './MultiRouterNode';
export { LLMReplyNode } from './LLMReplyNode';

/**
 * Маппинг типов блоков на компоненты React Flow
 */
export const nodeTypes: NodeTypes = {
  START: StartNode,
  END: EndNode,
  MESSAGE: MessageNode,
  QUESTION: QuestionNode,
  ROUTER: RouterNode,
  MULTI_ROUTER: MultiRouterNode,
  LLM_REPLY: LLMReplyNode,
};
