"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSound } from "@/hooks/use-sound";
import {
  getLearners,
  addLearner,
  AVATAR_EMOJI,
  AVATAR_COLORS,
  AVATAR_KEYS,
  type Learner,
  type ECDLevel,
} from "@/lib/learner-store";

const FLOATING_DECORATIONS = [
  { emoji: "🌈", top: "8%", left: "5%", size: "3rem", anim: "anim-float-slow", delay: "anim-delay-2" },
  { emoji: "⭐", top: "15%", left: "88%", size: "2.5rem", anim: "anim-float", delay: "anim-delay-1" },
  { emoji: "🦋", top: "70%", left: "3%", size: "2.5rem", anim: "anim-float-slow", delay: "anim-delay-4" },
  { emoji: "🌸", top: "80%", left: "92%", size: "2rem", anim: "anim-float", delay: "anim-delay-3" },
  { emoji: "☁️", top: "25%", left: "75%", size: "3rem", anim: "anim-float-slow", delay: "anim-delay-5" },
  { emoji: "🎈", top: "60%", left: "85%", size: "2.5rem", anim: "anim-float", delay: "anim-delay-6" },
  { emoji: "🌟", top: "45%", left: "8%", size: "2rem", anim: "anim-wiggle", delay: "" },
  { emoji: "🎵", top: "85%", left: "45%", size: "2rem", anim: "anim-float", delay: "anim-delay-7" },
];

export function LearnerPicker() {
  const router = useRouter();
  const { play, unlock } = useSound();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newAvatar, setNewAvatar] = useState("star");
  const [newLevel, setNewLevel] = useState<ECDLevel>("ECD_A");

  if (!loaded) {
    setLearners(getLearners());
    setLoaded(true);
  }

  function handleSelect(learner: Learner) {
    unlock();
    play("pop");
    setTimeout(() => router.push(`/kids/dashboard?learner=${learner.id}`), 200);
  }

  function handleAddLearner() {
    if (!newName.trim()) return;
    const learner = addLearner({
      preferred_name: newName.trim(),
      first_name: newFullName.trim() || newName.trim(),
      avatar_key: newAvatar,
      ecd_level: newLevel,
    });
    setLearners([...learners, learner]);
    play("pop");
    setNewName("");
    setNewFullName("");
    setNewAvatar("star");
    setNewLevel("ECD_A");
    setShowAddForm(false);
  }

  return (
    <div className="kids-bg-playful relative flex w-full max-w-4xl flex-col items-center gap-8 overflow-hidden rounded-3xl p-8">
      {/* Floating decorations */}
      {FLOATING_DECORATIONS.map((dec, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute ${dec.anim} ${dec.delay}`}
          style={{ top: dec.top, left: dec.left, fontSize: dec.size, opacity: 0.6 }}
          aria-hidden="true"
        >
          {dec.emoji}
        </span>
      ))}

      {/* Mascot + greeting */}
      <div className="flex flex-col items-center gap-3 text-center anim-bounce-in">
        <div
          className="anim-float flex h-24 w-24 items-center justify-center rounded-full text-6xl shadow-lg"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
          aria-hidden="true"
        >
          🌟
        </div>
        <h1
          className="text-4xl font-bold text-[var(--color-ink-900)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Who are you?
        </h1>
        <p
          className="text-xl text-[var(--color-ink-500)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Tap your picture to start playing! 🎉
        </p>
      </div>

      {/* Avatar grid */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {learners.map((learner, i) => {
          const gradient = AVATAR_COLORS[learner.avatar_key] ?? AVATAR_COLORS.star;
          return (
            <button
              key={learner.id}
              onClick={() => handleSelect(learner)}
              className={`kids-card flex flex-col items-center gap-3 border-4 border-transparent p-6 anim-pop-in ${[`anim-delay-1`, `anim-delay-2`, `anim-delay-3`, `anim-delay-4`][i % 4]}`}
              style={{ minHeight: "180px", minWidth: "150px" }}
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-5xl shadow-md transition-transform hover:scale-110"
                style={{ background: gradient }}
                aria-hidden="true"
              >
                {AVATAR_EMOJI[learner.avatar_key] ?? "⭐"}
              </div>
              <span
                className="text-2xl font-bold text-[var(--color-ink-900)]"
                style={{ fontFamily: "var(--font-kids)" }}
              >
                {learner.preferred_name}
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: "var(--color-brand-jacaranda)" }}
              >
                {learner.ecd_level.replace("_", " ")}
              </span>
            </button>
          );
        })}

        {/* Add new pupil button */}
        <button
          onClick={() => { play("tap"); setShowAddForm(true); }}
          className="kids-card flex flex-col items-center justify-center gap-3 border-4 border-dashed p-6 anim-pop-in anim-delay-4"
          style={{ minHeight: "180px", minWidth: "150px", borderColor: "var(--color-brand-jacaranda)", opacity: 0.8 }}
        >
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-5xl shadow-md"
            style={{ background: "white" }}
            aria-hidden="true"
          >
            ➕
          </div>
          <span
            className="text-lg font-bold text-[var(--color-ink-500)]"
            style={{ fontFamily: "var(--font-kids)" }}
          >
            Add Pupil
          </span>
        </button>
      </div>

      {/* Add pupil form */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-white p-8 shadow-2xl anim-bounce-in"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "var(--font-kids)" }}
          >
            <h2 className="text-2xl font-bold text-[var(--color-ink-900)]">Add New Pupil 🌟</h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--color-ink-700)]">Name (what they tap)</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Tari"
                className="rounded-xl border-2 border-[var(--color-surface-2)] px-4 py-3 text-lg focus:border-[var(--color-brand-sun)] focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--color-ink-700)]">Full Name (optional)</label>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="e.g. Tariro"
                className="rounded-xl border-2 border-[var(--color-surface-2)] px-4 py-3 text-lg focus:border-[var(--color-brand-sun)] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--color-ink-700)]">Class Level</label>
              <div className="flex gap-3">
                {(["ECD_A", "ECD_B"] as ECDLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => { play("tap"); setNewLevel(level); }}
                    className={`flex-1 rounded-xl border-2 px-4 py-3 text-base font-bold transition-all ${newLevel === level ? "border-[var(--color-brand-sun)] bg-[var(--color-brand-sun)]/10" : "border-[var(--color-surface-2)]"}`}
                  >
                    {level.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--color-ink-700)]">Pick an avatar</label>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => { play("tap"); setNewAvatar(key); }}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all ${newAvatar === key ? "ring-4 ring-[var(--color-brand-sun)]" : ""}`}
                    style={{ background: AVATAR_COLORS[key] }}
                    aria-label={key}
                  >
                    {AVATAR_EMOJI[key]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddLearner}
                disabled={!newName.trim()}
                className="kids-btn flex-1 px-6 py-3 text-base text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #4CAF50, #00B894)" }}
              >
                ✓ Add Pupil
              </button>
              <button
                onClick={() => { play("tap"); setShowAddForm(false); }}
                className="kids-btn border-4 px-6 py-3 text-base text-[var(--color-ink-700)] shadow-md transition-all hover:scale-105"
                style={{ borderColor: "var(--color-surface-2)", backgroundColor: "white" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit gate */}
      <button
        className="kids-btn mt-4 text-base text-[var(--color-ink-500)] underline-offset-4 hover:underline"
        onClick={() => { play("tap"); router.push("/welcome"); }}
        style={{ fontFamily: "var(--font-kids)" }}
      >
        ← Exit Child Mode
      </button>
    </div>
  );
}
