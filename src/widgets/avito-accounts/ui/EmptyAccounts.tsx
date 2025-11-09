"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/components/ui/card";
import { AddAccountButton } from "@/features/add-avito-account";

export function EmptyAccounts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Нет аккаунтов</CardTitle>
        <CardDescription>
          У вас пока нет привязанных аккаунтов Авито
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AddAccountButton />
      </CardContent>
    </Card>
  );
}

