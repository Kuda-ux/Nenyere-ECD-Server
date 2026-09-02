/**
 * Domain types — derived from docs/database.md schema.
 * These mirror the PostgreSQL enums and table structures.
 */

// ── Enums ──────────────────────────────────────────────────────────────

export type AppRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "TEACHER"
  | "CONTENT_EDITOR"
  | "CLASSROOM_DEVICE";

export type EcdLevel = "ECD_A" | "ECD_B";

export type ContentStatus =
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "archived";

export type MasteryStage =
  | "not_started"
  | "introduced"
  | "practising"
  | "developing"
  | "secure";

export type LearnerStatus = "active" | "inactive" | "withdrawn";

export type ConsentStatus = "pending" | "granted" | "withdrawn";

export type ConsentMethod = "paper_on_file" | "digital";

export type ActivityType =
  | "matching"
  | "drag_and_drop"
  | "tap_correct"
  | "multiple_choice"
  | "counting"
  | "sorting"
  | "shape_matching"
  | "shape_sorting"
  | "colour_identification"
  | "colouring"
  | "joining_dots"
  | "tracing"
  | "pattern_completion"
  | "spot_the_difference"
  | "puzzle"
  | "phonics_recognition"
  | "sound_recognition"
  | "animal_sound_recognition"
  | "story_interaction"
  | "sequence_ordering"
  | "classification"
  | "memory_game"
  | "pointing_target"
  | "basic_addition"
  | "basic_subtraction"
  | "image_identification"
  | "audio_to_image"
  | "image_to_audio";

export type Engine =
  | "choice"
  | "match"
  | "drag-sort"
  | "counting"
  | "trace"
  | "join-dots"
  | "colouring"
  | "sequence"
  | "memory"
  | "puzzle"
  | "spot-difference"
  | "story";

export type LearningAreaKey =
  | "english_language"
  | "indigenous_language"
  | "mathematics"
  | "science_and_technology"
  | "social_sciences"
  | "physical_education_and_arts";

export type Locale = "en" | "sn" | "nd";

export type Difficulty = "easy" | "standard" | "stretch";

export type AttemptStatus = "completed" | "abandoned";

export type MediaKind = "image" | "audio" | "svg";

export type ValidationStatus = "verified" | "validation_required";

// ── Localised text ─────────────────────────────────────────────────────

export type LocalizedText = {
  en: string;
  sn?: string;
  nd?: string;
};

export type LocalizedAssetRef = {
  en: string;
  sn?: string;
  nd?: string;
};

// ── Entity types (matching DB rows) ────────────────────────────────────

export type School = {
  id: string;
  name: string;
  slug: string;
  locale_default: Locale;
  timezone: string;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  display_name: string;
  locale: Locale;
  created_at: string;
};

export type Membership = {
  id: string;
  user_id: string;
  school_id: string;
  role: AppRole;
  class_ids: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Class = {
  id: string;
  school_id: string;
  name: string;
  ecd_level: EcdLevel;
  academic_year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Learner = {
  id: string;
  school_id: string;
  first_name: string;
  preferred_name: string | null;
  birth_month: string;
  ecd_level: EcdLevel;
  avatar_key: string;
  picture_pin: string[] | null;
  status: LearnerStatus;
  consent_status: ConsentStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Enrollment = {
  id: string;
  school_id: string;
  learner_id: string;
  class_id: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
};

export type ConsentRecord = {
  id: string;
  school_id: string;
  learner_id: string;
  guardian_name: string;
  relationship: string;
  method: ConsentMethod;
  granted_at: string;
  withdrawn_at: string | null;
  recorded_by: string;
  notes: string | null;
  created_at: string;
};

export type Activity = {
  id: string;
  school_id: string | null;
  type: ActivityType;
  current_version_id: string | null;
  status: ContentStatus;
  created_by: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityVersion = {
  id: string;
  activity_id: string;
  version: number;
  schema_version: number;
  definition: Record<string, unknown>;
  ecd_level: EcdLevel;
  learning_area: LearningAreaKey;
  status: ContentStatus;
  review_notes: string | null;
  reviewed_by: string | null;
  approved_by: string | null;
  published_by: string | null;
  published_at: string | null;
  created_at: string;
};

export type Attempt = {
  id: string;
  school_id: string;
  learner_id: string;
  activity_version_id: string;
  assignment_id: string | null;
  client_attempt_id: string;
  device_id: string;
  actor_user_id: string;
  started_at: string;
  completed_at: string | null;
  status: AttemptStatus;
  accuracy: number;
  stars: number;
  duration_ms: number;
  hints_used: number;
  items_total: number;
  items_correct: number;
  client_meta: Record<string, unknown>;
  created_at: string;
};

export type SkillMastery = {
  school_id: string;
  learner_id: string;
  skill_id: string;
  stage: MasteryStage;
  evidence: Record<string, unknown>;
  last_evidence_at: string;
  overridden_by: string | null;
  override_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type TeacherObservation = {
  id: string;
  school_id: string;
  learner_id: string;
  author_id: string;
  skill_id: string | null;
  development_area: string | null;
  text: string;
  recommended_activity_id: string | null;
  observed_at: string;
  created_at: string;
};

// ── JWT claims (from custom access token hook) ─────────────────────────

export type AppJwtClaims = {
  app_role: AppRole;
  school_id: string | null;
  class_ids: string[] | null;
};
