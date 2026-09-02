/**
 * AudioManager — audio is a first-class modality for ECD.
 * Per docs/product-requirements.md §3: "Audio as a first-class modality with
 * gesture unlock" (browsers require user gesture before audio playback).
 * Per docs/design-system.md §2.4: "Every stimulus has alt text and audio."
 *
 * Features:
 * - Gesture unlock on first tap
 * - Single-instance playback (no overlapping sounds)
 * - Preload queue for activity assets
 * - Narration queue (sequential playback)
 * - Mute/unmute with persistence
 */
"use client";

import { useCallback, useEffect, useState } from "react";

type AudioState = "locked" | "ready" | "playing" | "paused";

class AudioEngine {
  private current: HTMLAudioElement | null = null;
  private queue: string[] = [];
  private preloaded = new Map<string, HTMLAudioElement>();
  private _muted = false;
  private _state: AudioState = "locked";
  private listeners = new Set<() => void>();

  get state() {
    return this._state;
  }

  get muted() {
    return this._muted;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private setState(state: AudioState) {
    this._state = state;
    this.notify();
  }

  /**
   * Unlock audio on first user gesture.
   * Call from a click/tap handler.
   */
  unlock() {
    if (this._state !== "locked") return;

    // Create a silent audio element and play it to unlock
    const silent = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=");
    silent.volume = 0;
    silent.play().then(() => {
      this.setState("ready");
    }).catch(() => {
      // Fallback: still set to ready, some browsers allow play on subsequent gestures
      this.setState("ready");
    });
  }

  /**
   * Preload an audio URL for instant playback.
   */
  preload(url: string) {
    if (this.preloaded.has(url)) return;
    const audio = new Audio(url);
    audio.preload = "auto";
    this.preloaded.set(url, audio);
  }

  /**
   * Preload multiple URLs.
   */
  preloadAll(urls: string[]) {
    urls.forEach((url) => this.preload(url));
  }

  /**
   * Play a single audio URL. Stops any currently playing audio.
   */
  async play(url: string): Promise<void> {
    if (this._muted) return;
    if (this._state === "locked") return;

    // Stop current
    this.stop();

    // Use preloaded element or create new
    let audio = this.preloaded.get(url);
    if (!audio) {
      audio = new Audio(url);
      this.preloaded.set(url, audio);
    }

    audio.currentTime = 0;
    audio.muted = this._muted;
    this.current = audio;
    this.setState("playing");

    try {
      await audio.play();
    } catch (err) {
      console.warn("AudioEngine: play failed", err);
      this.setState("ready");
    }

    audio.onended = () => {
      if (this.current === audio) {
        this.current = null;
        this.setState("ready");
      }
    };
  }

  /**
   * Queue multiple audio files to play sequentially.
   */
  async playQueue(urls: string[]): Promise<void> {
    this.queue = [...urls];
    await this.playNext();
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.setState("ready");
      return;
    }
    const url = this.queue.shift()!;
    await this.play(url);
    // play() sets onended which will trigger playNext via state change
    // We need to chain manually
    if (this.current) {
      this.current.onended = () => {
        this.current = null;
        this.playNext();
      };
    }
  }

  /**
   * Stop current playback and clear queue.
   */
  stop() {
    if (this.current) {
      this.current.pause();
      this.current.currentTime = 0;
      this.current = null;
    }
    this.queue = [];
    if (this._state === "playing") {
      this.setState("ready");
    }
  }

  /**
   * Toggle mute. Persists to localStorage.
   */
  toggleMute() {
    this._muted = !this._muted;
    if (this.current) {
      this.current.muted = this._muted;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("nenyere:audio-muted", String(this._muted));
    }
    this.notify();
  }

  /**
   * Initialize from localStorage.
   */
  init() {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("nenyere:audio-muted");
    if (stored === "true") {
      this._muted = true;
    }
  }
}

// Singleton instance
let engineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engineInstance) {
    engineInstance = new AudioEngine();
    engineInstance.init();
  }
  return engineInstance;
}

// ── React hook ──────────────────────────────────────────────────────────────
export function useAudio() {
  const engine = getAudioEngine();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = engine.subscribe(() => forceUpdate({}));
    return unsubscribe;
  }, [engine]);

  const unlock = useCallback(() => engine.unlock(), [engine]);
  const play = useCallback((url: string) => engine.play(url), [engine]);
  const playQueue = useCallback((urls: string[]) => engine.playQueue(urls), [engine]);
  const stop = useCallback(() => engine.stop(), [engine]);
  const preload = useCallback((urls: string[]) => engine.preloadAll(urls), [engine]);
  const toggleMute = useCallback(() => engine.toggleMute(), [engine]);

  return {
    state: engine.state,
    muted: engine.muted,
    unlock,
    play,
    playQueue,
    stop,
    preload,
    toggleMute,
  };
}
