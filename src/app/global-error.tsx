'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Проверяем, является ли ошибка связанной с multipart формами
  const isMultipartError =
    error.message?.includes('Malformed part header') ||
    error.message?.includes('Unexpected end of form') ||
    error.digest?.includes('Malformed') ||
    error.digest?.includes('Unexpected end');

  // Проверяем, является ли ошибка связанной с подозрительными запросами
  const isSecurityError =
    error.message?.includes('подозрительные') ||
    error.message?.includes('suspicious') ||
    error.message?.includes('Forbidden');

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        {isMultipartError && (
          <p style={{ color: 'orange' }}>
            Ошибка обработки формы. Пожалуйста, проверьте данные и попробуйте снова.
          </p>
        )}
        {isSecurityError && (
          <p style={{ color: 'red' }}>
            Запрос был заблокирован системой безопасности.
          </p>
        )}
        {!isMultipartError && !isSecurityError && (
          <p>Произошла непредвиденная ошибка.</p>
        )}
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
