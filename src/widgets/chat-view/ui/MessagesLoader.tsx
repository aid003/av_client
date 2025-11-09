"use client";

import { Skeleton } from "@/shared/ui/components/ui/skeleton";

export function MessagesLoader() {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`flex gap-2 ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
        >
          {i % 2 !== 0 && <Skeleton className="size-8 rounded-full shrink-0" />}
          <div className="space-y-2 max-w-[70%]">
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

