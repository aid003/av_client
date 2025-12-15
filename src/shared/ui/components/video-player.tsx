'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import videojs from 'video.js';

type VideoJsPlayer = ReturnType<typeof videojs>;

interface VideoJsPlayerProps {
  src: string;
  fallbackSrc?: string;
  className?: string;
}

type FullscreenMode = 'none' | 'native' | 'webkit' | 'pseudo';

// Регистрируем компонент кнопки fullscreen один раз на модуль.
// Кнопка вызывает коллбеки, которые мы кладём в player._avFullscreenApi.
const VJS_FULLSCREEN_BUTTON_NAME = 'AvFullscreenButton';
if (typeof window !== 'undefined') {
  const Existing = (videojs as any).getComponent?.(VJS_FULLSCREEN_BUTTON_NAME);
  if (!Existing) {
    const Button = videojs.getComponent('Button');

    class AvFullscreenButton extends Button {
      constructor(player: any, options: any) {
        super(player, options);
        this.controlText('Полный экран');
        this.addClass('vjs-fullscreen-control');
        this.addClass('vjs-icon-fullscreen-enter');
      }

      handleClick() {
        const player: any = this.player();
        const api = player?._avFullscreenApi;
        if (!api) return;

        const mode: FullscreenMode = api.getMode();
        if (mode !== 'none') {
          api.exit();
        } else {
          api.enter();
        }
      }

      updateForState(isFs: boolean) {
        if (isFs) {
          this.controlText('Выйти из полного экрана');
          this.removeClass('vjs-icon-fullscreen-enter');
          this.addClass('vjs-icon-fullscreen-exit');
        } else {
          this.controlText('Полный экран');
          this.removeClass('vjs-icon-fullscreen-exit');
          this.addClass('vjs-icon-fullscreen-enter');
        }
      }
    }

    videojs.registerComponent(VJS_FULLSCREEN_BUTTON_NAME, AvFullscreenButton as any);
  }
}

