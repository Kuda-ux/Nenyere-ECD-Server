/**
 * useActivityRunner — React hook wrapping the runner state machine.
 * Manages phase transitions, audio cues, and response collection.
 */
"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import {
  createRunnerState,
  runnerReducer,
} from "./state-machine";
import type { AnyActivity } from "../schema";
import type { ItemResponse, ItemResult } from "../schema/common";
import { useAudio } from "../audio/audio-manager";

export function useActivityRunner(activity: AnyActivity) {
  const [state, dispatch] = useReducer(runnerReducer, activity, createRunnerState);
  const audio = useAudio();
  const startTimeRef = useRef<number>(Date.now());

  // Preload activity audio assets on mount
  useEffect(() => {
    const urls: string[] = [];
    // Instructions audio
    if (activity.instructions.audio) {
      urls.push(activity.instructions.audio.en);
    }
    // Feedback audio
    for (const f of activity.feedback.correct) {
      if (f.audio) urls.push(f.audio.en);
    }
    for (const f of activity.feedback.encourage) {
      if (f.audio) urls.push(f.audio.en);
    }
    // Engine-specific audio
    if ("prompt" in activity && activity.prompt?.audio) {
      urls.push(activity.prompt.audio.en);
    }
    if ("pages" in activity) {
      for (const page of activity.pages) {
        if (page.narration) urls.push(page.narration.en);
      }
    }
    if (urls.length > 0) {
      audio.preload(urls);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity]);

  // Play audio on phase changes
  useEffect(() => {
    if (state.phase === "instruction") {
      if (activity.instructions.audio) {
        audio.play(activity.instructions.audio.en);
      }
    } else if (state.phase === "feedback") {
      if (state.lastResult?.is_correct) {
        const correct = activity.feedback.correct;
        const pick = correct[Math.floor(Math.random() * correct.length)];
        if (pick.audio) {
          audio.play(pick.audio.en);
        }
      } else if (state.lastResult) {
        const encourage = activity.feedback.encourage;
        const pick = encourage[Math.floor(Math.random() * encourage.length)];
        if (pick.audio) {
          audio.play(pick.audio.en);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    audio.unlock();
    dispatch({ type: "START" });
  }, [audio]);

  const instructionDone = useCallback(() => {
    dispatch({ type: "INSTRUCTION_DONE" });
  }, []);

  const submitResponse = useCallback(
    (response: ItemResponse, result: ItemResult) => {
      dispatch({ type: "ITEM_RESPONSE", response, result });
    },
    [],
  );

  const skipItem = useCallback(() => {
    dispatch({ type: "ITEM_SKIP" });
  }, []);

  const requestHint = useCallback(() => {
    dispatch({ type: "HINT_REQUESTED" });
  }, []);

  const feedbackDone = useCallback(() => {
    dispatch({ type: "FEEDBACK_DONE" });
  }, []);

  const finish = useCallback(() => {
    dispatch({ type: "FINISH" });
  }, []);

  const exit = useCallback(() => {
    audio.stop();
    dispatch({ type: "EXIT" });
  }, [audio]);

  return {
    state,
    start,
    instructionDone,
    submitResponse,
    skipItem,
    requestHint,
    feedbackDone,
    finish,
    exit,
    audio,
  };
}
