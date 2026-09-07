"use client";

import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import { Volume2, VolumeX, Square, Loader2, AlertCircle } from "lucide-react";
import { useVoice } from "./VoiceContext";
import { normalizeVoiceText } from "@/lib/voice/config";
import { cn } from "@/lib/utils";

// Lightweight bounded client-side audio cache (max 20 items)
interface CacheEntry {
  objectUrl: string;
  timestamp: number;
}
const audioBlobCache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 20;

function getCachedAudio(key: string): string | null {
  const entry = audioBlobCache.get(key);
  if (entry) {
    entry.timestamp = Date.now();
    return entry.objectUrl;
  }
  return null;
}

function setCachedAudio(key: string, objectUrl: string) {
  if (audioBlobCache.size >= MAX_CACHE_ENTRIES) {
    // Evict oldest
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [k, v] of audioBlobCache.entries()) {
      if (v.timestamp < oldestTime) {
        oldestTime = v.timestamp;
        oldestKey = k;
      }
    }
    if (oldestKey) {
      const oldEntry = audioBlobCache.get(oldestKey);
      if (oldEntry) {
        try {
          URL.revokeObjectURL(oldEntry.objectUrl);
        } catch {
          // noop
        }
      }
      audioBlobCache.delete(oldestKey);
    }
  }
  audioBlobCache.set(key, { objectUrl, timestamp: Date.now() });
}

export type PlayerState = "idle" | "loading" | "speaking" | "paused" | "error";

export interface CopilotVoicePlayerProps {
  text: string;
  label?: string;
  variant?: "button" | "inline" | "compact" | "icon";
  className?: string;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  onError?: (errorMessage: string) => void;
  disabled?: boolean;
}

