"use client";

import { Skeleton } from "@/shared/ui/components/ui/skeleton";

export function ChatListLoader() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex gap-3 p-3 border-b">
          <Skeleton className="size-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

