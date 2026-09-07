"use client";

import { PortalLayout, type NavItem } from "@/components/portal/portal-layout";
import { SignOutButton } from "@/components/sign-out-button";
import { useState, useEffect } from "react";
import {
  getLearners,
  addLearner,
  removeLearner,
  updateLearner,
  AVATAR_EMOJI,
  AVATAR_COLORS,
  AVATAR_KEYS,
  type Learner,
  type ECDLevel,
} from "@/lib/learner-store";

const TEACHER_NAV: NavItem[] = [
  { href: "/teach", label: "Dashboard", icon: "📊", description: "Class overview" },
  { href: "/teach/class", label: "My Class", icon: "🧒", description: "Roster & skills" },
  { href: "/teach/learners", label: "Manage Learners", icon: "👤", description: "Add & edit" },
  { href: "/teach/devices", label: "Devices", icon: "📱", description: "Set up tablets" },
  { href: "/teach/assign", label: "Assign Activities", icon: "📌", description: "Pick for class" },
  { href: "/teach/observations", label: "Observations", icon: "📝", description: "Record notes" },
  { href: "/teach/content", label: "Content Library", icon: "📚", description: "Activities" },
];

export default function ManageLearnersPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newAvatar, setNewAvatar] = useState("star");
  const [newLevel, setNewLevel] = useState<ECDLevel>("ECD_A");

  useEffect(() => {
    setLearners(getLearners());
    setLoaded(true);
  }, []);

  function resetForm() {
    setNewName("");
    setNewFullName("");
    setNewAvatar("star");
    setNewLevel("ECD_A");
    setShowAddForm(false);
    setEditingId(null);
  }

  function handleSave() {
    if (!newName.trim()) return;
    if (editingId) {
      const updated = updateLearner(editingId, {
        preferred_name: newName.trim(),
        first_name: newFullName.trim() || newName.trim(),
        avatar_key: newAvatar,
        ecd_level: newLevel,
      });
      if (updated) {
        setLearners(learners.map((l) => (l.id === editingId ? updated : l)));
      }
    } else {
      const learner = addLearner({
        preferred_name: newName.trim(),
        first_name: newFullName.trim() || newName.trim(),
        avatar_key: newAvatar,
        ecd_level: newLevel,
      });
      setLearners([...learners, learner]);
    }
    resetForm();
  }

  function handleEdit(learner: Learner) {
    setEditingId(learner.id);
    setNewName(learner.preferred_name);
    setNewFullName(learner.first_name);
    setNewAvatar(learner.avatar_key);
    setNewLevel(learner.ecd_level);
    setShowAddForm(true);
  }

  function handleRemove(id: string) {
    if (confirm("Remove this learner? Their progress data will remain but they will no longer appear in the class roster.")) {
      removeLearner(id);
      setLearners(learners.filter((l) => l.id !== id));
    }
  }

  if (!loaded) {
    return (
      <PortalLayout navItems={TEACHER_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #FF9F43, #FF6B35)" roleLabel="teacher" userName="Teacher">
        <div className="flex h-96 items-center justify-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#FF9F43]" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout navItems={TEACHER_NAV} brandLabel="Nenyere ECD" brandIcon="★" brandGradient="linear-gradient(135deg, #FF9F43, #FF6B35)" roleLabel="teacher" userName="Teacher">
      {/* Page header */}
      <div className="mb-6 rounded-2xl p-6 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #FF9F43, #FF6B35)" }}>
        <h1 className="text-2xl font-bold">Manage Learners 👤</h1>
        <p className="mt-1 text-white/80">Add, edit, and remove learners in your class — {learners.length} registered</p>
      </div>

      {/* Add button */}
      <div className="mb-6">
        <button
          onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          {showAddForm ? "Cancel" : "+ Add New Learner"}
        </button>
      </div>

      {/* Add/Edit form */}
      {showAddForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            {editingId ? "Edit Learner" : "Add New Learner"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Preferred Name (what they tap)</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Tari"
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#FF9F43] focus:ring-2 focus:ring-[#FF9F43]/20"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name (optional)</label>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="e.g. Tariro"
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#FF9F43] focus:ring-2 focus:ring-[#FF9F43]/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Class Level</label>
              <div className="mt-1 flex gap-3">
                {(["ECD_A", "ECD_B"] as ECDLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setNewLevel(level)}
                    className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-bold transition-all ${newLevel === level ? "border-[#FF9F43] bg-orange-50" : "border-slate-200"}`}
                  >
                    {level.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Pick an Avatar</label>
              <div className="mt-1 grid grid-cols-6 gap-2">
                {AVATAR_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => setNewAvatar(key)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition-all ${newAvatar === key ? "ring-4 ring-[#FF9F43]" : ""}`}
                    style={{ background: AVATAR_COLORS[key] }}
                  >
                    {AVATAR_EMOJI[key]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={!newName.trim()}
              className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 font-bold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50"
            >
              {editingId ? "Save Changes" : "Add Learner"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-6 py-2.5 font-medium text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Learner list */}
      {learners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <span className="text-5xl">🧒</span>
          <h2 className="mt-4 text-lg font-bold text-slate-700">No learners added yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            Add your first learner to get started. They will appear on the child devices automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {learners.map((learner) => {
            const gradient = AVATAR_COLORS[learner.avatar_key] ?? AVATAR_COLORS.star;
            return (
              <div key={learner.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-md"
                    style={{ background: gradient }}
                  >
                    {AVATAR_EMOJI[learner.avatar_key] ?? "⭐"}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{learner.preferred_name}</p>
                    {learner.first_name && learner.first_name !== learner.preferred_name && (
                      <p className="text-xs text-slate-500">{learner.first_name}</p>
                    )}
                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {learner.ecd_level.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(learner)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleRemove(learner.id)}
                    className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-right">
        <SignOutButton />
      </div>
    </PortalLayout>
  );
}
