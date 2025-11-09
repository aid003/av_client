"use client";

import { Button } from "@/shared/ui/components/ui/button";
import { Loader2 } from "lucide-react";
import { useWebhookToggle } from "../model";
import { Alert, AlertDescription } from "@/shared/ui/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WebhookToggleButtonProps {
  tenantId: string;
  accountId: string;
}

export function WebhookToggleButton({
  tenantId,
  accountId,
}: WebhookToggleButtonProps) {
  const { isSubscribed, loading, error, toggling, handleToggle } =
    useWebhookToggle(tenantId, accountId);

  if (loading) {
    return (
      <Button disabled className="w-full" variant="outline">
        <Loader2 className="size-4 animate-spin" />
        Загрузка...
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
      <Button
        onClick={handleToggle}
        disabled={toggling}
        className="w-full"
        variant={isSubscribed ? "destructive" : "default"}
      >
        {toggling ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {isSubscribed ? "Отключение..." : "Включение..."}
          </>
        ) : (
          <>{isSubscribed ? "Отключить" : "Включить"}</>
        )}
      </Button>
    </div>
  );
}

