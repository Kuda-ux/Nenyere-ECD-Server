"use client";

import { useState } from "react";
import { safeValidateActivity } from "@/engine/schema";
import type { AnyActivity } from "@/engine/schema";
import { ActivityRunner } from "@/engine";

const ACTIVITY_TYPES = [
  { value: "tap_correct", label: "Tap Correct (Choice)" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "matching", label: "Matching" },
  { value: "counting", label: "Counting" },
  { value: "sorting", label: "Sorting" },
  { value: "shape_matching", label: "Shape Matching" },
  { value: "shape_sorting", label: "Shape Sorting" },
  { value: "colour_identification", label: "Colour Identification" },
  { value: "colouring", label: "Colouring" },
  { value: "joining_dots", label: "Join the Dots" },
  { value: "tracing", label: "Tracing" },
  { value: "pattern_completion", label: "Pattern Completion" },
  { value: "spot_the_difference", label: "Spot the Difference" },
  { value: "puzzle", label: "Puzzle" },
  { value: "phonics_recognition", label: "Phonics Recognition" },
  { value: "sound_recognition", label: "Sound Recognition" },
  { value: "animal_sound_recognition", label: "Animal Sound Recognition" },
  { value: "story_interaction", label: "Story Interaction" },
  { value: "sequence_ordering", label: "Sequence Ordering" },
  { value: "classification", label: "Classification" },
  { value: "memory_game", label: "Memory Game" },
  { value: "pointing_target", label: "Pointing Target" },
  { value: "basic_addition", label: "Basic Addition" },
  { value: "basic_subtraction", label: "Basic Subtraction" },
  { value: "image_identification", label: "Image Identification" },
  { value: "audio_to_image", label: "Audio to Image" },
  { value: "image_to_audio", label: "Image to Audio" },
] as const;

const ECD_LEVELS = ["ECD_A", "ECD_B"] as const;
const DIFFICULTIES = ["easy", "standard", "stretch"] as const;
const LEARNING_AREAS = [
  { value: "mathematics", label: "Mathematics" },
  { value: "english_language", label: "English Language" },
  { value: "science_and_technology", label: "Science & Technology" },
  { value: "social_sciences", label: "Social Sciences" },
  { value: "physical_education_and_arts", label: "PE & Arts" },
] as const;

