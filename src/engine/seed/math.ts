import type { AnyActivity } from "../schema";
import { base, SKILL } from "./helpers";

export const mathActivities: AnyActivity[] = [
  // -- Count the Stars (1-5) --
  {
    ...base("00000000-0000-0000-0003-000000000001", "counting", "counting", "Count the Stars", {
      learning_area: "mathematics", skills: [SKILL.counting_1_5],
      description: "Count stars from 1 to 5",
      title_sn: "Verenga Nyeredzi", title_nd: "Bala Mitshwana",
      instruction: "Count the stars and tap the number!",
      instruction_sn: "Verenga nyeredzi wobva wabata namba!", instruction_nd: "Bala mitshwana bese uthinte inombolo!",
      tags: ["mathematics"],
    }),
    items: [
      { id: "item-1", objects: { shape: "star", colour: "#F2A93B", count: 3, arrangement: "row" }, options: [2, 3, 4], correct_answer: 3 },
      { id: "item-2", objects: { shape: "star", colour: "#F2A93B", count: 1, arrangement: "row" }, options: [1, 2, 3], correct_answer: 1 },
      { id: "item-3", objects: { shape: "star", colour: "#F2A93B", count: 5, arrangement: "grid" }, options: [4, 5, 3], correct_answer: 5 },
      { id: "item-4", objects: { shape: "star", colour: "#F2A93B", count: 2, arrangement: "row" }, options: [1, 2, 3], correct_answer: 2 },
    ],
    tap_to_count: true, show_number_line: true,
  } as unknown as AnyActivity,

  // -- Count the Apples (1-5) --
  {
    ...base("00000000-0000-0000-0003-000000000003", "counting", "counting", "Count the Apples", {
      learning_area: "mathematics", skills: [SKILL.counting_1_5],
      description: "Count apples from 1 to 5",
      title_sn: "Verenga Maapuro", title_nd: "Bala Ama-Apple",
      instruction: "How many apples?",
      instruction_sn: "Maapuro mangani?", instruction_nd: "Zingaki ama-apple?",
      tags: ["mathematics"],
    }),
    items: [
      { id: "item-1", objects: { shape: "apple", colour: "#E85D5D", count: 4, arrangement: "row" }, options: [3, 4, 5], correct_answer: 4 },
      { id: "item-2", objects: { shape: "apple", colour: "#E85D5D", count: 2, arrangement: "row" }, options: [1, 2, 3], correct_answer: 2 },
      { id: "item-3", objects: { shape: "apple", colour: "#E85D5D", count: 5, arrangement: "grid" }, options: [4, 5, 3], correct_answer: 5 },
    ],
    tap_to_count: true, show_number_line: true,
  } as unknown as AnyActivity,

  // -- Shape Sorting --
  {
    ...base("00000000-0000-0000-0003-000000000004", "shape_sorting", "drag-sort", "Sort the Shapes", {
      learning_area: "mathematics", skills: [SKILL.shape_sort],
      description: "Put shapes in the right boxes",
      title_sn: "Rongedza Mavara", title_nd: "Hlela Izimo",
      instruction: "Put each shape in the right box!",
      tags: ["mathematics"],
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

  // -- Match Colours --
  {
    ...base("00000000-0000-0000-0003-000000000005", "colour_identification", "match", "Match Colours", {
      learning_area: "physical_education_and_arts", skills: [SKILL.colour_identify],
      description: "Match colours that are the same",
      title_sn: "Enzanisa Mavara", title_nd: "Fanisa Imibala",
      instruction: "Match the same colours!",
      tags: ["mathematics"],
    }),
    pairs: [
      { id: "p1", left: { colour: "#E85D5D" }, right: { colour: "#E85D5D" } },
      { id: "p2", left: { colour: "#5BA85B" }, right: { colour: "#5BA85B" } },
      { id: "p3", left: { colour: "#3B7DD8" }, right: { colour: "#3B7DD8" } },
      { id: "p4", left: { colour: "#F2A93B" }, right: { colour: "#F2A93B" } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  // -- Adding Stars (ECD_B) --
  {
    ...base("00000000-0000-0000-0003-000000000006", "basic_addition", "counting", "Adding Stars", {
      ecd_level: "ECD_B", difficulty: "standard",
      learning_area: "mathematics", skills: [SKILL.addition_5],
      description: "Add stars together",
      title_sn: "Kuwedzera Nyeredzi", title_nd: "Ngeza Mitshwana",
      instruction: "Count all the stars together!",
      tags: ["mathematics"],
    }),
    items: [
      { id: "item-1", objects: { shape: "star", colour: "#F2A93B", count: 3, arrangement: "row" }, options: [2, 3, 4], correct_answer: 3, operation: "add", operands: [2, 1] },
      { id: "item-2", objects: { shape: "star", colour: "#F2A93B", count: 4, arrangement: "row" }, options: [3, 4, 5], correct_answer: 4, operation: "add", operands: [2, 2] },
      { id: "item-3", objects: { shape: "star", colour: "#F2A93B", count: 5, arrangement: "row" }, options: [4, 5, 3], correct_answer: 5, operation: "add", operands: [3, 2] },
    ],
    tap_to_count: true, show_number_line: true,
  } as unknown as AnyActivity,

  // -- Taking Away Stars (ECD_B) --
  {
    ...base("00000000-0000-0000-0003-000000000007", "basic_subtraction", "counting", "Taking Away Stars", {
      ecd_level: "ECD_B", difficulty: "standard",
      learning_area: "mathematics", skills: [SKILL.subtraction_5],
      description: "Take away stars and count",
      title_sn: "Kubvisa Nyeredzi", title_nd: "Susa Mitshwana",
      instruction: "Some stars went away. How many are left?",
      tags: ["mathematics"],
    }),
    items: [
      { id: "item-1", objects: { shape: "star", colour: "#F2A93B", count: 3, arrangement: "row" }, options: [2, 3, 4], correct_answer: 3, operation: "subtract", operands: [5, 2] },
      { id: "item-2", objects: { shape: "star", colour: "#F2A93B", count: 2, arrangement: "row" }, options: [1, 2, 3], correct_answer: 2, operation: "subtract", operands: [4, 2] },
      { id: "item-3", objects: { shape: "star", colour: "#F2A93B", count: 1, arrangement: "row" }, options: [1, 2, 3], correct_answer: 1, operation: "subtract", operands: [3, 2] },
    ],
    tap_to_count: true, show_number_line: true,
  } as unknown as AnyActivity,

  // -- Find the Star --
  {
    ...base("00000000-0000-0000-0003-000000000008", "tap_correct", "choice", "Find the Star!", {
      learning_area: "mathematics", skills: [SKILL.shape_circle],
      description: "Tap the star shape",
      title_sn: "Tsvaga Nyeredzi!", title_nd: "Thola Umthwana!",
      instruction: "Find the star!",
      tags: ["mathematics"],
    }),
    items: [
      { id: "i1", stimulus: { shape: "star" }, is_correct: true },
      { id: "i2", stimulus: { shape: "circle" }, is_correct: false },
      { id: "i3", stimulus: { shape: "square" }, is_correct: false },
      { id: "i4", stimulus: { shape: "triangle" }, is_correct: false },
    ],
    prompt: { text: { en: "Find the star!", sn: "Tsvaga nyeredzi!", nd: "Thola umthwana!" }, audio: { en: "audio/find_star.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Number Recognition (ECD_B) --
  {
    ...base("00000000-0000-0000-0003-000000000009", "tap_correct", "choice", "Find Number 3", {
      ecd_level: "ECD_B", learning_area: "mathematics", skills: [SKILL.number_recognition],
      description: "Tap the number 3",
      title_sn: "Tsvaga Namba 3", title_nd: "Thola Inombolo 3",
      instruction: "Find the number 3!",
      tags: ["mathematics"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "3" } }, is_correct: true },
      { id: "i2", stimulus: { text: { en: "5" } }, is_correct: false },
      { id: "i3", stimulus: { text: { en: "1" } }, is_correct: false },
      { id: "i4", stimulus: { text: { en: "7" } }, is_correct: false },
    ],
    prompt: { text: { en: "Find number 3!", sn: "Tsvaga namba 3!", nd: "Thola inombolo 3!" }, audio: { en: "audio/find_3.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Count the Flowers (1-5) --
  {
    ...base("00000000-0000-0000-0003-00000000000a", "counting", "counting", "Count the Flowers", {
      learning_area: "mathematics", skills: [SKILL.counting_1_5],
      description: "Count flowers from 1 to 5",
      title_sn: "Verenga Maruva", title_nd: "Bala Imibali",
      instruction: "How many flowers?",
      tags: ["mathematics"],
    }),
    items: [
      { id: "item-1", objects: { shape: "flower", colour: "#FF6B9D", count: 3, arrangement: "grid" }, options: [2, 3, 4], correct_answer: 3 },
      { id: "item-2", objects: { shape: "flower", colour: "#FF6B9D", count: 4, arrangement: "row" }, options: [3, 4, 5], correct_answer: 4 },
      { id: "item-3", objects: { shape: "flower", colour: "#FF6B9D", count: 1, arrangement: "row" }, options: [1, 2, 3], correct_answer: 1 },
    ],
    tap_to_count: true, show_number_line: true,
  } as unknown as AnyActivity,
];
