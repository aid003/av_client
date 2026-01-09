"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  init,
  initData,
  retrieveLaunchParams,
  themeParams,
  viewport,
} from "@tma.js/sdk-react";

interface TelegramContextValue {
  isInitialized: boolean;
  initData: string | null;
  colorScheme: "light" | "dark";
  isViewportMounted: boolean;
  isFullscreen: boolean;
}

const TelegramContext = createContext<TelegramContextValue>({
  isInitialized: false,
  initData: null,
  colorScheme: "dark",
  isViewportMounted: false,
  isFullscreen: false,
});

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error(
      "useTelegram должен использоваться внутри TelegramProvider"
    );
  }
  return context;
}

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [rawInitData, setRawInitData] = useState<string | null>(null);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("dark");
  const [isViewportMounted, setIsViewportMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    try {
      // ВАЖНО: Инициализируем весь SDK
      init();

      // Восстанавливаем состояние initData
      initData.restore();

      // Получаем raw строку initData основным способом
      const raw = initData.raw();
      // Резервный способ через retrieveLaunchParams (по документации)
      const lp = retrieveLaunchParams();
      const fallbackRaw = lp.initDataRaw;

      if (process.env.NODE_ENV === "development") {
        // Минимальная информация в dev
        // eslint-disable-next-line no-console
        console.log(
          "SDK initialized, initData present:",
          Boolean(raw ?? fallbackRaw)
        );
      }

      const effectiveRaw =
        raw ?? (typeof fallbackRaw === "string" ? fallbackRaw : null);
      if (effectiveRaw) {
        setRawInitData(effectiveRaw);
      } else {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn("initData is empty");
        }
      }

      // Получаем тему из Telegram
      try {
        // Проверяем isDark или используем fallback
        // @ts-ignore - themeParams type from Telegram SDK is incomplete
        const isDark = themeParams?.isDark?.() ?? lp.themeParams?.isDark ?? true;
        const scheme = isDark ? "dark" : "light";
        setColorScheme(scheme);

        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.log("Telegram colorScheme:", scheme);
        }
      } catch (themeError) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn(
            "Failed to get theme, using dark as default:",
            themeError
          );
        }
        setColorScheme("dark");
      }

      setIsInitialized(true);

      // Монтируем viewport и переходим в полноэкранный режим
      const mountViewport = async () => {
        try {
          // Монтируем viewport
          await viewport.mount();
          setIsViewportMounted(true);

          if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.log("Viewport mounted successfully");
          }

          // После успешного монтирования переходим в fullscreen
          await viewport.requestFullscreen();
          setIsFullscreen(true);

          if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.log("Fullscreen mode activated");
          }
        } catch (viewportError) {
          if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.warn(
              "Viewport mount/fullscreen error (may be unsupported):",
              viewportError
            );
          }
          // Приложение продолжает работать без fullscreen
        }
      };

      mountViewport();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("SDK init error:", error);
      }
      setIsInitialized(true);
    }
  }, []);

  // Подписываемся на изменения темы в Telegram
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    try {
      // Проверяем, есть ли метод addEventListener у themeParams
      if (typeof themeParams === "object" && themeParams !== null) {
        const handleThemeChange = () => {
          try {
            const newScheme = (themeParams as any).colorScheme?.() ?? "dark";
            setColorScheme(newScheme);

            if (process.env.NODE_ENV === "development") {
              // eslint-disable-next-line no-console
              console.log("Telegram theme changed to:", newScheme);
            }
          } catch (err) {
            if (process.env.NODE_ENV === "development") {
              // eslint-disable-next-line no-console
              console.error("Failed to get updated colorScheme:", err);
            }
          }
        };

        // Пробуем разные API для подписки
        if ("on" in themeParams && typeof themeParams.on === "function") {
          const cleanup = themeParams.on("change", handleThemeChange);
          return cleanup;
        } else if (
          "addEventListener" in themeParams &&
          typeof themeParams.addEventListener === "function"
        ) {
          themeParams.addEventListener("change", handleThemeChange);
          return () => {
            if (
              "removeEventListener" in themeParams &&
              typeof themeParams.removeEventListener === "function"
            ) {
              themeParams.removeEventListener("change", handleThemeChange);
            }
          };
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("Theme change subscription not available:", error);
      }
    }
  }, [isInitialized]);

  return (
    <TelegramContext.Provider
      value={{ 
        isInitialized, 
        initData: rawInitData, 
        colorScheme,
        isViewportMounted,
        isFullscreen
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}
