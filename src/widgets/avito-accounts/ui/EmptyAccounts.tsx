"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/components/ui/card";

export function EmptyAccounts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Нет аккаунтов</CardTitle>
        <CardDescription>
          У вас пока нет привязанных аккаунтов Авито
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

