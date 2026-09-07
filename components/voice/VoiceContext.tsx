"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface VoiceStatus {
  configured: boolean;
  voiceId: string;
  modelId: string;
  outputFormat: string;
  loading: boolean;
}

interface VoiceContextValue {
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  voiceStatus: VoiceStatus;
  refreshStatus: () => Promise<void>;
  currentlyPlayingId: string | null;
  setCurrentlyPlayingId: (id: string | null) => void;
  stopAllPlayback: () => void;
  registerStopCallback: (id: string, stopFn: () => void) => () => void;
}

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const stopCallbacksRef = useRef<Map<string, () => void>>(new Map());

  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>({
    configured: false,
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    modelId: "eleven_turbo_v2_5",
    outputFormat: "mp3_44100_128",
    loading: true,
  });

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/voice/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setVoiceStatus({
          configured: Boolean(data.configured),
          voiceId: data.voiceId || "21m00Tcm4TlvDq8ikWAM",
          modelId: data.modelId || "eleven_turbo_v2_5",
          outputFormat: data.outputFormat || "mp3_44100_128",
          loading: false,
        });
      } else {
        setVoiceStatus((prev) => ({ ...prev, configured: false, loading: false }));
      }
    } catch {
      setVoiceStatus((prev) => ({ ...prev, configured: false, loading: false }));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/voice/status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setVoiceStatus({
            configured: Boolean(data.configured),
            voiceId: data.voiceId || "21m00Tcm4TlvDq8ikWAM",
            modelId: data.modelId || "eleven_turbo_v2_5",
            outputFormat: data.outputFormat || "mp3_44100_128",
            loading: false,
          });
        } else {
          setVoiceStatus((prev) => ({ ...prev, configured: false, loading: false }));
        }
      })
      .catch(() => {
        if (isMounted) {
          setVoiceStatus((prev) => ({ ...prev, configured: false, loading: false }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stopAllPlayback = useCallback(() => {
    stopCallbacksRef.current.forEach((stopFn) => {
      try {
        stopFn();
      } catch {
        // noop
      }
    });
    setCurrentlyPlayingId(null);
  }, []);

  const registerStopCallback = useCallback((id: string, stopFn: () => void) => {
    stopCallbacksRef.current.set(id, stopFn);
    return () => {
      stopCallbacksRef.current.delete(id);
    };
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        voiceEnabled,
        setVoiceEnabled,
        playbackSpeed,
        setPlaybackSpeed,
        voiceStatus,
        refreshStatus,
        currentlyPlayingId,
        setCurrentlyPlayingId,
        stopAllPlayback,
        registerStopCallback,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice(): VoiceContextValue {
  const context = useContext(VoiceContext);
  if (!context) {
    // Fallback safe values if component is rendered outside provider
    return {
      voiceEnabled: true,
      setVoiceEnabled: () => {},
      playbackSpeed: 1.0,
      setPlaybackSpeed: () => {},
      voiceStatus: {
        configured: false,
        voiceId: "21m00Tcm4TlvDq8ikWAM",
        modelId: "eleven_turbo_v2_5",
        outputFormat: "mp3_44100_128",
        loading: false,
      },
      refreshStatus: async () => {},
      currentlyPlayingId: null,
      setCurrentlyPlayingId: () => {},
      stopAllPlayback: () => {},
      registerStopCallback: () => () => {},
    };
  }
  return context;
}
