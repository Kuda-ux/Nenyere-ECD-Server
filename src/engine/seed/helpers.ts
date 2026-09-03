export const FEEDBACK = {
  correct: [
    { text: { en: "Well done!", sn: "Wakaita zvakanaka!", nd: "Wakangwara!" } },
    { text: { en: "You found it!", sn: "Wakawana!", nd: "Wathola!" } },
    { text: { en: "Excellent!", sn: "Zvakanaka!", nd: "Zwakanaka!" } },
    { text: { en: "Correct! You are so smart!", sn: "Chokwadi! Wakangwara!", nd: "Kuyiqiniso! Ukhokhle!" } },
    { text: { en: "Great job!", sn: "Basa rakanaka!", nd: "Umsebenzi omuhle!" } },
  ],
  encourage: [
    { text: { en: "Let's try again.", sn: "Tiyedze zvakare.", nd: "Ake tinze khonjo." } },
    { text: { en: "Good try!", sn: "Kuedza kwakanaka!", nd: "Kuyedza kwakanaka!" } },
    { text: { en: "Almost! Try once more.", sn: "Pedyo! Edza kamwe chete.", nd: "Kusedze! Zama futhi." } },
  ],
  celebration: "stars" as const,
};

export const HINTS = { after_incorrect: 2, highlight_after: 3, show_demo: false };

export const SKILL = {
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
  classification: "00000000-0000-0000-0000-000000000020",
  odd_one_out: "00000000-0000-0000-0000-000000000021",
  compare_size: "00000000-0000-0000-0000-000000000022",
  position: "00000000-0000-0000-0000-000000000023",
  vowel_a: "00000000-0000-0000-0000-000000000024",
  vowel_e: "00000000-0000-0000-0000-000000000025",
  vowel_i: "00000000-0000-0000-0000-000000000026",
  vowel_o: "00000000-0000-0000-0000-000000000027",
  vowel_u: "00000000-0000-0000-0000-000000000028",
  alphabet_b: "00000000-0000-0000-0000-000000000029",
  alphabet_c: "00000000-0000-0000-0000-00000000002a",
  shona_greetings: "00000000-0000-0000-0000-00000000002b",
  ndebele_greetings: "00000000-0000-0000-0000-00000000002c",
  emotions: "00000000-0000-0000-0000-00000000002d",
  sharing: "00000000-0000-0000-0000-00000000002e",
  plants: "00000000-0000-0000-0000-00000000002f",
  five_senses: "00000000-0000-0000-0000-000000000030",
  zimbabwe_identity: "00000000-0000-0000-0000-000000000031",
  coordination: "00000000-0000-0000-0000-000000000032",
  dance: "00000000-0000-0000-0000-000000000033",
  ict_basic: "00000000-0000-0000-0000-000000000034",
  number_recognition: "00000000-0000-0000-0000-000000000035",
  missing_numbers: "00000000-0000-0000-0000-000000000036",
  more_less: "00000000-0000-0000-0000-000000000037",
  vocabulary: "00000000-0000-0000-0000-000000000038",
  cause_effect: "00000000-0000-0000-0000-000000000039",
};

export function base(id: string, type: string, engine: string, title: string, opts: {
  ecd_level?: string;
  difficulty?: string;
  learning_area: string;
  skills: string[];
  description?: string;
  scoring_method?: string;
  duration?: number;
  title_sn?: string;
  title_nd?: string;
  desc_sn?: string;
  desc_nd?: string;
  instruction?: string;
  instruction_sn?: string;
  instruction_nd?: string;
  tags?: string[];
}) {
  return {
    id,
    schema_version: 1,
    type,
    engine,
    title: { en: title, sn: opts.title_sn, nd: opts.title_nd },
    description: opts.description ? { en: opts.description, sn: opts.desc_sn, nd: opts.desc_nd } : undefined,
    ecd_level: opts.ecd_level ?? "ECD_A",
    difficulty: opts.difficulty ?? "easy",
    learning_area: opts.learning_area,
    skills: opts.skills,
    curriculum_refs: [],
    instructions: {
      text: { en: opts.instruction ?? "Listen and play!", sn: opts.instruction_sn, nd: opts.instruction_nd },
      audio: { en: "audio/instructions.mp3" },
      demo: "none" as const,
    },
    assets: [],
    language: "en" as const,
    estimated_duration_s: opts.duration ?? 60,
    feedback: FEEDBACK,
    scoring: {
      method: opts.scoring_method ?? "per_item",
      star_bands: { one: 0, two: 0.6, three: 0.9 },
      count_hints_as_partial: false,
      max_attempts_per_item: null,
    },
    hints: HINTS,
    tags: opts.tags ?? [],
  };
}
