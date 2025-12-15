'use client';

import { useEffect } from 'react';

/**
 * Provider для установки CSS-переменной --app-dvh
 * Использует visualViewport API для точного определения видимой высоты экрана
 * Особенно важно для iOS WebView, где адресная строка может скрываться/показываться
 */
export function ViewportUnitsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const updateViewportHeight = () => {
      // Используем visualViewport если доступен (более точный для мобильных)
      // Иначе fallback на innerHeight
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--app-dvh', `${height}px`);
    };

    // Устанавливаем начальное значение
    updateViewportHeight();

    // Подписываемся на изменения viewport
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener('resize', updateViewportHeight);
      visualViewport.addEventListener('scroll', updateViewportHeight);
    }

    // Fallback для браузеров без visualViewport
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    return () => {
      if (visualViewport) {
        visualViewport.removeEventListener('resize', updateViewportHeight);
        visualViewport.removeEventListener('scroll', updateViewportHeight);
      }
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  return <>{children}</>;
}

