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

  // -- Zimbabwe Flag Colours (ECD_B) --
  {
    ...base("00000000-0000-0000-0007-000000000005", "tap_correct", "choice", "Zimbabwe Flag Colours", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.zimbabwe_identity, SKILL.colour_identify],
      description: "Identify colours in the Zimbabwe flag",
      title_sn: "Mavara eFlag yeZimbabwe", title_nd: "Imibala Yeflegi yeZimbabwe",
      instruction: "Which colour is in the Zimbabwe flag?",
      tags: ["social-studies"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🟢 Green" } }, is_correct: true, alt: { en: "Green is in the flag!" } },
      { id: "i2", stimulus: { text: { en: "🟣 Purple" } }, is_correct: false, alt: { en: "Not in the flag" } },
      { id: "i3", stimulus: { text: { en: "🟠 Orange" } }, is_correct: false, alt: { en: "Not in the flag" } },
    ],
    prompt: { text: { en: "Which colour is in our Zimbabwe flag?", sn: "Ruwara rwupi ruri muflag yeZimbabwe?", nd: "Umbala muni okuseflegi yeZimbabwe?" }, audio: { en: "audio/zim_flag.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- My Country (ECD_B) --
  {
    ...base("00000000-0000-0000-0007-000000000006", "tap_correct", "choice", "My Country Zimbabwe", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.zimbabwe_identity],
      description: "Learn about Zimbabwe",
      title_sn: "Nyika Yangu Zimbabwe", title_nd: "Izwe Lami Zimbabwe",
      instruction: "What is the name of our country?",
      tags: ["social-studies"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🇿🇼 Zimbabwe" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🇿🇦 South Africa" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "🇰🇪 Kenya" } }, is_correct: false },
    ],
    prompt: { text: { en: "What is the name of our country?", sn: "Zita renyika yedu nderei?", nd: "Ligama lezwe lethu ngisiphi?" }, audio: { en: "audio/my_country.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,
];