export function CopilotVoicePlayer({
  text,
  label = "Play Suggestion",
  variant = "button",
  className,
  onPlaybackStart,
  onPlaybackEnd,
  onError,
  disabled = false,
}: CopilotVoicePlayerProps) {
  const {
    voiceEnabled,
    playbackSpeed,
    setCurrentlyPlayingId,
    registerStopCallback,
    stopAllPlayback,
  } = useVoice();

  const generatedId = useId();
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFallbackSpeech, setIsFallbackSpeech] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerIdRef = useRef<string>(generatedId);

  const stopAudio = useCallback(() => {
    // 1. Stop HTML5 audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // 2. Stop browser speech synthesis if active
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayerState("idle");
    setIsFallbackSpeech(false);
  }, []);

  // Register this player's stop method with the global voice context
  useEffect(() => {
    const unregister = registerStopCallback(playerIdRef.current, stopAudio);
    return () => {
      unregister();
      stopAudio();
    };
  }, [registerStopCallback, stopAudio]);

  // Sync playback speed if audio is playing
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handlePlay = async () => {
    if (disabled || !voiceEnabled) return;

    // Toggle stop if already speaking
    if (playerState === "speaking") {
      stopAudio();
      setCurrentlyPlayingId(null);
      if (onPlaybackEnd) onPlaybackEnd();
      return;
    }

    // Resume if paused
    if (playerState === "paused" && audioRef.current) {
      audioRef.current.play();
      setPlayerState("speaking");
      setCurrentlyPlayingId(playerIdRef.current);
      return;
    }

    const cleanText = normalizeVoiceText(text);
    if (!cleanText) {
      setErrorMessage("No speakable text found.");
      setPlayerState("error");
      return;
    }

    // Stop any other audio currently playing
    stopAllPlayback();

    setPlayerState("loading");
    setErrorMessage(null);
    setCurrentlyPlayingId(playerIdRef.current);

    // Check client audio cache
    const cacheKey = `rachel_${cleanText}`;
    const cachedUrl = getCachedAudio(cacheKey);

    if (cachedUrl) {
      playAudioBlob(cachedUrl);
      return;
    }

    // Fetch streaming audio from our secure server route
    try {
      const response = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          context: "copilot",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            "Voice assistance is temporarily unavailable. You can still use the text suggestion."
        );
      }

      const audioBlob = await response.blob();
      const objectUrl = URL.createObjectURL(audioBlob);
      setCachedAudio(cacheKey, objectUrl);
      playAudioBlob(objectUrl);
    } catch (err: unknown) {
      // Graceful fallback to browser speech synthesis
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        playBrowserSpeechFallback(cleanText);
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Voice assistance is temporarily unavailable. You can still use the text suggestion.";
        setErrorMessage(msg);
        setPlayerState("error");
        setCurrentlyPlayingId(null);
        if (onError) onError(msg);
        // Clear error after 5s
        setTimeout(() => setPlayerState("idle"), 5000);
      }
    }
  };

  const playAudioBlob = (url: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = url;
    audio.playbackRate = playbackSpeed;

    audio.onplay = () => {
      setPlayerState("speaking");
      if (onPlaybackStart) onPlaybackStart();
    };

    audio.onended = () => {
      setPlayerState("idle");
      setCurrentlyPlayingId(null);
      if (onPlaybackEnd) onPlaybackEnd();
    };

    audio.onerror = () => {
      setErrorMessage("Audio playback failed. Please try again.");
      setPlayerState("error");
      setCurrentlyPlayingId(null);
      setTimeout(() => setPlayerState("idle"), 4000);
    };

    audio.play().catch(() => {
      setPlayerState("idle");
      setCurrentlyPlayingId(null);
    });
  };

  const playBrowserSpeechFallback = (cleanText: string) => {
    setIsFallbackSpeech(true);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setPlayerState("speaking");
      if (onPlaybackStart) onPlaybackStart();
    };

    utterance.onend = () => {
      setPlayerState("idle");
      setIsFallbackSpeech(false);
      setCurrentlyPlayingId(null);
      if (onPlaybackEnd) onPlaybackEnd();
    };

    utterance.onerror = () => {
      setPlayerState("idle");
      setIsFallbackSpeech(false);
      setCurrentlyPlayingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!voiceEnabled) {
    return (
      <button
        type="button"
        disabled
        title="Voice assistance is disabled in meeting settings"
        aria-label="Voice assistance is disabled"
        className={cn(
          "inline-flex items-center text-slate-400 cursor-not-allowed opacity-60 text-xs px-2 py-1 rounded border border-slate-200 bg-slate-50",
          className
        )}
      >
        <VolumeX className="h-3.5 w-3.5 mr-1" />
        <span className="text-[11px]">Voice Off</span>
      </button>
    );
  }

  // Visual feedback states
  if (playerState === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-xs",
          className
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin text-amber-600 shrink-0" />
        <span className="text-[11px]">◐ Preparing voice…</span>
      </div>
    );
  }

  if (playerState === "speaking") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn("inline-flex items-center space-x-1.5", className)}
      >
        <button
          type="button"
          onClick={handlePlay}
          aria-label="Stop AI voice playback"
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden"
        >
          <Square className="h-3 w-3 fill-current" />
          <span>Stop</span>
        </button>
        <div className="flex items-center space-x-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          <span className="flex space-x-0.5 items-end h-3">
            <span className="w-0.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            <span className="w-0.5 h-3 bg-rose-600 rounded-full animate-pulse delay-75" />
            <span className="w-0.5 h-2 bg-rose-500 rounded-full animate-pulse delay-150" />
          </span>
          <span>{isFallbackSpeech ? "Speaking (Browser)" : "Speaking…"}</span>
        </div>
      </div>
    );
  }

  if (playerState === "error") {
    return (
      <div
        role="alert"
        className={cn(
          "inline-flex items-center space-x-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200",
          className
        )}
        title={errorMessage || "Voice unavailable"}
      >
        <AlertCircle className="h-3 w-3 text-amber-600 shrink-0" />
        <span className="truncate max-w-[180px]">Voice offline (text only)</span>
      </div>
    );
  }

  // Idle State
  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={disabled}
      aria-label={`Play AI suggested response: ${label}`}
      className={cn(
        "inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all duration-150 cursor-pointer shadow-xs",
        variant === "button" &&
          "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-hidden",
        variant === "inline" &&
          "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-2 py-0.5 border border-transparent hover:border-slate-200",
        variant === "compact" &&
          "bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] px-2 py-0.5 border border-slate-200",
        variant === "icon" &&
          "p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Volume2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
