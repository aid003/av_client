"use client";

import { useEffect, useState, useCallback } from "react";
import { useTelegramAuth } from "@/shared/hooks/useTelegramAuth";
import { getAvitoAccounts } from "@/entities/avito";
import type { AvitoAccount, AvitoAccountsError } from "@/entities/avito";

export function useAvitoAccounts() {
  const { authData } = useTelegramAuth();
  const [accounts, setAccounts] = useState<AvitoAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!authData?.tenant?.id) {
      setError("Тенант не найден");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getAvitoAccounts(authData.tenant.id);
      setAccounts(data.accounts);
      setTotal(data.total);
    } catch (err) {
      const error = err as AvitoAccountsError;
      setError(error.message || "Произошла ошибка при загрузке аккаунтов");
    } finally {
      setLoading(false);
    }
  }, [authData?.tenant?.id]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, total, loading, error, refetch: fetchAccounts };
}

