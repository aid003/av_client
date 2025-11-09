"use client";

import { useState } from "react";
import { addToBlacklist } from "@/entities/message";
import type { BlacklistUser, MessageError } from "@/entities/message";

export function useAddToBlacklist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAddToBlacklist = async (
    tenantId: string,
    accountId: string,
    users: BlacklistUser[],
    onSuccess?: () => void
  ) => {
    try {
      setLoading(true);
      setError(null);

      await addToBlacklist(tenantId, accountId, { users });

      setIsOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const error = err as MessageError;
      setError(
        error.message || "Не удалось добавить пользователя в черный список"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    handleAddToBlacklist,
    loading,
    error,
    isOpen,
    setIsOpen,
  };
}

