"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardFooter,
} from "@/shared/ui/components/ui/card";
import { Badge } from "@/shared/ui/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/components/ui/avatar";
import { Progress } from "@/shared/ui/components/ui/progress";
import { DeleteAccountButton } from "@/features/delete-avito-account";
import { WebhookToggleButton } from "@/features/toggle-webhook";
import { useTelegramAuth } from "@/shared/hooks/useTelegramAuth";
import type { AvitoAccount } from "@/entities/avito";

interface AccountCardProps {
  account: AvitoAccount;
  onDelete?: () => void;
}

export function AccountCard({ account, onDelete }: AccountCardProps) {
  const { authData } = useTelegramAuth();
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
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="shrink-0">
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
        <CardAction className="shrink-0">
          <DeleteAccountButton
            accountId={account.id}
            accountLabel={account.label}
            onSuccess={onDelete}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4 min-w-0">
        <div className="min-w-0">
          <div className="text-sm font-medium mb-2">Области доступа</div>
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {scopes.map((scope, index) => (
              <Badge key={index} variant="secondary" className="max-w-full truncate">
                {scope}
              </Badge>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex justify-between items-center mb-2 gap-2">
            <div className="text-sm font-medium truncate">Время до истечения</div>
            <div className="text-xs text-muted-foreground shrink-0">
              {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 min-w-0">
          <div className="min-w-0">
            <div className="text-sm font-medium mb-1">Истекает</div>
            <div className="text-sm text-muted-foreground truncate">
              {new Date(account.expiresAt).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium mb-1">Создан</div>
            <div className="text-sm text-muted-foreground truncate">
              {new Date(account.createdAt).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </CardContent>
      {authData?.tenant?.id && (
        <CardFooter>
          <WebhookToggleButton
            tenantId={authData.tenant.id}
            accountId={account.id}
          />
        </CardFooter>
      )}
    </Card>
  );
}

