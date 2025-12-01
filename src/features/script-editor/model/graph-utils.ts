import type { ScriptNode, ScriptFlowEdge } from './types';
import type { ScriptSlot, SlotType, QuestionBlockConfig } from '@/entities/sales-script';

/**
 * Interface for available slot with metadata
 */
export interface AvailableSlot {
  name: string;
  type: SlotType;
  description?: string;
  blockTitle: string; // Title of the QUESTION block
  templateSyntax: string; // e.g., "{{customer_name}}"
}

/**
 * Finds all nodes that are upstream (predecessors) of the target node
 * Uses BFS to traverse backwards through edges
 *
 * @param targetNodeId - The node ID to find upstream nodes for
 * @param nodes - All nodes in the graph
 * @param edges - All edges in the graph
 * @returns Array of upstream nodes
 */
export function getUpstreamNodes(
  targetNodeId: string,
  nodes: ScriptNode[],
  edges: ScriptFlowEdge[]
): ScriptNode[] {
  const visited = new Set<string>();
  const result: ScriptNode[] = [];
  const queue: string[] = [targetNodeId];

  visited.add(targetNodeId); // Don't include the target itself

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    // Find all edges pointing TO current node (incoming edges)
    const incomingEdges = edges.filter(edge => edge.target === currentId);

    for (const edge of incomingEdges) {
      if (!visited.has(edge.source)) {
        visited.add(edge.source);
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode) {
          result.push(sourceNode);
          queue.push(edge.source);
        }
      }
    }
  }

  return result;
}

/**
 * Gets available slots from upstream QUESTION blocks
 *
 * @param nodeId - The current node ID (MESSAGE block)
 * @param nodes - All nodes in the graph
 * @param edges - All edges in the graph
 * @param allSlots - All available slots in the script
 * @returns Array of available slots with metadata
 */
export function getAvailableSlotsForNode(
  nodeId: string,
  nodes: ScriptNode[],
  edges: ScriptFlowEdge[],
  allSlots: ScriptSlot[]
): AvailableSlot[] {
  const upstreamNodes = getUpstreamNodes(nodeId, nodes, edges);

  // Filter only QUESTION blocks
  const questionBlocks = upstreamNodes.filter(
    node => node.data.blockType === 'QUESTION'
  );

  // Extract slots from QUESTION blocks
  const availableSlots: AvailableSlot[] = [];
  const seenSlotNames = new Set<string>();

  for (const questionNode of questionBlocks) {
    const config = questionNode.data.config as QuestionBlockConfig;
    const slotName = config.slot;

    if (slotName && !seenSlotNames.has(slotName)) {
      seenSlotNames.add(slotName);

      // Find full slot info from allSlots
      const slotInfo = allSlots.find(s => s.name === slotName);
      if (slotInfo) {
        availableSlots.push({
          name: slotInfo.name,
          type: slotInfo.type,
          description: slotInfo.description,
          blockTitle: questionNode.data.title,
          templateSyntax: `{{${slotInfo.name}}}`,
        });
      }
    }
  }

  return availableSlots;
}
