'use client';

import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { SettingsSidebar } from '@/widgets/settings-sidebar';
import { SettingsContent } from '@/widgets/settings-content';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { useUserSettingsStore } from '@/entities/user-settings';
import { Button } from '@/shared/ui/components/ui/button';
import { ChevronLeft, Palette, Bell } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  icon: typeof Palette;
}

const categories: Category[] = [
  { id: 'appearance', label: 'Внешний вид', icon: Palette },
  { id: 'notifications', label: 'Уведомления', icon: Bell },
];

export default function SettingsPage() {
  const { authData, isLoading, isAuthenticated } = useTelegramAuth();
  const [activeCategory, setActiveCategory] = useState<string>('appearance');
  const [showCategoryContent, setShowCategoryContent] = useState(false);
  const isMobile = useIsMobile();
  const { fetchSettings } = useUserSettingsStore();

  const tenantId = authData?.tenant.id;

  // Загрузить настройки при монтировании
  useEffect(() => {
    if (tenantId) {
      fetchSettings(tenantId);
    }
  }, [tenantId, fetchSettings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4" />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !authData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600">Необходима авторизация</p>
        </div>
      </div>
    );
  }

  // Mobile: список категорий или содержимое категории
  if (isMobile) {
    if (!showCategoryContent) {
      return (
        <div className="h-[calc(var(--app-dvh,100dvh)-3rem)] overflow-y-auto p-4 space-y-4">
          <h1 className="text-2xl font-bold">Настройки</h1>
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => {
                    setActiveCategory(category.id);
                    setShowCategoryContent(true);
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-base">{category.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      );
    } else {
      return (
        <div className="h-[calc(var(--app-dvh,100dvh)-3rem)] overflow-y-auto p-4 space-y-4">
          <Button
            variant="ghost"
            className="gap-2 px-0"
            onClick={() => setShowCategoryContent(false)}
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>
          <SettingsContent category={activeCategory} tenantId={tenantId!} />
        </div>
      );
    }
  }

  // Desktop: двухколоночный layout
  return (
    <div className="h-[calc(var(--app-dvh,100dvh)-3rem)] flex overflow-hidden">
      {/* Левая панель с категориями */}
      <div className="w-64 border-r flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Настройки</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <SettingsSidebar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </div>

      {/* Правая панель с настройками */}
      <div className="flex-1 overflow-y-auto p-8">
        <SettingsContent category={activeCategory} tenantId={tenantId!} />
      </div>
    </div>
  );
}
