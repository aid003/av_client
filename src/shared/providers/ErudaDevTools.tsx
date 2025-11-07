'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    eruda?: {
      init: () => void;
      destroy?: () => void;
    };
  }
}

export function ErudaDevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda@3.0.1/eruda.min.js';
    script.async = true;
    script.onload = () => {
      try { window.eruda?.init(); } catch { /* ignore */ }
    };
    document.body.appendChild(script);
    return () => {
      try {
        window.eruda?.destroy?.();
      } catch {
        // ignore
      }
      document.body.removeChild(script);
    };
  }, []);

  return null;
}


