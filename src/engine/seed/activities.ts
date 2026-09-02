/**
 * Seed activities for the Nenyere ECD platform.
 * Per docs/curriculum-map.md — covers all learning areas and activity types.
 *
 * Activities use placeholder asset paths (to be replaced with real media).
 * All activities pass Zod validation via validateActivity().
 */
import type { AnyActivity } from "../schema";

// ── Shared constants ────────────────────────────────────────────────────────

const FEEDBACK = {
  correct: [
    { text: { en: "Well done!", sn: "Wakaita zvakanaka!", nd: "Wakangwara!" } },
    { text: { en: "You found it!", sn: "Wakawana!", nd: "Wathola!" } },
    { text: { en: "Excellent!", sn: "Zvakanaka!", nd: "Zwakanaka!" } },
  ],
  encourage: [
    { text: { en: "Let's try again.", sn: "Tiyedze zvakare.", nd: "Ake tinze khonjo." } },
    { text: { en: "Good try!", sn: "Kuedza kwakanaka!", nd: "Kuyedza kwakanaka!" } },
  ],
  celebration: "stars" as const,
};

const HINTS = { after_incorrect: 2, highlight_after: 3, show_demo: false };

const SKILL = {
  counting_1_5: "00000000-0000-0000-0000-000000000001",
  shape_circle: "00000000-0000-0000-0000-000000000002",
  colour_red: "00000000-0000-0000-0000-000000000003",
  sort_colour: "00000000-0000-0000-0000-000000000004",
  animal_identify: "00000000-0000-0000-0000-000000000005",
  phonics_a: "00000000-0000-0000-0000-000000000006",
  trace_line: "00000000-0000-0000-0000-000000000007",
  body_parts: "00000000-0000-0000-0000-000000000008",
  family_members: "00000000-0000-0000-0000-000000000009",
  weather: "00000000-0000-0000-0000-00000000000a",
  transport: "00000000-0000-0000-0000-00000000000b",
  matching: "00000000-0000-0000-0000-00000000000c",
  memory: "00000000-0000-0000-0000-00000000000d",
  story: "00000000-0000-0000-0000-00000000000e",
  hygiene: "00000000-0000-0000-0000-00000000000f",
  food_sort: "00000000-0000-0000-0000-000000000010",
  pattern: "00000000-0000-0000-0000-000000000011",
  addition_5: "00000000-0000-0000-0000-000000000012",
  subtraction_5: "00000000-0000-0000-0000-000000000013",
  shape_sort: "00000000-0000-0000-0000-000000000014",
  colour_identify: "00000000-0000-0000-0000-000000000015",
  community_helpers: "00000000-0000-0000-0000-000000000018",
  instrument_sound: "00000000-0000-0000-0000-000000000019",
};

function base(id: string, type: string, engine: string, title: string, opts: {
  ecd_level?: string;
  difficulty?: string;
  learning_area: string;
  skills: string[];
  description?: string;
  scoring_method?: string;
  duration?: number;
}) {
  return {
    id,
    schema_version: 1,
    type,
    engine,
    title: { en: title },
    description: opts.description ? { en: opts.description } : undefined,
    ecd_level: opts.ecd_level ?? "ECD_A",
    difficulty: opts.difficulty ?? "easy",
    learning_area: opts.learning_area,
    skills: opts.skills,
    curriculum_refs: [],
    instructions: { text: { en: "Listen and play!" }, audio: { en: "audio/instructions.mp3" }, demo: "none" },
    assets: [],
    language: "en",
    estimated_duration_s: opts.duration ?? 60,
    feedback: FEEDBACK,
    scoring: {
      method: opts.scoring_method ?? "per_item",
      star_bands: { one: 0, two: 0.6, three: 0.9 },
      count_hints_as_partial: false,
      max_attempts_per_item: null,
    },
    hints: HINTS,
    tags: [],
  };
}

// ── MATHEMATICS ─────────────────────────────────────────────────────────────

