export interface Filters {
  accountId?: string;
  unreadOnly: boolean;
  sortBy: "lastSeenAt" | "createdAt";
  sortOrder: "asc" | "desc";
  search: string;
}

