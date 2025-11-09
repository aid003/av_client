"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/components/ui/card";
import { Badge } from "@/shared/ui/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/ui/avatar";
import { Progress } from "@/shared/ui/components/ui/progress";
import type { AvitoAccount } from "@/entities/avito";

interface AccountCardProps {
  account: AvitoAccount;
}

export function AccountCard({ account }: AccountCardProps) {
  // Вычисляем прогресс до истечения токена
  const now = new Date().getTime();
  const expiresAt = new Date(account.expiresAt).getTime();
  const createdAt = new Date(account.createdAt).getTime();
  const totalTime = expiresAt - createdAt;
  const remainingTime = expiresAt - now;
  const progress = Math.max(0, Math.min(100, (remainingTime / totalTime) * 100));

  // Получаем инициалы из label
  const getInitials = (label: string): string => {
    const words = label.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return label.substring(0, 2).toUpperCase();
  };

  // Разбиваем scope на отдельные бейджи
  const scopes = account.scope.split(" ").filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" alt={account.label} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(account.label)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{account.label}</CardTitle>
            <CardDescription className="truncate">
              ID: {account.companyUserId}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Области доступа</div>
          <div className="flex flex-wrap gap-1.5">
            {scopes.map((scope, index) => (
              <Badge key={index} variant="secondary">
                {scope}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">Время до истечения</div>
            <div className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <div className="text-sm font-medium mb-1">Истекает</div>
            <div className="text-sm text-muted-foreground">
              {new Date(account.expiresAt).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Создан</div>
            <div className="text-sm text-muted-foreground">
              {new Date(account.createdAt).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

