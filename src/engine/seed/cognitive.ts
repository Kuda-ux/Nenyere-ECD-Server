import type { AnyActivity } from "../schema";
import { base, SKILL } from "./helpers";

export const cognitiveActivities: AnyActivity[] = [
  // -- Match Shapes --
  {
    ...base("00000000-0000-0000-0001-000000000001", "matching", "match", "Match the Shapes", {
      learning_area: "mathematics", skills: [SKILL.matching, SKILL.shape_circle],
      description: "Match shapes that look the same",
      title_sn: "Enzanisa Mavara", title_nd: "Fanisa Izimo",
      instruction: "Match the shapes that are the same!",
      instruction_sn: "Enzanisa mavara akafanana!", instruction_nd: "Fanisa izimo eziyafana!",
      tags: ["cognitive"],
    }),
    pairs: [
      { id: "p1", left: { shape: "circle" }, right: { shape: "circle" } },
      { id: "p2", left: { shape: "square" }, right: { shape: "square" } },
      { id: "p3", left: { shape: "triangle" }, right: { shape: "triangle" } },
      { id: "p4", left: { shape: "star" }, right: { shape: "star" } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  // -- Odd One Out: Animals --
  {
    ...base("00000000-0000-0000-0001-000000000002", "tap_correct", "choice", "Odd One Out", {
      learning_area: "mathematics", skills: [SKILL.odd_one_out],
      description: "Which one is different?",
      title_sn: "Chisarwa", title_nd: "Okuphela",
      instruction: "Which one is different?",
      instruction_sn: "Ndechipi chisina kufanana?", instruction_nd: "Ngiphi okuhlukile?",
      tags: ["cognitive"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🐄" } }, is_correct: false, alt: { en: "Cow" } },
      { id: "i2", stimulus: { text: { en: "🐄" } }, is_correct: false, alt: { en: "Cow" } },
      { id: "i3", stimulus: { text: { en: "🐔" } }, is_correct: true, alt: { en: "Chicken is different!" } },
      { id: "i4", stimulus: { text: { en: "🐄" } }, is_correct: false, alt: { en: "Cow" } },
    ],
    prompt: { text: { en: "Which animal is different?", sn: "Ndechipi chisina kufanana?", nd: "Ngiphi esihlukile?" }, audio: { en: "audio/odd_one.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Odd One Out: Fruit vs Vegetable --
  {
    ...base("00000000-0000-0000-0001-000000000002b", "tap_correct", "choice", "Odd One Out: Fruit", {
      learning_area: "mathematics", skills: [SKILL.odd_one_out, SKILL.classification],
      description: "Which one is not a fruit?",
      title_sn: "Chisarwa: Muchero", title_nd: "Okuphela: Isithelo",
      instruction: "Which one is NOT a fruit?",
      tags: ["cognitive"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🍎" } }, is_correct: false, alt: { en: "Apple is a fruit" } },
      { id: "i2", stimulus: { text: { en: "🍌" } }, is_correct: false, alt: { en: "Banana is a fruit" } },
      { id: "i3", stimulus: { text: { en: "🥕" } }, is_correct: true, alt: { en: "Carrot is not a fruit!" } },
    ],
    prompt: { text: { en: "Which one is NOT a fruit?", sn: "Ndechipi chisiri muchero?", nd: "Ngiphi esingisosithelo?" }, audio: { en: "audio/odd_fruit.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Shape Memory --
  {
    ...base("00000000-0000-0000-0001-000000000003", "memory_game", "memory", "Shape Memory", {
      learning_area: "mathematics", skills: [SKILL.memory, SKILL.matching],
      description: "Find matching shape pairs",
      title_sn: "Kumboredha Mavara", title_nd: "Ukukhumbula Izimo",
      instruction: "Find the matching pairs!",
      instruction_sn: "Tsvaga zvivakambo zvakafanana!", instruction_nd: "Thola amaphula ayafana!",
      tags: ["cognitive"],
    }),
    cards: [
      { id: "m1", pair_id: "pair-circle", text: { en: "🔴" } },
      { id: "m2", pair_id: "pair-circle", text: { en: "🔴" } },
      { id: "m3", pair_id: "pair-square", text: { en: "🟦" } },
      { id: "m4", pair_id: "pair-square", text: { en: "🟦" } },
      { id: "m5", pair_id: "pair-triangle", text: { en: "🔺" } },
      { id: "m6", pair_id: "pair-triangle", text: { en: "🔺" } },
      { id: "m7", pair_id: "pair-star", text: { en: "⭐" } },
      { id: "m8", pair_id: "pair-star", text: { en: "⭐" } },
    ],
    columns: 4, preview_ms: 3000,
  } as unknown as AnyActivity,

  // -- Animal Memory --
  {
    ...base("00000000-0000-0000-0001-000000000003b", "memory_game", "memory", "Animal Memory", {
      learning_area: "mathematics", skills: [SKILL.memory, SKILL.animal_identify],
      description: "Find matching animal pairs",
      title_sn: "Kumboredha Zvipfuya", title_nd: "Ukukhumbula Izilwane",
      instruction: "Find the matching animals!",
      tags: ["cognitive"],
    }),
    cards: [
      { id: "m1", pair_id: "pair-cow", text: { en: "🐄" } },
      { id: "m2", pair_id: "pair-cow", text: { en: "🐄" } },
      { id: "m3", pair_id: "pair-dog", text: { en: "🐶" } },
      { id: "m4", pair_id: "pair-dog", text: { en: "🐶" } },
      { id: "m5", pair_id: "pair-cat", text: { en: "🐱" } },
      { id: "m6", pair_id: "pair-cat", text: { en: "🐱" } },
      { id: "m7", pair_id: "pair-bird", text: { en: "🐦" } },
      { id: "m8", pair_id: "pair-bird", text: { en: "🐦" } },
    ],
    columns: 4, preview_ms: 3000,
  } as unknown as AnyActivity,

  // -- Complete the Pattern --
  {
    ...base("00000000-0000-0000-0001-000000000004", "pattern_completion", "drag-sort", "Complete the Pattern", {
      learning_area: "mathematics", skills: [SKILL.pattern],
      description: "What comes next in the pattern?",
      title_sn: "Tsvagai Chinootevera", title_nd: "Qhubeka Ipetheni",
      instruction: "What comes next?",
      tags: ["cognitive"],
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

  // -- Big or Small --
  {
    ...base("00000000-0000-0000-0001-000000000005", "multiple_choice", "choice", "Big or Small?", {
      learning_area: "mathematics", skills: [SKILL.compare_size],
      description: "Which one is bigger?",
      title_sn: "Hukuru kana Hudiki?", title_nd: "Khulu noma Kuncane?",
      instruction: "Which one is bigger?",
      tags: ["cognitive"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🐘" } }, is_correct: true, alt: { en: "Elephant is big!" } },
      { id: "i2", stimulus: { text: { en: "🐭" } }, is_correct: false, alt: { en: "Mouse is small" } },
    ],
    prompt: { text: { en: "Which one is BIGGER?", sn: "Ndechipi chihuru?", nd: "Ngiphi esikhulu?" }, audio: { en: "audio/big_small.mp3" } },
    layout: "row", show_correct_after_attempts: 2,
  } as unknown as AnyActivity,

  // -- More or Less (ECD_B) --
  {
    ...base("00000000-0000-0000-0001-000000000006", "multiple_choice", "choice", "More or Less?", {
      ecd_level: "ECD_B", learning_area: "mathematics", skills: [SKILL.more_less],
      description: "Which group has more?",
      title_sn: "Zhinji kana Shoma?", title_nd: "Okuningi noma Okuncane?",
      instruction: "Which group has MORE?",
      tags: ["cognitive"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "⭐⭐⭐⭐⭐" } }, is_correct: true, alt: { en: "5 stars" } },
      { id: "i2", stimulus: { text: { en: "⭐⭐" } }, is_correct: false, alt: { en: "2 stars" } },
    ],
    prompt: { text: { en: "Which group has MORE stars?", sn: "Ndegurpa ripi rine nyeredzi zhinji?", nd: "Ngiliphi iqembu elinemitshwana eminingi?" }, audio: { en: "audio/more_stars.mp3" } },
    layout: "row", show_correct_after_attempts: 2,
  } as unknown as AnyActivity,

  // -- Sort by Colour (ECD_B) --
  {
    ...base("00000000-0000-0000-0001-000000000007", "sorting", "drag-sort", "Sort by Colour", {
      ecd_level: "ECD_B", learning_area: "mathematics", skills: [SKILL.sort_colour, SKILL.classification],
      description: "Sort objects by colour",
      title_sn: "Rongedza neRuwara", title_nd: "Hlela Ngebala",
      instruction: "Put each thing in the right box!",
      tags: ["cognitive"],
    }),
    slots: [
      { id: "s-red", label: { en: "Red" }, accepts_item_ids: ["it1", "it3"] },
      { id: "s-green", label: { en: "Green" }, accepts_item_ids: ["it2", "it4"] },
    ],
    items: [
      { id: "it1", colour: "#E85D5D", correct_slot_id: "s-red" },
      { id: "it2", colour: "#5BA85B", correct_slot_id: "s-green" },
      { id: "it3", colour: "#E85D5D", correct_slot_id: "s-red" },
      { id: "it4", colour: "#5BA85B", correct_slot_id: "s-green" },
    ],
    layout: "bins",
  } as unknown as AnyActivity,

  // -- Same or Different --
  {
    ...base("00000000-0000-0000-0001-000000000008", "tap_correct", "choice", "Same or Different?", {
      learning_area: "mathematics", skills: [SKILL.matching],
      description: "Are they the same or different?",
      title_sn: "Zvakafanana here?", title_nd: "Ziyafana yini?",
      instruction: "Are they the same or different?",
      tags: ["cognitive"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🔴🔴 Same" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "🔴🔵 Different" } }, is_correct: false },
    ],
    prompt: { text: { en: "These two are the SAME. Tap it!", sn: "Aya mavara akafanana. Bata!", nd: "La mabala ayafana. Thinta!" }, audio: { en: "audio/same_diff.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Above or Below (ECD_B) --
  {
    ...base("00000000-0000-0000-0001-000000000009", "tap_correct", "choice", "Above or Below?", {
      ecd_level: "ECD_B", learning_area: "mathematics", skills: [SKILL.position],
      description: "Where is the bird?",
      title_sn: "Pamusoro kana Pasiasi?", title_nd: "Phezulu noma Phezansi?",
      instruction: "Where is the bird?",
      tags: ["cognitive"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "⬆️ Above" } }, is_correct: true, alt: { en: "The bird is above" } },
      { id: "i2", stimulus: { text: { en: "⬇️ Below" } }, is_correct: false, alt: { en: "Below" } },
    ],
    prompt: { text: { en: "The bird is ABOVE the tree. Where is it?", sn: "Shiri iri pamusoro pemuti. Iri kupi?", nd: "Inyoni isePhezulu kwesihlahla. Ikuphi?" }, audio: { en: "audio/position.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- What Happens Next? (ECD_B) --
  {
    ...base("00000000-0000-0000-0001-00000000000a", "tap_correct", "choice", "What Happens Next?", {
      ecd_level: "ECD_B", learning_area: "science_and_technology", skills: [SKILL.cause_effect],
      description: "What happens when you water a plant?",
      title_sn: "Chinoitika Chii?", title_nd: "Kuzokwenzani?",
      instruction: "What happens when we water a plant?",
      tags: ["cognitive"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🌱 It grows!" } }, is_correct: true, alt: { en: "The plant grows" } },
      { id: "i2", stimulus: { text: { en: "🥀 It dies" } }, is_correct: false, alt: { en: "It dies" } },
      { id: "i3", stimulus: { text: { en: "Nothing" } }, is_correct: false, alt: { en: "Nothing happens" } },
    ],
    prompt: { text: { en: "What happens when we water a plant?", sn: "Chinoitika chii tikamanura muti?", nd: "Kuzokwenzani sithela isihlahla amanzi?" }, audio: { en: "audio/cause_effect.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- What Comes Next? Pattern --
  {
    ...base("00000000-0000-0000-0001-00000000000b", "pattern_completion", "choice", "What Comes Next?", {
      learning_area: "mathematics", skills: [SKILL.pattern],
      description: "Spot the pattern and pick what comes next",
      title_sn: "Chinotevera Chii?", title_nd: "Okulandelayo Yini?",
      instruction: "Look at the pattern. What comes next?",
      instruction_sn: "Tarisa muenzaniso. Chii chinotevera?", instruction_nd: "Bheka ipetheni. Yini elandelayo?",
      tags: ["cognitive"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🔴" } }, is_correct: true, alt: { en: "Red comes next — red, blue, red, blue!" } },
      { id: "i2", stimulus: { text: { en: "🔵" } }, is_correct: false, alt: { en: "Blue comes after red, not next" } },
      { id: "i3", stimulus: { text: { en: "🟢" } }, is_correct: false, alt: { en: "Green is not in the pattern" } },
    ],
    prompt: { text: { en: "🔴 🔵 🔴 🔵 🔴 _ What comes next?", sn: "🔴 🔵 🔴 🔵 🔴 _ Chii chinotevera?", nd: "🔴 🔵 🔴 🔵 🔴 _ Yini elandelayo?" }, audio: { en: "audio/pattern_next.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Shape Pattern (ECD_B) --
  {
    ...base("00000000-0000-0000-0001-00000000000c", "pattern_completion", "choice", "Shape Pattern", {
      ecd_level: "ECD_B", difficulty: "standard",
      learning_area: "mathematics", skills: [SKILL.pattern],
      description: "Complete the star and heart pattern",
      title_sn: "Muenzaniso weMavara", title_nd: "Ipetheni Yezimo",
      instruction: "Star, heart, star, heart — what is next?",
      tags: ["cognitive"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "⭐" } }, is_correct: true, alt: { en: "Star comes next!" } },
      { id: "i2", stimulus: { text: { en: "❤️" } }, is_correct: false, alt: { en: "Heart came before" } },
      { id: "i3", stimulus: { text: { en: "🔵" } }, is_correct: false, alt: { en: "Circle is not in the pattern" } },
    ],
    prompt: { text: { en: "⭐ ❤️ ⭐ ❤️ ⭐ _ What comes next?", sn: "⭐ ❤️ ⭐ ❤️ ⭐ _ Chii chinotevera?", nd: "⭐ ❤️ ⭐ ❤️ ⭐ _ Yini elandelayo?" }, audio: { en: "audio/pattern_shapes.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Grow a Plant (sequence) --
  {
    ...base("00000000-0000-0000-0001-00000000000d", "sequence_ordering", "sequence", "Grow a Plant", {
      learning_area: "science_and_technology", skills: [SKILL.pattern, SKILL.plants],
      description: "Put the plant growing steps in order",
      title_sn: "Kura kweMuti", title_nd: "Ukukhula Kwesihlahla",
      instruction: "Tap the pictures in order — first the seed!",
      instruction_sn: "Bata mifananidzo nokurongwa — mbeu kutanga!", instruction_nd: "Thinta izithombe ngokulandelana — imbewu kuqala!",
      tags: ["cognitive", "theme-weather"],
      duration: 75,
    }),
    items: [
      {
        id: "plant-steps",
        steps: [
          { id: "s1", text: { en: "🌰 Seed" }, correct_order: 1, emoji: "🌰" },
          { id: "s2", text: { en: "🌱 Sprout" }, correct_order: 2, emoji: "🌱" },
          { id: "s3", text: { en: "🌿 Leaves" }, correct_order: 3, emoji: "🌿" },
          { id: "s4", text: { en: "🌸 Flower" }, correct_order: 4, emoji: "🌸" },
        ],
      },
    ],
    shuffle_steps: true,
  } as unknown as AnyActivity,

  // -- My Morning (sequence, ECD_B) --
  {
    ...base("00000000-0000-0000-0001-00000000000e", "sequence_ordering", "sequence", "My Morning", {
      ecd_level: "ECD_B", difficulty: "standard",
      learning_area: "social_sciences", skills: [SKILL.pattern, SKILL.hygiene],
      description: "Put the morning routine in order",
      title_sn: "Mangwanani Angu", title_nd: "Ukusasa Kwami",
      instruction: "What do we do first in the morning?",
      tags: ["cognitive"],
      duration: 75,
    }),
    items: [
      {
        id: "morning-steps",
        steps: [
          { id: "s1", text: { en: "😴 Wake up" }, correct_order: 1, emoji: "😴" },
          { id: "s2", text: { en: "🦷 Brush teeth" }, correct_order: 2, emoji: "🦷" },
          { id: "s3", text: { en: "🍚 Eat breakfast" }, correct_order: 3, emoji: "🍚" },
          { id: "s4", text: { en: "🏫 Go to school" }, correct_order: 4, emoji: "🏫" },
        ],
      },
    ],
    shuffle_steps: true,
  } as unknown as AnyActivity,

  // -- Animal Puzzle --
  {
    ...base("00000000-0000-0000-0001-00000000000f", "puzzle", "puzzle", "Animal Puzzle", {
      learning_area: "mathematics", skills: [SKILL.matching, SKILL.animal_identify],
      description: "Put the animals in their homes",
      title_sn: "Puzzle yeZvipfuya", title_nd: "I-Puzzle Yezilwane",
      instruction: "Tap a piece, then tap its home!",
      instruction_sn: "Bata chikamu, wobva wabata imba yacho!", instruction_nd: "Thinta iqhezu, bese uthinte ikhaya lalo!",
      tags: ["cognitive", "theme-animals"],
      duration: 90,
    }),
    pieces: [
      { id: "p1", label: "Lion", correct_row: 0, correct_col: 0, emoji: "🦁" },
      { id: "p2", label: "Elephant", correct_row: 0, correct_col: 1, emoji: "🐘" },
      { id: "p3", correct_row: 1, correct_col: 0, emoji: "🦒", label: "Giraffe" },
      { id: "p4", correct_row: 1, correct_col: 1, emoji: "🦓", label: "Zebra" },
    ],
    rows: 2, cols: 2, show_ghost: true,
  } as unknown as AnyActivity,

  // -- Face Puzzle (ECD_B) --
  {
    ...base("00000000-0000-0000-0001-000000000010", "puzzle", "puzzle", "Face Puzzle", {
      ecd_level: "ECD_B", difficulty: "standard",
      learning_area: "mathematics", skills: [SKILL.matching],
      description: "Build the happy face",
      title_sn: "Puzzle yeChiso", title_nd: "I-Puzzle Yobuso",
      instruction: "Put the face parts in the right place!",
      tags: ["cognitive"],
      duration: 90,
    }),
    pieces: [
      { id: "p1", correct_row: 0, correct_col: 0, emoji: "👁️" },
      { id: "p2", correct_row: 0, correct_col: 1, emoji: "👁️" },
      { id: "p3", correct_row: 0, correct_col: 2, emoji: "🎀" },
      { id: "p4", correct_row: 1, correct_col: 0, emoji: "🌈" },
      { id: "p5", correct_row: 1, correct_col: 1, emoji: "👃" },
      { id: "p6", correct_row: 1, correct_col: 2, emoji: "👄" },
    ],
    rows: 2, cols: 3, show_ghost: true,
  } as unknown as AnyActivity,

  // -- Spot the Difference --
  {
    ...base("00000000-0000-0000-0001-000000000011", "spot_the_difference", "spot-difference", "Spot the Difference", {
      learning_area: "mathematics", skills: [SKILL.matching, SKILL.odd_one_out],
      description: "Find what is different between the two pictures",
      title_sn: "Tsvaga Zvinosiyana", title_nd: "Thola Okwehlukile",
      instruction: "Tap the things that are different!",
      instruction_sn: "Bata zvinhu zvisina kufanana!", instruction_nd: "Thinta izinto ezingafani!",
      tags: ["cognitive"],
      duration: 90,
    }),
    image_left: { en: "scene-garden-left" },
    image_right: { en: "scene-garden-right" },
    differences: [
      { id: "d1", cx: 0.3, cy: 0.25, radius: 0.18 },
      { id: "d2", cx: 0.75, cy: 0.45, radius: 0.09 },
      { id: "d3", cx: 0.21, cy: 0.66, radius: 0.11 },
    ],
    tap_tolerance: 1.3,
  } as unknown as AnyActivity,
];
