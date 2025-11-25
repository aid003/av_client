// Типы для Telegram WebApp API
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openLink: (url: string) => void;
        ready: () => void;
        expand: () => void;
        close: () => void;
        readTextFromClipboard: (callback?: (text: string | null) => void) => void;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
  }
}

export {};