export const seedActivities: AnyActivity[] = [
  {
    ...base("00000000-0000-0000-0001-000000000001", "counting", "counting", "Count the Stars", {
      learning_area: "mathematics", skills: [SKILL.counting_1_5], description: "Count stars from 1 to 5",
    }),
    items: [{ id: "item-1", objects: { shape: "star", colour: "#F2A93B", count: 3, arrangement: "row" }, options: [2, 3, 4], correct_answer: 3 }],
    tap_to_count: true, show_number_line: true,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0001-000000000002", "counting", "counting", "Count the Circles", {
      learning_area: "mathematics", skills: [SKILL.counting_1_5], description: "Count circles from 1 to 5",
    }),
    items: [{ id: "item-1", objects: { shape: "circle", colour: "#E85D5D", count: 5, arrangement: "grid" }, options: [3, 4, 5], correct_answer: 5 }],
    tap_to_count: true, show_number_line: true,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0001-000000000003", "shape_matching", "match", "Match the Shapes", {
      learning_area: "mathematics", skills: [SKILL.shape_circle], description: "Match shapes that look the same",
    }),
    pairs: [
      { id: "p1", left: { shape: "circle" }, right: { shape: "circle" } },
      { id: "p2", left: { shape: "square" }, right: { shape: "square" } },
      { id: "p3", left: { shape: "triangle" }, right: { shape: "triangle" } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0001-000000000004", "shape_sorting", "drag-sort", "Sort the Shapes", {
      learning_area: "mathematics", skills: [SKILL.shape_sort], description: "Put shapes in the right boxes",
    }),
    slots: [
      { id: "s-circle", label: { en: "Circles" }, accepts_item_ids: ["it1", "it3"] },
      { id: "s-square", label: { en: "Squares" }, accepts_item_ids: ["it2", "it4"] },
    ],
    items: [
      { id: "it1", shape: "circle", colour: "#E85D5D", correct_slot_id: "s-circle" },
      { id: "it2", shape: "square", colour: "#5BA85B", correct_slot_id: "s-square" },
      { id: "it3", shape: "circle", colour: "#3B7DD8", correct_slot_id: "s-circle" },
      { id: "it4", shape: "square", colour: "#F2A93B", correct_slot_id: "s-square" },
    ],
    layout: "bins",
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0001-000000000005", "colour_identification", "match", "Match Colours", {
      learning_area: "mathematics", skills: [SKILL.colour_identify], description: "Match colours that are the same",
    }),
    pairs: [
      { id: "p1", left: { colour: "#E85D5D" }, right: { colour: "#E85D5D" } },
      { id: "p2", left: { colour: "#5BA85B" }, right: { colour: "#5BA85B" } },
      { id: "p3", left: { colour: "#3B7DD8" }, right: { colour: "#3B7DD8" } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0001-000000000006", "sorting", "drag-sort", "Sort by Colour", {
      learning_area: "mathematics", skills: [SKILL.sort_colour], description: "Sort objects by colour",
    }),
    slots: [
      { id: "s-red", label: { en: "Red" }, accepts_item_ids: ["it1", "it3"] },
      { id: "s-green", label: { en: "Green" }, accepts_item_ids: ["it2"] },
    ],
    items: [
      { id: "it1", colour: "#E85D5D", correct_slot_id: "s-red" },
      { id: "it2", colour: "#5BA85B", correct_slot_id: "s-green" },
      { id: "it3", colour: "#E85D5D", correct_slot_id: "s-red" },
    ],
    layout: "bins",
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0001-000000000007", "pattern_completion", "drag-sort", "Complete the Pattern", {
      learning_area: "mathematics", skills: [SKILL.pattern], description: "What comes next in the pattern?",
    }),
    slots: [
      { id: "s1", label: { en: "?" }, accepts_item_ids: ["it1"] },
      { id: "s2", label: { en: "?" }, accepts_item_ids: ["it2"] },
    ],
    items: [
      { id: "it1", shape: "circle", colour: "#E85D5D", correct_slot_id: "s1" },
      { id: "it2", shape: "square", colour: "#5BA85B", correct_slot_id: "s2" },
    ],
    layout: "sequence",
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0001-000000000008", "basic_addition", "counting", "Adding Stars", {
      ecd_level: "ECD_B", difficulty: "standard",
      learning_area: "mathematics", skills: [SKILL.addition_5], description: "Add stars together",
    }),
    items: [{ id: "item-1", objects: { shape: "star", colour: "#F2A93B", count: 2, arrangement: "row" }, options: [2, 3, 4], correct_answer: 3, operation: "add", operands: [2, 1] }],
    tap_to_count: true, show_number_line: true,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0001-000000000009", "basic_subtraction", "counting", "Taking Away Stars", {
      ecd_level: "ECD_B", difficulty: "standard",
      learning_area: "mathematics", skills: [SKILL.subtraction_5], description: "Take away stars and count",
    }),
    items: [{ id: "item-1", objects: { shape: "star", colour: "#F2A93B", count: 5, arrangement: "row" }, options: [3, 4, 5], correct_answer: 3, operation: "subtract", operands: [5, 2] }],
    tap_to_count: true, show_number_line: true,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0001-00000000000a", "tap_correct", "choice", "Find the Star!", {
      learning_area: "mathematics", skills: [SKILL.shape_circle], description: "Tap the star shape",
    }),
    items: [
      { id: "i1", stimulus: { shape: "star" }, is_correct: true },
      { id: "i2", stimulus: { shape: "circle" }, is_correct: false },
      { id: "i3", stimulus: { shape: "square" }, is_correct: false },
    ],
    prompt: { text: { en: "Find the star!" }, audio: { en: "audio/find_star.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0001-00000000000b", "multiple_choice", "choice", "Which is Bigger?", {
      learning_area: "mathematics", skills: [SKILL.counting_1_5], description: "Choose the group with more",
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "★★★★★" } }, is_correct: true, alt: { en: "5 stars" } },
      { id: "i2", stimulus: { text: { en: "★★" } }, is_correct: false, alt: { en: "2 stars" } },
    ],
    prompt: { text: { en: "Which group has MORE stars?" }, audio: { en: "audio/more_stars.mp3" } },
    layout: "row", show_correct_after_attempts: 2,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0001-00000000000c", "memory_game", "memory", "Shape Memory", {
      learning_area: "mathematics", skills: [SKILL.memory], description: "Find matching shape pairs",
    }),
    cards: [
      { id: "m1", pair_id: "pair-circle", text: { en: "●" } },
      { id: "m2", pair_id: "pair-circle", text: { en: "●" } },
      { id: "m3", pair_id: "pair-square", text: { en: "■" } },
      { id: "m4", pair_id: "pair-square", text: { en: "■" } },
    ],
    columns: 2, preview_ms: 2000,
  } as unknown as AnyActivity,

  // ── ENGLISH LANGUAGE ──────────────────────────────────────────────────────

  {
    ...base("00000000-0000-0000-0002-000000000001", "image_identification", "choice", "What Animal is This?", {
      learning_area: "english_language", skills: [SKILL.animal_identify], description: "Identify the animal",
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "Cow" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "Dog" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "Cat" } }, is_correct: false },
    ],
    prompt: { text: { en: "What animal is this?" }, audio: { en: "audio/animal_cow.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0002-000000000002", "phonics_recognition", "choice", "Letter A Sound", {
      ecd_level: "ECD_B", learning_area: "english_language", skills: [SKILL.phonics_a], description: "Find the letter that makes the 'a' sound",
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "Aa" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "Bb" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "Cc" } }, is_correct: false },
    ],
    prompt: { text: { en: "Which letter says 'ah'?" }, audio: { en: "audio/phonics_a.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0002-000000000003", "matching", "match", "Match Animal Sounds", {
      learning_area: "english_language", skills: [SKILL.animal_identify], description: "Match animals to their sound",
    }),
    pairs: [
      { id: "p1", left: { text: { en: "Cow" } }, right: { text: { en: "Moo" } } },
      { id: "p2", left: { text: { en: "Dog" } }, right: { text: { en: "Woof" } } },
      { id: "p3", left: { text: { en: "Cat" } }, right: { text: { en: "Meow" } } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0002-000000000004", "tracing", "trace", "Trace the Line", {
      learning_area: "english_language", skills: [SKILL.trace_line], description: "Trace a straight line", scoring_method: "coverage",
    }),
    items: [{
      id: "t1",
      strokes: [{ id: "sk1", points: [{ x: 0.2, y: 0.5 }, { x: 0.8, y: 0.5 }], colour: "#F2A93B", width: 12, is_guide: true }],
      tolerance: 0.08, min_coverage: 0.6,
    }],
    canvas_width: 400, canvas_height: 200,
    brush_colours: ["#F2A93B", "#E85D5D", "#5BA85B"], show_starting_dot: true,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0002-000000000005", "tracing", "trace", "Trace the Circle", {
      learning_area: "english_language", skills: [SKILL.trace_line], description: "Trace around the circle", scoring_method: "coverage",
    }),
    items: [{
      id: "t1",
      strokes: [{
        id: "sk1",
        points: [
          { x: 0.5, y: 0.2 }, { x: 0.7, y: 0.3 }, { x: 0.8, y: 0.5 },
          { x: 0.7, y: 0.7 }, { x: 0.5, y: 0.8 }, { x: 0.3, y: 0.7 },
          { x: 0.2, y: 0.5 }, { x: 0.3, y: 0.3 }, { x: 0.5, y: 0.2 },
        ],
        colour: "#3B7DD8", width: 10, is_guide: true,
      }],
      tolerance: 0.1, min_coverage: 0.5,
    }],
    canvas_width: 300, canvas_height: 300,
    brush_colours: ["#3B7DD8", "#F2A93B", "#E85D5D"], show_starting_dot: true,
  } as unknown as AnyActivity,

  // ── SCIENCE AND TECHNOLOGY ────────────────────────────────────────────────

  {
    ...base("00000000-0000-0000-0003-000000000001", "image_identification", "choice", "Body Parts", {
      learning_area: "science_and_technology", skills: [SKILL.body_parts], description: "Identify body parts",
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "Nose" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "Ear" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "Eye" } }, is_correct: false },
    ],
    prompt: { text: { en: "What is this?" }, audio: { en: "audio/body_nose.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0003-000000000002", "sequence_ordering", "drag-sort", "Wash Hands Steps", {
      learning_area: "science_and_technology", skills: [SKILL.hygiene], description: "Put hand washing steps in order",
    }),
    slots: [
      { id: "s1", label: { en: "1st" }, accepts_item_ids: ["it1"] },
      { id: "s2", label: { en: "2nd" }, accepts_item_ids: ["it2"] },
      { id: "s3", label: { en: "3rd" }, accepts_item_ids: ["it3"] },
    ],
    items: [
      { id: "it1", text: { en: "Wet hands" }, correct_slot_id: "s1" },
      { id: "it2", text: { en: "Use soap" }, correct_slot_id: "s2" },
      { id: "it3", text: { en: "Rinse" }, correct_slot_id: "s3" },
    ],
    layout: "sequence",
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0003-000000000003", "sorting", "drag-sort", "Healthy Food Sort", {
      ecd_level: "ECD_B", learning_area: "science_and_technology", skills: [SKILL.food_sort], description: "Sort healthy and unhealthy foods",
    }),
    slots: [
      { id: "s-healthy", label: { en: "Healthy" }, accepts_item_ids: ["it1", "it2"] },
      { id: "s-treat", label: { en: "Sometimes" }, accepts_item_ids: ["it3"] },
    ],
    items: [
      { id: "it1", text: { en: "🍎 Apple" }, correct_slot_id: "s-healthy" },
      { id: "it2", text: { en: "🥦 Broccoli" }, correct_slot_id: "s-healthy" },
      { id: "it3", text: { en: "🍬 Candy" }, correct_slot_id: "s-treat" },
    ],
    layout: "bins",
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0003-000000000004", "image_identification", "choice", "What's the Weather?", {
      learning_area: "science_and_technology", skills: [SKILL.weather], description: "Identify weather conditions",
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "☀️ Sunny" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🌧️ Rainy" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "☁️ Cloudy" } }, is_correct: false },
    ],
    prompt: { text: { en: "What is the weather?" }, audio: { en: "audio/weather_sunny.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0003-000000000005", "animal_sound_recognition", "choice", "Animal Sounds", {
      learning_area: "science_and_technology", skills: [SKILL.animal_identify], description: "Which animal makes this sound?",
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🐓 Rooster" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🐄 Cow" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "🐕 Dog" } }, is_correct: false },
    ],
    prompt: { text: { en: "Which animal crows?" }, audio: { en: "audio/rooster.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // ── SOCIAL SCIENCES ───────────────────────────────────────────────────────

  {
    ...base("00000000-0000-0000-0004-000000000001", "image_identification", "choice", "Family Members", {
      learning_area: "social_sciences", skills: [SKILL.family_members], description: "Identify family members",
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "Mother" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "Father" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "Sister" } }, is_correct: false },
    ],
    prompt: { text: { en: "Who is this?" }, audio: { en: "audio/family_mother.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0004-000000000002", "image_identification", "choice", "Transport", {
      learning_area: "social_sciences", skills: [SKILL.transport], description: "Identify types of transport",
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🚌 Bus" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🚗 Car" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "🚲 Bicycle" } }, is_correct: false },
    ],
    prompt: { text: { en: "What is this?" }, audio: { en: "audio/transport_bus.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0004-000000000003", "matching", "match", "Community Helpers", {
      learning_area: "social_sciences", skills: [SKILL.community_helpers], description: "Match helpers to their tools",
    }),
    pairs: [
      { id: "p1", left: { text: { en: "Teacher" } }, right: { text: { en: "📚 Book" } } },
      { id: "p2", left: { text: { en: "Nurse" } }, right: { text: { en: "💉 Injection" } } },
      { id: "p3", left: { text: { en: "Farmer" } }, right: { text: { en: "🌾 Hoe" } } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0004-000000000004", "sorting", "drag-sort", "Transport Sort", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.transport], description: "Sort transport by land, air, water",
    }),
    slots: [
      { id: "s-land", label: { en: "Land" }, accepts_item_ids: ["it1"] },
      { id: "s-air", label: { en: "Air" }, accepts_item_ids: ["it2"] },
      { id: "s-water", label: { en: "Water" }, accepts_item_ids: ["it3"] },
    ],
    items: [
      { id: "it1", text: { en: "🚗 Car" }, correct_slot_id: "s-land" },
      { id: "it2", text: { en: "✈️ Plane" }, correct_slot_id: "s-air" },
      { id: "it3", text: { en: "🚢 Boat" }, correct_slot_id: "s-water" },
    ],
    layout: "bins",
  } as unknown as AnyActivity,

  // ── PHYSICAL EDUCATION AND ARTS ───────────────────────────────────────────

  {
    ...base("00000000-0000-0000-0005-000000000001", "tap_correct", "choice", "Find Red!", {
      learning_area: "physical_education_and_arts", skills: [SKILL.colour_red], description: "Find the red colour",
    }),
    items: [
      { id: "i1", stimulus: { colour: "#E85D5D" }, is_correct: true, alt: { en: "Red" } },
      { id: "i2", stimulus: { colour: "#5BA85B" }, is_correct: false, alt: { en: "Green" } },
      { id: "i3", stimulus: { colour: "#3B7DD8" }, is_correct: false, alt: { en: "Blue" } },
    ],
    prompt: { text: { en: "Find RED!" }, audio: { en: "audio/find_red.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0005-000000000002", "audio_to_image", "choice", "Instrument Sounds", {
      ecd_level: "ECD_B", learning_area: "physical_education_and_arts", skills: [SKILL.instrument_sound], description: "Listen and choose the instrument",
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🎵 Mbira" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🥁 Ngoma" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: " rattles Hosho" } }, is_correct: false },
    ],
    prompt: { text: { en: "Which instrument is playing?" }, audio: { en: "audio/mbira.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0005-000000000003", "memory_game", "memory", "Colour Memory", {
      learning_area: "physical_education_and_arts", skills: [SKILL.memory, SKILL.colour_red], description: "Find matching colour pairs",
    }),
    cards: [
      { id: "m1", pair_id: "pair-red", text: { en: "🔴" } },
      { id: "m2", pair_id: "pair-red", text: { en: "🔴" } },
      { id: "m3", pair_id: "pair-blue", text: { en: "🔵" } },
      { id: "m4", pair_id: "pair-blue", text: { en: "🔵" } },
      { id: "m5", pair_id: "pair-green", text: { en: "🟢" } },
      { id: "m6", pair_id: "pair-green", text: { en: "🟢" } },
    ],
    columns: 3, preview_ms: 3000,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0005-000000000004", "tracing", "trace", "Trace the Zigzag", {
      ecd_level: "ECD_B", difficulty: "standard",
      learning_area: "physical_education_and_arts", skills: [SKILL.trace_line],
      description: "Trace a zigzag line", scoring_method: "coverage",
    }),
    items: [{
      id: "t1",
      strokes: [{
        id: "sk1",
        points: [
          { x: 0.15, y: 0.3 }, { x: 0.35, y: 0.7 }, { x: 0.5, y: 0.3 },
          { x: 0.65, y: 0.7 }, { x: 0.85, y: 0.3 },
        ],
        colour: "#E85D5D", width: 10, is_guide: true,
      }],
      tolerance: 0.1, min_coverage: 0.5,
    }],
    canvas_width: 400, canvas_height: 200,
    brush_colours: ["#E85D5D", "#F2A93B", "#5BA85B"], show_starting_dot: true,
  } as unknown as AnyActivity,
];