export function ActivityEditor({ activity }: { activity: AnyActivity | undefined }) {
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [savedStatus, setSavedStatus] = useState<"idle" | "saved" | "error">("idle");

  // Form state — derived from existing activity or defaults for new
  const [titleEn, setTitleEn] = useState(activity?.title.en ?? "");
  const [descriptionEn, setDescriptionEn] = useState(activity?.description?.en ?? "");
  const [type, setType] = useState(activity?.type ?? "tap_correct");
  const [ecdLevel, setEcdLevel] = useState(activity?.ecd_level ?? "ECD_A");
  const [difficulty, setDifficulty] = useState(activity?.difficulty ?? "easy");
  const [learningArea, setLearningArea] = useState(activity?.learning_area ?? "mathematics");
  const [instructionEn, setInstructionEn] = useState(activity?.instructions.text.en ?? "");
  const [instructionAudio, setInstructionAudio] = useState(activity?.instructions.audio?.en ?? "");
  const [duration, setDuration] = useState(activity?.estimated_duration_s ?? 60);

  function handleValidate() {
    // Build a minimal activity definition from form state
    const def = activity
      ? {
          ...activity,
          title: { en: titleEn },
          description: { en: descriptionEn },
          ecd_level: ecdLevel,
          difficulty,
          learning_area: learningArea,
          instructions: {
            ...activity.instructions,
            text: { en: instructionEn },
            audio: instructionAudio ? { en: instructionAudio } : activity.instructions.audio,
          },
          estimated_duration_s: duration,
        }
      : {
          id: crypto.randomUUID(),
          schema_version: 1,
          type,
          engine: "choice",
          title: { en: titleEn },
          description: { en: descriptionEn },
          ecd_level: ecdLevel,
          difficulty,
          learning_area: learningArea,
          skills: [],
          curriculum_refs: [],
          instructions: {
            text: { en: instructionEn },
            audio: instructionAudio ? { en: instructionAudio } : { en: "" },
            demo: "none" as const,
          },
          assets: [],
          language: "en",
          estimated_duration_s: duration,
          feedback: {
            correct: [{ text: { en: "Well done!" } }],
            encourage: [{ text: { en: "Try again!" } }],
            celebration: "stars" as const,
          },
          hints: {
            after_incorrect: 2,
            highlight_after: 3,
            show_demo: false,
          },
          tags: [],
          scoring: {
            method: "per_item" as const,
            star_bands: { one: 0, two: 0.6, three: 0.9 },
            count_hints_as_partial: false,
            max_attempts_per_item: null,
          },
          items: [],
          prompt: { text: { en: titleEn }, audio: { en: "" } },
          layout: "grid" as const,
          show_correct_after_attempts: 3,
        };

    const result = safeValidateActivity(def);
    if (result.success) {
      setValidationErrors([]);
      setSavedStatus("saved");
      setTimeout(() => setSavedStatus("idle"), 3000);
    } else {
      setValidationErrors(result.error?.issues.map((i) => `${i.path.join(".")}: ${i.message}`) ?? []);
      setSavedStatus("error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor form */}
      <div className="space-y-4 rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
        <h2 className="text-lg font-semibold">Activity Details</h2>

        <div>
          <label className="mb-1 block text-sm font-medium">Title (English)</label>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
            placeholder="e.g. Count the Circles"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description (English)</label>
          <textarea
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
            placeholder="Brief description of the activity"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Activity Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">ECD Level</label>
            <select
              value={ecdLevel}
              onChange={(e) => setEcdLevel(e.target.value as typeof ecdLevel)}
              className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
            >
              {ECD_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Learning Area</label>
            <select
              value={learningArea}
              onChange={(e) => setLearningArea(e.target.value as typeof learningArea)}
              className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
            >
              {LEARNING_AREAS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Instruction Text (English)</label>
          <input
            type="text"
            value={instructionEn}
            onChange={(e) => setInstructionEn(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
            placeholder="e.g. Tap the star!"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Instruction Audio URL</label>
          <input
            type="text"
            value={instructionAudio}
            onChange={(e) => setInstructionAudio(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
            placeholder="audio/instruction.mp3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Estimated Duration (seconds)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min={10}
            max={600}
            className="w-full rounded-lg border border-[var(--color-surface-2)] bg-white px-3 py-2 text-sm"
          />
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="mb-2 text-sm font-medium text-red-800">Validation Errors:</p>
            <ul className="list-inside list-disc text-xs text-red-700">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleValidate}
            className="rounded-xl bg-[var(--color-brand-sun)] px-4 py-2 font-bold text-white transition-all active:scale-95"
          >
            Validate
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-xl border border-[var(--color-surface-2)] bg-white px-4 py-2 font-bold text-[var(--color-ink-900)] transition-all active:scale-95"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          {savedStatus === "saved" && (
            <span className="text-sm font-medium text-[var(--color-brand-msasa)]">✓ Valid!</span>
          )}
          {savedStatus === "error" && (
            <span className="text-sm font-medium text-red-600">✗ Has errors</span>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Live Preview</h2>
          {showPreview && activity ? (
            <div className="overflow-hidden rounded-lg border border-[var(--color-surface-2)]">
              <div className="bg-[var(--color-surface-1)] p-4">
                <ActivityRunner
                  activity={activity}
                  onExit={() => setShowPreview(false)}
                  onComplete={() => setShowPreview(false)}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <span className="text-5xl" aria-hidden="true">🎯</span>
              <p className="text-sm text-ink-500">
                {activity
                  ? "Click \"Show Preview\" to test the activity in the ActivityRunner."
                  : "Save the activity first, then preview will be available."}
              </p>
            </div>
          )}
        </div>

        {/* Publishing workflow */}
        <div className="rounded-xl border border-[var(--color-surface-2)] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Publishing Workflow</h2>
          <div className="flex items-center gap-2">
            {["Draft", "Review", "Approved", "Published"].map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <div
                  className={`flex h-8 items-center rounded-full px-3 text-xs font-medium ${
                    i === 3
                      ? "bg-[var(--color-brand-msasa)] text-white"
                      : "bg-[var(--color-surface-1)] text-[var(--color-ink-500)]"
                  }`}
                >
                  {stage}
                </div>
                {i < 3 && <span className="text-[var(--color-ink-500)]">→</span>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-500">
            Activities must pass review before publishing. Published activities are available for assignment and offline download.
          </p>
        </div>
      </div>
    </div>
  );
}
