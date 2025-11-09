import { useState } from "react";
import type { Filters } from "./types";

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({
    unreadOnly: false,
    sortBy: "lastSeenAt",
    sortOrder: "desc",
    search: "",
  });

  const updateFilter = <K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      unreadOnly: false,
      sortBy: "lastSeenAt",
      sortOrder: "desc",
      search: "",
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    setFilters,
  };
}

