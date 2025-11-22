import { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';

interface ErrorAlertProps {
  /**
   * Сообщение об ошибке
   */
  error: string | Error | null | undefined;
  /**
   * Заголовок (опционально)
   */
  title?: string;
  /**
   * Действие для исправления (например, кнопка "Попробовать снова")
   */
  action?: ReactNode;
  /**
   * Дополнительные классы
   */
  className?: string;
  /**
   * Вариант отображения
   */
  variant?: 'default' | 'destructive';
}

export function ErrorAlert({
  error,
  title = 'Ошибка',
  action,
  className,
  variant = 'destructive',
}: ErrorAlertProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message || 'Произошла неизвестная ошибка';

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <Alert variant={variant}>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription className="flex items-start justify-between gap-4">
          <span className="flex-1">{errorMessage}</span>
          {action && <div className="flex-shrink-0">{action}</div>}
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * ErrorBoundary Fallback компонент
 */
interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Что-то пошло не так</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>{error.message}</p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">
                    Показать детали (dev mode)
                  </summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap break-words">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
        {resetError && (
          <div className="flex justify-center">
            <button
              onClick={resetError}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Попробовать снова
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
