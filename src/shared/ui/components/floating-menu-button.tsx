'use client';

import { PanelLeft } from 'lucide-react';
import { useSidebar } from '@/shared/ui/components/ui/sidebar';

export function FloatingMenuButton() {
  const { toggleSidebar, openMobile } = useSidebar();

  // Скрываем только когда мобильный сайдбар открыт
  // CSS (@media) скроет кнопку на десктопе
  if (openMobile) {
    return null;
  }

  return (
    <button
      onClick={toggleSidebar}
      className="floating-menu-button fixed z-[9999] size-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center transition-transform active:scale-95"
      style={{
        bottom: 'max(1.25rem, calc(1.25rem + env(safe-area-inset-bottom, 0px)))',
        left: '1rem',
      }}
      aria-label="Открыть меню"
    >
      <PanelLeft className="size-6" />
    </button>
  );
}
