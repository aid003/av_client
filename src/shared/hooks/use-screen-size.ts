import { useState, useEffect } from 'react';

interface ScreenSize {
  width: number;
  height: number;
  isPortrait: boolean;
  isSmallScreen: boolean;
}

const SMALL_SCREEN_BREAKPOINT = 768;

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isPortrait: typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false,
    isSmallScreen: typeof window !== 'undefined' ? window.innerWidth < SMALL_SCREEN_BREAKPOINT : false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({
        width,
        height,
        isPortrait: height > width,
        isSmallScreen: width < SMALL_SCREEN_BREAKPOINT,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return screenSize;
}
