import type { AnyActivity } from "../schema";
import { base, SKILL } from "./helpers";

export const literacyActivities: AnyActivity[] = [
  // -- Letter A Sound (ECD_B) --
  {
    ...base("00000000-0000-0000-0004-000000000001", "phonics_recognition", "choice", "Letter A Sound", {
      ecd_level: "ECD_B", learning_area: "english_language", skills: [SKILL.phonics_a],
      description: "Find the letter that makes the 'a' sound",
      title_sn: "Inzwi ra A", title_nd: "Isandi le A",
      instruction: "Which letter says 'ah'?",
      tags: ["literacy"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "Aa" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "Bb" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "Cc" } }, is_correct: false },
    ],
    prompt: { text: { en: "Which letter says 'ah'?", sn: "Ndechipi chinzwi chinoti 'ah'?", nd: "Ngiphi osithi 'ah'?" }, audio: { en: "audio/phonics_a.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Letter B Sound (ECD_B) --
  {
    ...base("00000000-0000-0000-0004-000000000002", "phonics_recognition", "choice", "Letter B Sound", {
      ecd_level: "ECD_B", learning_area: "english_language", skills: [SKILL.alphabet_b],
      description: "Find the letter that makes the 'b' sound",
      title_sn: "Inzwi ra B", title_nd: "Isandi le B",
      instruction: "Which letter says 'buh'?",
      tags: ["literacy"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "Bb" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "Aa" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "Dd" } }, is_correct: false },
    ],
    prompt: { text: { en: "Which letter says 'buh'?", sn: "Ndechipi chinzwi chinoti 'buh'?", nd: "Ngiphi osithi 'buh'?" }, audio: { en: "audio/phonics_b.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Match Animal Sounds --
  {
    ...base("00000000-0000-0000-0004-000000000003", "matching", "match", "Match Animal Sounds", {
      learning_area: "english_language", skills: [SKILL.animal_identify],
      description: "Match animals to their sound",
      title_sn: "Enzanisa Inzwi dzeZvipfuya", title_nd: "Fanisa Izandi Zezilwane",
      instruction: "Match each animal to its sound!",
      tags: ["literacy", "theme-animals"],
    }),
    pairs: [
      { id: "p1", left: { text: { en: "🐄 Cow" } }, right: { text: { en: "Moo" } } },
      { id: "p2", left: { text: { en: "🐕 Dog" } }, right: { text: { en: "Woof" } } },
      { id: "p3", left: { text: { en: "🐈 Cat" } }, right: { text: { en: "Meow" } } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  // -- Find Vowel A (ECD_B) --
  {
    ...base("00000000-0000-0000-0004-000000000004", "tap_correct", "choice", "Find Vowel A", {
      ecd_level: "ECD_B", learning_area: "english_language", skills: [SKILL.vowel_a],
      description: "Identify the vowel A",
      title_sn: "Tsvaga Vowel A", title_nd: "Thola Vowel A",
      instruction: "Find the letter A!",
      tags: ["literacy"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "A" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "B" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "C" } }, is_correct: false },
    ],
    prompt: { text: { en: "A is a vowel. Find A!", sn: "A ndi vowel. Tsvaga A!", nd: "A ngivoweli. Thola A!" }, audio: { en: "audio/vowel_a.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Find Vowel E (ECD_B) --
  {
    ...base("00000000-0000-0000-0004-000000000005", "tap_correct", "choice", "Find Vowel E", {
      ecd_level: "ECD_B", learning_area: "english_language", skills: [SKILL.vowel_e],
      description: "Identify the vowel E",
      title_sn: "Tsvaga Vowel E", title_nd: "Thola Vowel E",
      instruction: "Find the letter E!",
      tags: ["literacy"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "E" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "F" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "G" } }, is_correct: false },
    ],
    prompt: { text: { en: "E is a vowel. Find E!", sn: "E ndi vowel. Tsvaga E!", nd: "E ngivoweli. Thola E!" }, audio: { en: "audio/vowel_e.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- What Animal is This? --
  {
    ...base("00000000-0000-0000-0004-000000000006", "image_identification", "choice", "What Animal is This?", {
      learning_area: "english_language", skills: [SKILL.animal_identify, SKILL.vocabulary],
      description: "Identify the animal",
      title_sn: "Chimhuka Chii Chino?", title_nd: "Siyini Isilwane Lesi?",
      instruction: "What animal is this?",
      tags: ["literacy", "theme-animals"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🐄 Cow" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🐕 Dog" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "🐈 Cat" } }, is_correct: false },
    ],
    prompt: { text: { en: "What animal is this?", sn: "Chimhuka chii chino?", nd: "Siyini isilwane lesi?" }, audio: { en: "audio/animal_cow.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,
];
