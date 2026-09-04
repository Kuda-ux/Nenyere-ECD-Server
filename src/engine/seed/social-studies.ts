import type { AnyActivity } from "../schema";
import { base, SKILL } from "./helpers";

export const socialStudiesActivities: AnyActivity[] = [
  // -- Family Members --
  {
    ...base("00000000-0000-0000-0007-000000000001", "image_identification", "choice", "Family Members", {
      learning_area: "social_sciences", skills: [SKILL.family_members],
      description: "Identify family members",
      title_sn: "Vabereki", title_nd: "Abazali",
      instruction: "Who is this?",
      tags: ["social-studies"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "👩 Mother" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "👨 Father" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "👧 Sister" } }, is_correct: false },
      { id: "i4", stimulus: { text: { en: "👦 Brother" } }, is_correct: false },
    ],
    prompt: { text: { en: "Who is this?", sn: "Uyu ndeani?", nd: "Ngubani lo?" }, audio: { en: "audio/family_mother.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Transport --
  {
    ...base("00000000-0000-0000-0007-000000000002", "image_identification", "choice", "Transport", {
      learning_area: "social_sciences", skills: [SKILL.transport],
      description: "Identify types of transport",
      title_sn: "Zvokufamba", title_nd: "Ezokuhamba",
      instruction: "What is this?",
      tags: ["social-studies"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🚌 Bus" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🚗 Car" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "🚲 Bicycle" } }, is_correct: false },
      { id: "i4", stimulus: { text: { en: "✈️ Plane" } }, is_correct: false },
    ],
    prompt: { text: { en: "What is this?", sn: "Chii chino?", nd: "Siyini lesi?" }, audio: { en: "audio/transport_bus.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Community Helpers --
  {
    ...base("00000000-0000-0000-0007-000000000003", "matching", "match", "Community Helpers", {
      learning_area: "social_sciences", skills: [SKILL.community_helpers],
      description: "Match helpers to their tools",
      title_sn: "Vashandi veMhuri", title_nd: "Abasizi Bemphakathi",
      instruction: "Match each helper to their tool!",
      tags: ["social-studies"],
    }),
    pairs: [
      { id: "p1", left: { text: { en: "👩‍🏫 Teacher" } }, right: { text: { en: "📚 Book" } } },
      { id: "p2", left: { text: { en: "👩‍⚕️ Nurse" } }, right: { text: { en: "💉 Injection" } } },
      { id: "p3", left: { text: { en: "👨‍🌾 Farmer" } }, right: { text: { en: "🌾 Hoe" } } },
      { id: "p4", left: { text: { en: "👮 Police" } }, right: { text: { en: "🚔 Car" } } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  // -- Transport Sort (ECD_B) --
  {
    ...base("00000000-0000-0000-0007-000000000004", "sorting", "drag-sort", "Transport Sort", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.transport],
      description: "Sort transport by land, air, water",
      title_sn: "Rongedza Zvokufamba", title_nd: "Hlela Ezokuhamba",
      instruction: "Put each transport in the right place!",
      tags: ["social-studies"],
    }),
    slots: [
      { id: "s-land", label: { en: "Land" }, accepts_item_ids: ["it1", "it4"] },
      { id: "s-air", label: { en: "Air" }, accepts_item_ids: ["it2"] },
      { id: "s-water", label: { en: "Water" }, accepts_item_ids: ["it3", "it5"] },
    ],
    items: [
      { id: "it1", text: { en: "🚗 Car" }, correct_slot_id: "s-land" },
      { id: "it2", text: { en: "✈️ Plane" }, correct_slot_id: "s-air" },
      { id: "it3", text: { en: "🚢 Boat" }, correct_slot_id: "s-water" },
      { id: "it4", text: { en: "🚲 Bike" }, correct_slot_id: "s-land" },
      { id: "it5", text: { en: "⛵ Canoe" }, correct_slot_id: "s-water" },
    ],
    layout: "bins",
  } as unknown as AnyActivity,

  // -- My School (ECD_B) --
  {
    ...base("00000000-0000-0000-0007-000000000005", "tap_correct", "choice", "My School", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.community_helpers, SKILL.colour_identify],
      description: "Learn about our school",
      title_sn: "Chikoro Changu", title_nd: "Isikole Sami",
      instruction: "What do we do at school?",
      tags: ["social-studies"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "� We learn!" } }, is_correct: true, alt: { en: "We learn at school!" } },
      { id: "i2", stimulus: { text: { en: "� We sleep" } }, is_correct: false, alt: { en: "We don't sleep at school" } },
      { id: "i3", stimulus: { text: { en: "🎮 We play games only" } }, is_correct: false, alt: { en: "We also learn!" } },
    ],
    prompt: { text: { en: "What do we do at school?", sn: "Tinoita chii kuchikoro?", nd: "Sizenza ntoni esikoleni?" }, audio: { en: "audio/school.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- My Favourite Food (ECD_B) --
  {
    ...base("00000000-0000-0000-0007-000000000006", "tap_correct", "choice", "My Favourite Food", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.food_sort, SKILL.vocabulary],
      description: "Learn about food we eat at home",
      title_sn: "Chikafu Chandinoda", title_nd: "Ukudla Engikuthandayo",
      instruction: "Which food do we eat at home?",
      tags: ["social-studies"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "� Sadza" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🧱 Brick" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "🪨 Stone" } }, is_correct: false },
    ],
    prompt: { text: { en: "Which one is food we eat?", sn: "Ndechipi chikafu chatinodya?", nd: "Ngiphi ukudla esikudlayo?" }, audio: { en: "audio/food_home.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,
];
