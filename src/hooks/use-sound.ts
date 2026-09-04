"use client";

import { useCallback, useEffect, useState } from "react";
import { getSoundEngine, type SoundName } from "@/lib/sound-manager";

export function useSound() {
  const engine = getSoundEngine();
  const [muted, setMuted] = useState(engine.muted);

  useEffect(() => {
    setMuted(engine.muted);
  }, [engine]);

  const unlock = useCallback(() => {
    engine.unlock();
  }, [engine]);

  const play = useCallback((sound: SoundName) => {
    engine.play(sound);
  }, [engine]);

  const toggleMute = useCallback(() => {
    engine.toggleMute();
    setMuted(engine.muted);
  }, [engine]);

  const startMusic = useCallback(() => {
    engine.startMusic();
  }, [engine]);

  const stopMusic = useCallback(() => {
    engine.stopMusic();
  }, [engine]);

  return { play, unlock, toggleMute, muted, startMusic, stopMusic };
}
