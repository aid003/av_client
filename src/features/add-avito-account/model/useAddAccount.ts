"use client";

import { useState } from "react";
import { useTelegramAuth } from "@/shared/hooks/useTelegramAuth";
import { generateAuthUrl } from "../api";
import { DEFAULT_SCOPES } from "../lib";
import type { AuthUrlError } from "./types";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
      };
    };
  }
}

export function useAddAccount() {
  const { authData } = useTelegramAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("Основной аккаунт");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(DEFAULT_SCOPES);

  const handleSubmit = async () => {
    if (!authData?.tenant?.id) {
      setError("Тенант не найден");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await generateAuthUrl({
        tenantId: authData.tenant.id,
        scopes: selectedScopes.join(","),
        redirectAfter: "https://intimgeometry.ru/",
        mode: "createOrUpdate",
        label,
      });

      // Открываем URL через Telegram WebApp API
      if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(response.authUrl, {
          try_instant_view: false,
        });
      } else {
        // Fallback для обычного браузера
        window.open(response.authUrl, "_blank");
      }

      // Закрываем диалог после успешного открытия ссылки
      setOpen(false);
      
      // Сбрасываем форму
      setLabel("Основной аккаунт");
      setSelectedScopes(DEFAULT_SCOPES);
    } catch (err) {
      const error = err as AuthUrlError;
      setError(error.message || "Ошибка при создании URL авторизации");
    } finally {
      setLoading(false);
    }
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope)
        ? prev.filter((s) => s !== scope)
        : [...prev, scope]
    );
  };

  return {
    open,
    setOpen,
    loading,
    error,
    label,
    setLabel,
    selectedScopes,
    toggleScope,
    handleSubmit,
  };
}

