import type { AnyActivity } from "../schema";
import { base, SKILL } from "./helpers";

export const scienceActivities: AnyActivity[] = [
  // -- Body Parts --
  {
    ...base("00000000-0000-0000-0006-000000000001", "image_identification", "choice", "Body Parts", {
      learning_area: "science_and_technology", skills: [SKILL.body_parts],
      description: "Identify body parts",
      title_sn: "Zvikamu Zvemuviri", title_nd: "Izingxenye Zomzimba",
      instruction: "What is this body part?",
      tags: ["science"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "👃 Nose" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "👂 Ear" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "👁️ Eye" } }, is_correct: false },
      { id: "i4", stimulus: { text: { en: "👄 Mouth" } }, is_correct: false },
    ],
    prompt: { text: { en: "What is this?", sn: "Chii chino?", nd: "Siyini lesi?" }, audio: { en: "audio/body_nose.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Wash Hands Steps --
  {
    ...base("00000000-0000-0000-0006-000000000002", "sequence_ordering", "drag-sort", "Wash Hands Steps", {
      learning_area: "science_and_technology", skills: [SKILL.hygiene],
      description: "Put hand washing steps in order",
      title_sn: "Matanho Ekugeza Mawoko", title_nd: "Izinyathelo Zokugeza Izandla",
      instruction: "Put the steps in the right order!",
      tags: ["science"],
    }),
    slots: [
      { id: "s1", label: { en: "1st" }, accepts_item_ids: ["it1"] },
      { id: "s2", label: { en: "2nd" }, accepts_item_ids: ["it2"] },
      { id: "s3", label: { en: "3rd" }, accepts_item_ids: ["it3"] },
      { id: "s4", label: { en: "4th" }, accepts_item_ids: ["it4"] },
    ],
    items: [
      { id: "it1", text: { en: "💧 Wet hands" }, correct_slot_id: "s1" },
      { id: "it2", text: { en: "🧼 Use soap" }, correct_slot_id: "s2" },
      { id: "it3", text: { en: "🤲 Rub together" }, correct_slot_id: "s3" },
      { id: "it4", text: { en: "🌊 Rinse" }, correct_slot_id: "s4" },
    ],
    layout: "sequence",
  } as unknown as AnyActivity,

  // -- Healthy Food Sort (ECD_B) --
  {
    ...base("00000000-0000-0000-0006-000000000003", "sorting", "drag-sort", "Healthy Food Sort", {
      ecd_level: "ECD_B", learning_area: "science_and_technology", skills: [SKILL.food_sort],
      description: "Sort healthy and unhealthy foods",
      title_sn: "Kudya Zvakachena", title_nd: "Ukudla Okuphilayo",
      instruction: "Put food in the right box!",
      tags: ["science"],
    }),
    slots: [
      { id: "s-healthy", label: { en: "Healthy" }, accepts_item_ids: ["it1", "it2", "it4"] },
      { id: "s-treat", label: { en: "Sometimes" }, accepts_item_ids: ["it3", "it5"] },
    ],
    items: [
      { id: "it1", text: { en: "🍎 Apple" }, correct_slot_id: "s-healthy" },
      { id: "it2", text: { en: "🥦 Broccoli" }, correct_slot_id: "s-healthy" },
      { id: "it3", text: { en: "🍬 Candy" }, correct_slot_id: "s-treat" },
      { id: "it4", text: { en: "🥕 Carrot" }, correct_slot_id: "s-healthy" },
      { id: "it5", text: { en: "🍰 Cake" }, correct_slot_id: "s-treat" },
    ],
    layout: "bins",
  } as unknown as AnyActivity,

  // -- What's the Weather? --
  {
    ...base("00000000-0000-0000-0006-000000000004", "image_identification", "choice", "What's the Weather?", {
      learning_area: "science_and_technology", skills: [SKILL.weather],
      description: "Identify weather conditions",
      title_sn: "Kuwai Kwemamirire", title_nd: "Isimo sesibili",
      instruction: "What is the weather today?",
      tags: ["science", "theme-weather"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "☀️ Sunny" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🌧️ Rainy" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "☁️ Cloudy" } }, is_correct: false },
      { id: "i4", stimulus: { text: { en: "⛈️ Stormy" } }, is_correct: false },
    ],
    prompt: { text: { en: "What is the weather?", sn: "Mamirire ezvinhu akaunganzei?", nd: "Siyini isimo sezulu?" }, audio: { en: "audio/weather_sunny.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Animal Sounds --
  {
    ...base("00000000-0000-0000-0006-000000000005", "animal_sound_recognition", "choice", "Animal Sounds", {
      learning_area: "science_and_technology", skills: [SKILL.animal_identify],
      description: "Which animal makes this sound?",
      title_sn: "Inzwi dzeZvipfuya", title_nd: "Izandi Zezilwane",
      instruction: "Which animal crows?",
      tags: ["science", "theme-animals"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🐓 Rooster" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🐄 Cow" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "🐕 Dog" } }, is_correct: false },
      { id: "i4", stimulus: { text: { en: "🐑 Sheep" } }, is_correct: false },
    ],
    prompt: { text: { en: "Which animal crows?", sn: "Chimhuka chipi chinokurura?", nd: "Isilwane siphi esikhwele?" }, audio: { en: "audio/rooster.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Five Senses (ECD_B) --
  {
    ...base("00000000-0000-0000-0006-000000000006", "matching", "match", "Five Senses", {
      ecd_level: "ECD_B", learning_area: "science_and_technology", skills: [SKILL.five_senses],
      description: "Match body parts to their sense",
      title_sn: "Zvinzwi Zvitatu", title_nd: "Izazi Ezintathu",
      instruction: "Match the body part to what it does!",
      tags: ["science"],
    }),
    pairs: [
      { id: "p1", left: { text: { en: "👁️ Eyes" } }, right: { text: { en: "See" } } },
      { id: "p2", left: { text: { en: "👂 Ears" } }, right: { text: { en: "Hear" } } },
      { id: "p3", left: { text: { en: "👃 Nose" } }, right: { text: { en: "Smell" } } },
      { id: "p4", left: { text: { en: "👅 Tongue" } }, right: { text: { en: "Taste" } } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  // -- Living or Non-living (ECD_B) --
  {
    ...base("00000000-0000-0000-0006-000000000007", "sorting", "drag-sort", "Alive or Not?", {
      ecd_level: "ECD_B", learning_area: "science_and_technology", skills: [SKILL.classification, SKILL.plants],
      description: "Sort living and non-living things",
      title_sn: "Mupenyu kana Hauna Mupenyu", title_nd: "Siphila noma Akhona?",
      instruction: "Put living things in one box and non-living in another!",
      tags: ["science"],
    }),
    slots: [
      { id: "s-alive", label: { en: "Alive" }, accepts_item_ids: ["it1", "it2", "it4"] },
      { id: "s-not", label: { en: "Not alive" }, accepts_item_ids: ["it3", "it5"] },
    ],
    items: [
      { id: "it1", text: { en: "🐶 Dog" }, correct_slot_id: "s-alive" },
      { id: "it2", text: { en: "🌳 Tree" }, correct_slot_id: "s-alive" },
      { id: "it3", text: { en: "🪨 Rock" }, correct_slot_id: "s-not" },
      { id: "it4", text: { en: "🐦 Bird" }, correct_slot_id: "s-alive" },
      { id: "it5", text: { en: "🚗 Car" }, correct_slot_id: "s-not" },
    ],
    layout: "bins",
  } as unknown as AnyActivity,
];
