"use client";

import { MessageSquare } from "lucide-react";

export function EmptyChatView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 overflow-x-hidden">
      <MessageSquare className="size-16 mb-4 opacity-20" />
      <h3 className="text-lg font-medium mb-2">Выберите диалог</h3>
      <p className="text-sm text-center">
        Выберите диалог из списка слева, чтобы начать просмотр сообщений
      </p>
    </div>
  );
}

