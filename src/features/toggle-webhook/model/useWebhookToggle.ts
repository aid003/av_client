"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getWebhookSubscriptions,
  subscribeWebhook,
  unsubscribeWebhook,
} from "@/entities/avito";
import type { WebhookError } from "@/entities/avito";

export function useWebhookToggle(tenantId: string, accountId: string) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const checkSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getWebhookSubscriptions(tenantId, accountId);
      setIsSubscribed(response.subscriptions.length > 0);
    } catch (err) {
      const error = err as WebhookError;
      setError(error.message || "Ошибка при проверке статуса webhook");
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [tenantId, accountId]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const handleToggle = async () => {
    try {
      setToggling(true);
      setError(null);

      if (isSubscribed) {
        await unsubscribeWebhook(tenantId, accountId);
        setIsSubscribed(false);
      } else {
        await subscribeWebhook(tenantId, accountId);
        setIsSubscribed(true);
      }
    } catch (err) {
      const error = err as WebhookError;
      setError(
        error.message ||
          `Ошибка при ${isSubscribed ? "отключении" : "включении"} webhook`
      );
    } finally {
      setToggling(false);
    }
  };

  return {
    isSubscribed,
    loading,
    error,
    toggling,
    handleToggle,
    refetch: checkSubscription,
  };
}