export function VideoJsPlayer({ src, fallbackSrc, className }: VideoJsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);
  const initRafRef = useRef<number | undefined>(undefined);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackTried, setFallbackTried] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackSrcRef = useRef(fallbackSrc);
  const fallbackTriedRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenModeRef = useRef<FullscreenMode>('none');

  // Синхронизируем src prop с currentSrc state
  useEffect(() => {
    if (src !== currentSrc && !fallbackTriedRef.current) {
      setCurrentSrc(src);
    }
  }, [src, currentSrc]);

  // Обновляем ref при изменении fallbackSrc
  useEffect(() => {
    fallbackSrcRef.current = fallbackSrc;
  }, [fallbackSrc]);

  // Обновляем ref при изменении fallbackTried
  useEffect(() => {
    fallbackTriedRef.current = fallbackTried;
  }, [fallbackTried]);

  // Функция для входа в fullscreen
  const enterFullscreen = useCallback(async () => {
    const videoElement = videoRef.current;
    const container = containerRef.current;
    if (!videoElement || !container) return;

    // Защита от повторного входа (используем только ref для надежности)
    if (fullscreenModeRef.current !== 'none') {
      return;
    }

    try {
      // Попытка 1: iOS webkitEnterFullscreen (только для video элемента)
      if (typeof (videoElement as any).webkitEnterFullscreen === 'function') {
        try {
          // Убеждаемся, что видео готово и подключено к DOM
          if (videoElement.readyState >= 2) {
            // Вызываем синхронно из user gesture
            (videoElement as any).webkitEnterFullscreen();
            fullscreenModeRef.current = 'webkit';
            setIsFullscreen(true);
            return;
          } else {
            // Пытаемся "прогреть" видео
            await videoElement.play();
            await new Promise(resolve => setTimeout(resolve, 100));
            if (videoElement.readyState >= 2) {
              (videoElement as any).webkitEnterFullscreen();
              fullscreenModeRef.current = 'webkit';
              setIsFullscreen(true);
              return;
            }
          }
        } catch (error) {
          // InvalidStateError или другая ошибка - переходим к следующему методу
          console.warn('webkitEnterFullscreen failed, trying fallback:', error);
        }
      }

      // Попытка 2: Стандартный Fullscreen API
      if (document.documentElement.requestFullscreen) {
        try {
          await container.requestFullscreen();
          fullscreenModeRef.current = 'native';
          setIsFullscreen(true);
          return;
        } catch (error) {
          console.warn('requestFullscreen failed, trying pseudo-fullscreen:', error);
        }
      }

      // Попытка 3: Псевдо-fullscreen (fallback)
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.right = '0';
      container.style.bottom = '0';
      container.style.width = '100vw';
      container.style.height = 'var(--app-dvh, 100dvh)';
      container.style.zIndex = '9999';
      container.style.backgroundColor = '#000';
      container.style.margin = '0';
      container.style.padding = '0';
      
      // Блокируем прокрутку страницы
      document.body.style.overflow = 'hidden';
      
      fullscreenModeRef.current = 'pseudo';
      setIsFullscreen(true);
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, []);

  // Функция для выхода из fullscreen
  const exitFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      const mode = fullscreenModeRef.current;

      if (mode === 'webkit') {
        // Для webkit fullscreen выход происходит автоматически при нажатии пользователя
        // Но можем попробовать программно
        if (document.exitFullscreen) {
          try {
            await document.exitFullscreen();
          } catch (e) {
            // Игнорируем ошибки
          }
        }
      } else if (mode === 'native') {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } else if (mode === 'pseudo') {
        // Восстанавливаем стили контейнера
        container.style.position = '';
        container.style.top = '';
        container.style.left = '';
        container.style.right = '';
        container.style.bottom = '';
        container.style.width = '';
        container.style.height = '';
        container.style.zIndex = '';
        container.style.backgroundColor = '';
        container.style.margin = '';
        container.style.padding = '';
        
        // Разблокируем прокрутку
        document.body.style.overflow = '';
      }

      fullscreenModeRef.current = 'none';
      setIsFullscreen(false);
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
      // Принудительно сбрасываем состояние
      fullscreenModeRef.current = 'none';
      setIsFullscreen(false);
      if (container) {
        container.style.position = '';
        container.style.top = '';
        container.style.left = '';
        container.style.right = '';
        container.style.bottom = '';
        container.style.width = '';
        container.style.height = '';
        container.style.zIndex = '';
        container.style.backgroundColor = '';
        container.style.margin = '';
        container.style.padding = '';
        document.body.style.overflow = '';
      }
    }
  }, []);

  // Инициализация плеера (только один раз)
  useEffect(() => {
    let cancelled = false;

    const tryInit = () => {
      if (cancelled) return;

      const videoElement = videoRef.current;
      if (!videoElement || !videoElement.isConnected || !videoElement.parentElement) {
        initRafRef.current = requestAnimationFrame(tryInit);
        return;
      }

      // Проверяем, не был ли элемент уже инициализирован video.js
      if (videojs.getPlayer(videoElement)) {
        return;
      }

      const player = videojs(videoElement, {
        controls: true,
        responsive: false,
        fluid: false,
        controlBar: {
          // Отключаем PiP toggle, если video.js его добавляет
          pictureInPictureToggle: false,
        },
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        sources: [
          {
            src: currentSrc,
            type: currentSrc.endsWith('.mp4') ? 'video/mp4' : 'video/quicktime',
          },
        ],
      });

      // Отключаем стандартную кнопку fullscreen в video.js
      const fullscreenToggle = player.controlBar.getChild('fullscreenToggle');
      if (fullscreenToggle) {
        player.controlBar.removeChild(fullscreenToggle);
      }

      // На всякий случай удаляем PiP toggle, если он уже добавлен
      const pipToggle = player.controlBar.getChild('pictureInPictureToggle');
      if (pipToggle) {
        player.controlBar.removeChild(pipToggle);
      }

      // Отключаем PiP на уровне HTMLVideoElement (если поддерживается браузером)
      try {
        (videoElement as any).disablePictureInPicture = true;
      } catch {
        // ignore
      }

      // Настраиваем размеры плеера для заполнения контейнера
      if (containerRef.current) {
        const container = containerRef.current;
        const updateSize = () => {
          if (container && videoElement) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            player.width(width);
            player.height(height);
          }
        };
        updateSize();
        
        // Обновляем размеры при изменении контейнера
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(container);
        
        // Сохраняем observer для очистки
        (player as any)._resizeObserver = resizeObserver;
      }

      playerRef.current = player;

      // Прокидываем API для кастомной кнопки fullscreen в controlBar
      (player as any)._avFullscreenApi = {
        enter: () => enterFullscreen(),
        exit: () => exitFullscreen(),
        getMode: () => fullscreenModeRef.current,
      };

      // Вставляем кнопку fullscreen в нижнюю панель справа от скорости
      try {
        const controlBar = player.controlBar;
        const btn = controlBar.addChild(VJS_FULLSCREEN_BUTTON_NAME, {}) as any;
        (player as any)._avFullscreenButton = btn;

        const rateBtn =
          controlBar.getChild('playbackRateMenuButton') ||
          controlBar.getChild('PlaybackRateMenuButton');

        const barEl = controlBar.el();
        if (rateBtn && rateBtn.el && rateBtn.el()) {
          const next = rateBtn.el().nextSibling;
          if (next) barEl.insertBefore(btn.el(), next);
          else barEl.appendChild(btn.el());
        } else {
          barEl.appendChild(btn.el());
        }
      } catch {
        // если что-то пошло не так, просто не добавляем кнопку
      }

      // Обработка ошибок загрузки
      const handleError = () => {
        const error = player.error();
        if (error && fallbackSrcRef.current && !fallbackTriedRef.current) {
          fallbackTriedRef.current = true;
          setFallbackTried(true);
          setCurrentSrc(fallbackSrcRef.current);
          player.src({
            src: fallbackSrcRef.current,
            type: fallbackSrcRef.current.endsWith('.mp4') ? 'video/mp4' : 'video/quicktime',
          });
          player.load();
        }
      };

      player.on('error', handleError);

      // Обработчики событий fullscreen для синхронизации состояния
      const handleFullscreenChange = () => {
        const isNativeFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );

        if (!isNativeFullscreen && (fullscreenModeRef.current === 'native' || fullscreenModeRef.current === 'webkit')) {
          // Пользователь вышел из fullscreen через системную кнопку
          fullscreenModeRef.current = 'none';
          setIsFullscreen(false);
          if (containerRef.current) {
            const container = containerRef.current;
            container.style.position = '';
            container.style.top = '';
            container.style.left = '';
            container.style.right = '';
            container.style.bottom = '';
            container.style.width = '';
            container.style.height = '';
            container.style.zIndex = '';
            container.style.backgroundColor = '';
            container.style.margin = '';
            container.style.padding = '';
            document.body.style.overflow = '';
          }
        }
      };

      // iOS webkit события
      const handleWebkitBeginFullscreen = () => {
        fullscreenModeRef.current = 'webkit';
        setIsFullscreen(true);
      };

      const handleWebkitEndFullscreen = () => {
        fullscreenModeRef.current = 'none';
        setIsFullscreen(false);
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
      
      videoElement.addEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen);
      videoElement.addEventListener('webkitendfullscreen', handleWebkitEndFullscreen);

      // Сохраняем обработчики для очистки
      (player as any)._fullscreenHandlers = {
        fullscreenchange: handleFullscreenChange,
        webkitfullscreenchange: handleFullscreenChange,
        mozfullscreenchange: handleFullscreenChange,
        MSFullscreenChange: handleFullscreenChange,
        webkitbeginfullscreen: handleWebkitBeginFullscreen,
        webkitendfullscreen: handleWebkitEndFullscreen,
      };
    };

    initRafRef.current = requestAnimationFrame(tryInit);

    return () => {
      cancelled = true;
      if (initRafRef.current) {
        cancelAnimationFrame(initRafRef.current);
      }
      if (playerRef.current) {
        try {
          const videoElement = videoRef.current;
          // Проверяем, что плеер еще существует перед dispose
          if (videoElement) {
            const existingPlayer = videojs.getPlayer(videoElement);
            if (existingPlayer) {
              // Очищаем обработчики событий
              const handlers = (existingPlayer as any)._fullscreenHandlers;
              if (handlers) {
                document.removeEventListener('fullscreenchange', handlers.fullscreenchange);
                document.removeEventListener('webkitfullscreenchange', handlers.webkitfullscreenchange);
                document.removeEventListener('mozfullscreenchange', handlers.mozfullscreenchange);
                document.removeEventListener('MSFullscreenChange', handlers.MSFullscreenChange);
                videoElement.removeEventListener('webkitbeginfullscreen', handlers.webkitbeginfullscreen);
                videoElement.removeEventListener('webkitendfullscreen', handlers.webkitendfullscreen);
              }

              // Очищаем ResizeObserver если был создан
              const resizeObserver = (existingPlayer as any)._resizeObserver;
              if (resizeObserver) {
                resizeObserver.disconnect();
              }
              existingPlayer.dispose();
            }
          }
        } catch (e) {
          // Игнорируем ошибки при dispose в Strict Mode
        }
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Инициализация только один раз

  // Синхронизируем состояние кнопки в controlBar (иконка/текст)
  useEffect(() => {
    const player: any = playerRef.current;
    if (!player) return;
    const btn: any = player._avFullscreenButton;
    if (btn && typeof btn.updateForState === 'function') {
      btn.updateForState(isFullscreen);
    }
  }, [isFullscreen]);

  // Обновление источника при изменении currentSrc (но только если плеер уже инициализирован)
  useEffect(() => {
    if (!playerRef.current || !videoRef.current) return;
    
    const existingPlayer = videojs.getPlayer(videoRef.current);
    if (!existingPlayer) return; // Плеер еще не инициализирован

    const player = playerRef.current;
    player.src({
      src: currentSrc,
      type: currentSrc.endsWith('.mp4') ? 'video/mp4' : 'video/quicktime',
    });
    player.load();
  }, [currentSrc]);

  // Обработка клавиши Escape для выхода из псевдо-fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && fullscreenModeRef.current === 'pseudo') {
        exitFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`${className ?? ''} relative`}
      style={{ width: '100%', height: '100%', minHeight: 0 }}
    >
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered video-player-contain"
        playsInline
        // Стараемся выключить PiP в браузерах, где это возможно
        disablePictureInPicture
        controlsList="nodownload noremoteplayback noplaybackrate"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
