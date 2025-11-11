"use client";

import { SearchInput } from "@/features/search-conversations";
import type { Filters } from "@/features/conversation-filters";

interface ChatListHeaderProps {
  filters: Filters;
  onSearchChange: (value: string) => void;
  totalConversations: number;
}

export function ChatListHeader({
  filters,
  onSearchChange,
  totalConversations,
}: ChatListHeaderProps) {
  return (
    <div className="p-4 border-b space-y-3 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Диалоги</h2>
        <div className="text-sm text-muted-foreground">
          {totalConversations}
        </div>
      </div>
      <SearchInput value={filters.search} onChange={onSearchChange} />
    </div>
  );
}