// ── STORIES ─────────────────────────────────────────────────────────────────

export const seedStories: AnyActivity[] = [
  {
    ...base("00000000-0000-0000-0006-000000000001", "story_interaction", "story", "The Hungry Caterpillar", {
      learning_area: "english_language", skills: [SKILL.story],
      description: "A story about a caterpillar eating food", scoring_method: "completion", duration: 120,
    }),
    pages: [
      { id: "pg1", image: { en: "img/stories/caterpillar/pg1.png" }, narration: { en: "audio/stories/caterpillar/pg1.mp3" }, text: { en: "Once there was a little caterpillar. He was very hungry!" } },
      { id: "pg2", image: { en: "img/stories/caterpillar/pg2.png" }, narration: { en: "audio/stories/caterpillar/pg2.mp3" }, text: { en: "He ate one apple. But he was still hungry!" } },
      { id: "pg3", image: { en: "img/stories/caterpillar/pg3.png" }, narration: { en: "audio/stories/caterpillar/pg3.mp3" }, text: { en: "Then he ate two pears. Was he still hungry?" }, interaction: { type: "tap_correct", choices: [{ id: "ch1", text: { en: "Yes!" }, is_correct: true }, { id: "ch2", text: { en: "No" }, is_correct: false }] } },
      { id: "pg4", image: { en: "img/stories/caterpillar/pg4.png" }, narration: { en: "audio/stories/caterpillar/pg4.mp3" }, text: { en: "Now he was a big, beautiful butterfly! The End." } },
    ],
    auto_advance: false, auto_advance_delay_ms: 2000,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0006-000000000002", "story_interaction", "story", "Sharing is Caring", {
      learning_area: "social_sciences", skills: [SKILL.story],
      description: "A story about sharing with friends", scoring_method: "completion", duration: 90,
    }),
    pages: [
      { id: "pg1", image: { en: "img/stories/sharing/pg1.png" }, narration: { en: "audio/stories/sharing/pg1.mp3" }, text: { en: "Tariro had three oranges. Her friend Tendai had none." } },
      { id: "pg2", image: { en: "img/stories/sharing/pg2.png" }, narration: { en: "audio/stories/sharing/pg2.mp3" }, text: { en: "What should Tariro do?" }, interaction: { type: "tap_correct", choices: [{ id: "ch1", text: { en: "Share with Tendai" }, is_correct: true }, { id: "ch2", text: { en: "Eat all alone" }, is_correct: false }] } },
      { id: "pg3", image: { en: "img/stories/sharing/pg3.png" }, narration: { en: "audio/stories/sharing/pg3.mp3" }, text: { en: "Tariro shared her oranges. They were both happy! The End." } },
    ],
    auto_advance: false, auto_advance_delay_ms: 2000,
  } as unknown as AnyActivity,

  {
    ...base("00000000-0000-0000-0006-000000000003", "story_interaction", "story", "The Clever Hare", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.story],
      description: "A traditional Zimbabwean tale", scoring_method: "completion", duration: 150,
    }),
    pages: [
      { id: "pg1", image: { en: "img/stories/hare/pg1.png" }, narration: { en: "audio/stories/hare/pg1.mp3" }, text: { en: "Long ago, Hare and Elephant had a race. Elephant was big and strong." } },
      { id: "pg2", image: { en: "img/stories/hare/pg2.png" }, narration: { en: "audio/stories/hare/pg2.mp3" }, text: { en: "Who do you think won the race?" }, interaction: { type: "tap_correct", choices: [{ id: "ch1", text: { en: "Hare" }, is_correct: true }, { id: "ch2", text: { en: "Elephant" }, is_correct: false }] } },
      { id: "pg3", image: { en: "img/stories/hare/pg3.png" }, narration: { en: "audio/stories/hare/pg3.mp3" }, text: { en: "Clever Hare won by being smart, not strong. The End." } },
    ],
    auto_advance: false, auto_advance_delay_ms: 2000,
  } as unknown as AnyActivity,
];
