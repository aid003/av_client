"use client";

import { useState } from "react";
import { useTelegramAuth } from "@/shared/hooks/useTelegramAuth";
import { deleteAvitoAccount } from "@/entities/avito";
import type { DeleteAccountError } from "@/entities/avito";

export function useDeleteAccount(onSuccess?: () => void) {
  const { authData } = useTelegramAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (accountId: string) => {
    if (!authData?.tenant?.id) {
      setError("Тенант не найден");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await deleteAvitoAccount(authData.tenant.id, accountId);

      // Закрываем диалог после успешного удаления
      setOpen(false);

      // Вызываем callback для обновления списка
      onSuccess?.();
    } catch (err) {
      const error = err as DeleteAccountError;
      setError(error.message || "Ошибка при удалении аккаунта");
    } finally {
      setLoading(false);
    }
  };

  return {
    open,
    setOpen,
    loading,
    error,
    setError,
    handleDelete,
  };
}

