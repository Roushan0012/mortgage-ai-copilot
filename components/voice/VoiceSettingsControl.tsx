"use client";

import React, { useState } from "react";
import { Settings, Volume2 } from "lucide-react";
import { useVoice } from "./VoiceContext";
import { CopilotVoicePlayer } from "./CopilotVoicePlayer";
import { cn } from "@/lib/utils";

const SAFE_TEST_SENTENCE = "Your next recommended step is to confirm the required documents.";

export function VoiceSettingsControl({ className }: { className?: string }) {
  const {
    voiceEnabled,
    setVoiceEnabled,
    playbackSpeed,
    setPlaybackSpeed,
    voiceStatus,
  } = useVoice();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative inline-block text-left", className)}>
      {/* Global Status Pill & Settings Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Copilot Voice Settings"
        aria-expanded={isOpen}
        className="inline-flex items-center space-x-1.5 px-2 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full shrink-0",
            !voiceEnabled
              ? "bg-slate-500"
              : voiceStatus.configured
              ? "bg-emerald-400"
              : "bg-amber-400"
          )}
        />
        <span className="hidden sm:inline font-mono">
          {!voiceEnabled
            ? "Voice: Muted"
            : voiceStatus.configured
            ? "Voice ready"
            : "Voice: Offline fallback"}
        </span>
        <Settings className="h-3 w-3 text-slate-400 ml-0.5" />
      </button>

      {/* Settings Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white shadow-xl border border-slate-200 z-50 p-4 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-1.5">
              <Volume2 className="h-4 w-4 text-slate-700" />
              <span className="font-bold text-slate-900">Copilot Voice Settings</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Voice Status Indicator */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Provider Status:</span>
              <span
                className={cn(
                  "font-semibold flex items-center space-x-1",
                  voiceStatus.configured ? "text-emerald-700" : "text-amber-700"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    voiceStatus.configured ? "bg-emerald-500" : "bg-amber-500"
                  )}
                />
                <span>
                  {voiceStatus.configured
                    ? "Voice assistance ready"
                    : "Voice assistance unavailable"}
                </span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {voiceStatus.configured
                ? "ElevenLabs high-fidelity TTS streaming active."
                : "ElevenLabs API unconfigured. Browser speech fallback active."}
            </p>
          </div>

          {/* Enable / Disable Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="font-semibold text-slate-800 block">Spoken Copilot Audio</span>
              <span className="text-[10px] text-slate-500">Allow AI audio playback on cards</span>
            </div>
            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              aria-label={voiceEnabled ? "Disable voice assistance" : "Enable voice assistance"}
              className={cn(
                "relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-hidden",
                voiceEnabled ? "bg-emerald-600" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  voiceEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Playback Speed */}
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-800 block">Playback Speed</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[0.75, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackSpeed(speed)}
                  className={cn(
                    "py-1 text-center rounded font-medium text-xs transition-colors cursor-pointer border",
                    playbackSpeed === speed
                      ? "bg-slate-900 text-white border-slate-900 font-bold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                  )}
                >
                  {speed === 1.0 ? "1.0x (Normal)" : `${speed}x`}
                </button>
              ))}
            </div>
          </div>

          {/* Safe Test Voice Verification */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-700 block">Audio Verification:</span>
            <CopilotVoicePlayer
              text={SAFE_TEST_SENTENCE}
              label="Test Voice"
              variant="button"
              className="w-full justify-center bg-slate-100 hover:bg-slate-200 border-slate-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
