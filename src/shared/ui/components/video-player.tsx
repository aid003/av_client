'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';

type VideoJsPlayer = ReturnType<typeof videojs>;

interface VideoJsPlayerProps {
  src: string;
  fallbackSrc?: string;
  className?: string;
}

export function VideoJsPlayer({ src, fallbackSrc, className }: VideoJsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackTried, setFallbackTried] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;

    const player = videojs(videoElement, {
      controls: true,
      responsive: true,
      fluid: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      sources: [
        {
          src: currentSrc,
          type: currentSrc.endsWith('.mp4') ? 'video/mp4' : 'video/quicktime',
        },
      ],
    });

    playerRef.current = player;

    // Обработка ошибок загрузки
    const handleError = () => {
      const error = player.error();
      if (error && fallbackSrc && !fallbackTried) {
        setFallbackTried(true);
        setCurrentSrc(fallbackSrc);
        player.src({
          src: fallbackSrc,
          type: fallbackSrc.endsWith('.mp4') ? 'video/mp4' : 'video/quicktime',
        });
        player.load();
      }
    };

    player.on('error', handleError);

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [currentSrc, fallbackSrc, fallbackTried]);

  return (
    <div className={className}>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        playsInline
      />
    </div>
  );
}
