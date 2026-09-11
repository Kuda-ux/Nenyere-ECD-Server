import type { AnyActivity } from "../schema";
import { base, SKILL } from "./helpers";

export const creativityActivities: AnyActivity[] = [
  // -- Find Red! --
  {
    ...base("00000000-0000-0000-0009-000000000001", "tap_correct", "choice", "Find Red!", {
      learning_area: "physical_education_and_arts", skills: [SKILL.colour_red],
      description: "Find the red colour",
      title_sn: "Tsvaga Tsvuku!", title_nd: "Thola Okubomvu!",
      instruction: "Find RED!",
      tags: ["creativity"],
    }),
    items: [
      { id: "i1", stimulus: { colour: "#E85D5D" }, is_correct: true, alt: { en: "Red" } },
      { id: "i2", stimulus: { colour: "#5BA85B" }, is_correct: false, alt: { en: "Green" } },
      { id: "i3", stimulus: { colour: "#3B7DD8" }, is_correct: false, alt: { en: "Blue" } },
      { id: "i4", stimulus: { colour: "#F2A93B" }, is_correct: false, alt: { en: "Yellow" } },
    ],
    prompt: { text: { en: "Find RED!", sn: "Tsvaga tsvuku!", nd: "Thola okubomvu!" }, audio: { en: "audio/find_red.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Find Blue! --
  {
    ...base("00000000-0000-0000-0009-000000000001b", "tap_correct", "choice", "Find Blue!", {
      learning_area: "physical_education_and_arts", skills: [SKILL.colour_identify],
      description: "Find the blue colour",
      title_sn: "Tsvaga Bhuruu!", title_nd: "Thola Okuhlaza!",
      instruction: "Find BLUE!",
      tags: ["creativity"],
    }),
    items: [
      { id: "i1", stimulus: { colour: "#3B7DD8" }, is_correct: true, alt: { en: "Blue" } },
      { id: "i2", stimulus: { colour: "#E85D5D" }, is_correct: false, alt: { en: "Red" } },
      { id: "i3", stimulus: { colour: "#5BA85B" }, is_correct: false, alt: { en: "Green" } },
      { id: "i4", stimulus: { colour: "#F2A93B" }, is_correct: false, alt: { en: "Yellow" } },
    ],
    prompt: { text: { en: "Find BLUE!", sn: "Tsvaga bhuruu!", nd: "Thola okuhlaza!" }, audio: { en: "audio/find_blue.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Instrument Sounds (ECD_B) --
  {
    ...base("00000000-0000-0000-0009-000000000002", "audio_to_image", "choice", "Instrument Sounds", {
      ecd_level: "ECD_B", learning_area: "physical_education_and_arts", skills: [SKILL.instrument_sound],
      description: "Listen and choose the instrument",
      title_sn: "Inzwi dzeZvibvumiro", title_nd: "Izandi Zezinsimba",
      instruction: "Which instrument is playing?",
      tags: ["creativity"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🎵 Mbira" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🥁 Ngoma" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "🎶 Hosho" } }, is_correct: false },
      { id: "i4", stimulus: { text: { en: "🎺 Trumpet" } }, is_correct: false },
    ],
    prompt: { text: { en: "Which instrument is playing?", sn: "Chibvumiro chipi chinoridzwa?", nd: "Insimba siphi esidlalayo?" }, audio: { en: "audio/mbira.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Colour Memory --
  {
    ...base("00000000-0000-0000-0009-000000000003", "memory_game", "memory", "Colour Memory", {
      learning_area: "physical_education_and_arts", skills: [SKILL.memory, SKILL.colour_red],
      description: "Find matching colour pairs",
      title_sn: "Kumboredha Mavara", title_nd: "Ukukhumbula Imibala",
      instruction: "Find the matching colours!",
      tags: ["creativity"],
    }),
    cards: [
      { id: "m1", pair_id: "pair-red", text: { en: "🔴" } },
      { id: "m2", pair_id: "pair-red", text: { en: "🔴" } },
      { id: "m3", pair_id: "pair-blue", text: { en: "🔵" } },
      { id: "m4", pair_id: "pair-blue", text: { en: "🔵" } },
      { id: "m5", pair_id: "pair-green", text: { en: "🟢" } },
      { id: "m6", pair_id: "pair-green", text: { en: "🟢" } },
      { id: "m7", pair_id: "pair-yellow", text: { en: "🟡" } },
      { id: "m8", pair_id: "pair-yellow", text: { en: "🟡" } },
    ],
    columns: 4, preview_ms: 3000,
  } as unknown as AnyActivity,

  // -- Match Colours to Objects (ECD_B) --
  {
    ...base("00000000-0000-0000-0009-000000000004", "matching", "match", "Match Colours to Objects", {
      ecd_level: "ECD_B", learning_area: "physical_education_and_arts", skills: [SKILL.colour_identify],
      description: "Match objects to their colour",
      title_sn: "Enzanisa Mavara neZvinhu", title_nd: "Fanisa Imibala Nezinto",
      instruction: "Match each thing to its colour!",
      tags: ["creativity"],
    }),
    pairs: [
      { id: "p1", left: { text: { en: "🍌 Banana" } }, right: { text: { en: "🟡 Yellow" } } },
      { id: "p2", left: { text: { en: "🍎 Apple" } }, right: { text: { en: "🔴 Red" } } },
      { id: "p3", left: { text: { en: "🌿 Leaf" } }, right: { text: { en: "🟢 Green" } } },
      { id: "p4", left: { text: { en: "🌊 Water" } }, right: { text: { en: "🔵 Blue" } } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  // -- Dance and Move (ECD_B) --
  {
    ...base("00000000-0000-0000-0009-000000000005", "tap_correct", "choice", "Dance and Move!", {
      ecd_level: "ECD_B", learning_area: "physical_education_and_arts", skills: [SKILL.dance, SKILL.coordination],
      description: "Move to the music!",
      title_sn: "Tamba neKuridza!", title_nd: "Gida Futhi Uzakale!",
      instruction: "When the music plays, what do we do?",
      tags: ["creativity"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "💃 Dance!" } }, is_correct: true, alt: { en: "Dance to the music!" } },
      { id: "i2", stimulus: { text: { en: "🛑 Stand still" } }, is_correct: false, alt: { en: "Don't stand still" } },
      { id: "i3", stimulus: { text: { en: "😴 Sleep" } }, is_correct: false, alt: { en: "Don't sleep" } },
    ],
    prompt: { text: { en: "The music is playing! What should we do?", sn: "Rwiyo rwuri kuridzwa! Tinofanira kuita chii?", nd: "Umculo uyadlala! Kumele sizenze ntoni?" }, audio: { en: "audio/dance.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Colour the Garden --
  {
    ...base("00000000-0000-0000-0009-000000000006", "colouring", "colouring", "Colour the Garden", {
      learning_area: "physical_education_and_arts", skills: [SKILL.colour_identify, SKILL.trace_line],
      description: "Colour a garden picture however you like",
      title_sn: "Kanda Ruvara mubindu", title_nd: "Faka Umbala Esitsheni",
      instruction: "Tap a colour, then tap the picture!",
      instruction_sn: "Bata ruvara, wobva wabata mufananidzo!", instruction_nd: "Thinta umbala, bese uthinte isithombe!",
      tags: ["creativity"],
      duration: 120,
    }),
    svg_template: "garden",
    regions: [
      { id: "sky", label: "Sky", path: "0,0 400,0 400,180 0,180", accept_any: true },
      { id: "sun", label: "Sun", path: "circle:70,55,35", accept_any: true },
      { id: "grass", label: "Grass", path: "0,180 400,180 400,300 0,300", accept_any: true },
      { id: "stem", label: "Stem", path: "196,215 204,215 204,275 196,275", accept_any: true },
      { id: "flower", label: "Flower", path: "circle:200,195,28", accept_any: true },
      { id: "leaf", label: "Leaf", path: "204,240 235,225 235,250 204,255", accept_any: true },
    ],
    palette: ["#F2A93B", "#3B7DD8", "#5BA85B", "#E85D5D", "#FF6B9D", "#9C27B0"],
    show_guide: false,
  } as unknown as AnyActivity,

  // -- Colour the House (ECD_B, guided) --
  {
    ...base("00000000-0000-0000-0009-000000000007", "colouring", "colouring", "Colour the House", {
      ecd_level: "ECD_B", difficulty: "standard",
      learning_area: "physical_education_and_arts", skills: [SKILL.colour_identify],
      description: "Colour the house with the right colours",
      title_sn: "Kanda Ruvara pamba", title_nd: "Faka Umbala Endlini",
      instruction: "Colour each part with the right colour!",
      tags: ["creativity"],
      duration: 120,
    }),
    svg_template: "house",
    regions: [
      { id: "sky", label: "Sky", path: "0,0 400,0 400,190 0,190", correct_colour: "#3B7DD8" },
      { id: "sun", label: "Sun", path: "circle:330,55,30", correct_colour: "#F2A93B" },
      { id: "grass", label: "Grass", path: "0,190 400,190 400,300 0,300", correct_colour: "#5BA85B" },
      { id: "house", label: "House", path: "140,155 240,155 240,240 140,240", correct_colour: "#E85D5D" },
      { id: "roof", label: "Roof", path: "128,155 190,100 252,155", correct_colour: "#8D6E63" },
      { id: "door", label: "Door", path: "176,195 204,195 204,240 176,240", correct_colour: "#9C27B0" },
    ],
    palette: ["#F2A93B", "#3B7DD8", "#5BA85B", "#E85D5D", "#8D6E63", "#9C27B0"],
    show_guide: true,
  } as unknown as AnyActivity,
];
