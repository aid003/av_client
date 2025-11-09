"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/shared/ui/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface VoicePlayerProps {
  voiceUrl: string;
  className?: string;
}

export function VoicePlayer({ voiceUrl, className }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <audio ref={audioRef} src={voiceUrl} preload="metadata" />
      
      <Button
        onClick={togglePlay}
        size="sm"
        variant="ghost"
        className="size-8 p-0 shrink-0"
      >
        {isPlaying ? (
          <Pause className="size-4" />
        ) : (
          <Play className="size-4" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Volume2 className="size-3 text-muted-foreground shrink-0" />
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}

