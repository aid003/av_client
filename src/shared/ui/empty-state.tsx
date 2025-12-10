import { ReactNode } from 'react';
import { Card, CardContent } from './components/ui/card';

interface EmptyStateProps {
  /**
   * Иконка для отображения (SVG или React компонент)
   */
  icon?: ReactNode;
  /**
   * Заголовок пустого состояния
   */
  title: string;
  /**
   * Описание пустого состояния
   */
  description?: string;
  /**
   * Действие (например, кнопка)
   */
  action?: ReactNode;
  /**
   * Классы для контейнера
   */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center min-h-[250px] sm:min-h-[350px] md:min-h-[400px] px-4 ${className || ''}`}>
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6 text-center space-y-3 sm:space-y-4">
          {icon && (
            <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div className="space-y-1.5 sm:space-y-2">
            <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Готовые иконки для различных empty states
 */
export const EmptyStateIcons = {
  Plus: (
    <svg
      className="w-6 h-6 text-blue-600 dark:text-blue-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  ),
  Chat: (
    <svg
      className="w-6 h-6 text-blue-600 dark:text-blue-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  Document: (
    <svg
      className="w-6 h-6 text-blue-600 dark:text-blue-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  Search: (
    <svg
      className="w-6 h-6 text-blue-600 dark:text-blue-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Inbox: (
    <svg
      className="w-6 h-6 text-blue-600 dark:text-blue-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  ),
};
