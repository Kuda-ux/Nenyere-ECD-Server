import type { AnyActivity } from "../schema";
import { base, SKILL } from "./helpers";

export const indigenousActivities: AnyActivity[] = [
  // -- ChiShona Greetings --
  {
    ...base("00000000-0000-0000-0005-000000000001", "tap_correct", "choice", "ChiShona Greetings", {
      learning_area: "indigenous_language", skills: [SKILL.shona_greetings],
      description: "Learn greetings in ChiShona",
      title_sn: "Mamuka Sei?", title_nd: "Ukujabule Kusasa",
      instruction: "How do we say 'Good morning' in ChiShona?",
      instruction_sn: "Tinoti sei 'Mangwanani' kuChiShona?",
      tags: ["indigenous-language"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "Mangwanani" } }, is_correct: true, alt: { en: "Good morning in Shona" } },
      { id: "i2", stimulus: { text: { en: "Hello" } }, is_correct: false, alt: { en: "English" } },
      { id: "i3", stimulus: { text: { en: "Sawubona" } }, is_correct: false, alt: { en: "Ndebele" } },
    ],
    prompt: { text: { en: "How do we say 'Good morning' in ChiShona?", sn: "Tinoti sei 'Mangwanani' kuChiShona?", nd: "Sithi kanjani 'Sawubona' ngesiNdebele?" }, audio: { en: "audio/shona_greeting.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- isiNdebele Greetings --
  {
    ...base("00000000-0000-0000-0005-000000000002", "tap_correct", "choice", "isiNdebele Greetings", {
      learning_area: "indigenous_language", skills: [SKILL.ndebele_greetings],
      description: "Learn greetings in isiNdebele",
      title_sn: "Kulekwa kuChiShona", title_nd: "Sawubona",
      instruction: "How do we say 'Good morning' in isiNdebele?",
      instruction_nd: "Sithi kanjani 'Sawubona' ngesiNdebele?",
      tags: ["indigenous-language"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "Sawubona" } }, is_correct: true, alt: { en: "Good morning in Ndebele" } },
      { id: "i2", stimulus: { text: { en: "Mangwanani" } }, is_correct: false, alt: { en: "Shona" } },
      { id: "i3", stimulus: { text: { en: "Hello" } }, is_correct: false, alt: { en: "English" } },
    ],
    prompt: { text: { en: "How do we say 'Good morning' in isiNdebele?", sn: "Tinoti sei 'Mangwanani' kuNdebele?", nd: "Sithi kanjani 'Sawubona' ngesiNdebele?" }, audio: { en: "audio/ndebele_greeting.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Animals in ChiShona --
  {
    ...base("00000000-0000-0000-0005-000000000003", "matching", "match", "Animals in ChiShona", {
      learning_area: "indigenous_language", skills: [SKILL.vocabulary, SKILL.animal_identify],
      description: "Match English animals to ChiShona names",
      title_sn: "Zvipfuya kuChiShona", title_nd: "Izilwane NgesiShona",
      instruction: "Match the English name to the ChiShona name!",
      tags: ["indigenous-language", "theme-animals"],
    }),
    pairs: [
      { id: "p1", left: { text: { en: "Cow" } }, right: { text: { en: "Mombe" } } },
      { id: "p2", left: { text: { en: "Dog" } }, right: { text: { en: "Imbwa" } } },
      { id: "p3", left: { text: { en: "Goat" } }, right: { text: { en: "Mbudzi" } } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  // -- Animals in isiNdebele --
  {
    ...base("00000000-0000-0000-0005-000000000004", "matching", "match", "Animals in isiNdebele", {
      learning_area: "indigenous_language", skills: [SKILL.vocabulary, SKILL.animal_identify],
      description: "Match English animals to isiNdebele names",
      title_sn: "Izilwane NgesiNdebele", title_nd: "Izilwane NgesiNdebele",
      instruction: "Match the English name to the isiNdebele name!",
      tags: ["indigenous-language", "theme-animals"],
    }),
    pairs: [
      { id: "p1", left: { text: { en: "Cow" } }, right: { text: { en: "Inkomo" } } },
      { id: "p2", left: { text: { en: "Dog" } }, right: { text: { en: "Inja" } } },
      { id: "p3", left: { text: { en: "Goat" } }, right: { text: { en: "Imbuzi" } } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  // -- Colours in ChiShona (ECD_B) --
  {
    ...base("00000000-0000-0000-0005-000000000005", "matching", "match", "Colours in ChiShona", {
      ecd_level: "ECD_B", learning_area: "indigenous_language", skills: [SKILL.vocabulary, SKILL.colour_identify],
      description: "Match English colours to ChiShona names",
      title_sn: "Mavara kuChiShona", title_nd: "Imibala NgesiShona",
      instruction: "Match the colour to its ChiShona name!",
      tags: ["indigenous-language"],
    }),
    pairs: [
      { id: "p1", left: { text: { en: "Red" } }, right: { text: { en: "Tsvuku" } } },
      { id: "p2", left: { text: { en: "Green" } }, right: { text: { en: "Grini" } } },
      { id: "p3", left: { text: { en: "Blue" } }, right: { text: { en: "Bhuruu" } } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  // -- Numbers in ChiShona (ECD_B) --
  {
    ...base("00000000-0000-0000-0005-000000000006", "matching", "match", "Numbers in ChiShona", {
      ecd_level: "ECD_B", learning_area: "indigenous_language", skills: [SKILL.counting_1_5, SKILL.vocabulary],
      description: "Match English numbers to ChiShona",
      title_sn: "Namba kuChiShona", title_nd: "Izinombolo NgesiShona",
      instruction: "Match the number to its ChiShona name!",
      tags: ["indigenous-language"],
    }),
    pairs: [
      { id: "p1", left: { text: { en: "1 - One" } }, right: { text: { en: "Motsi" } } },
      { id: "p2", left: { text: { en: "2 - Two" } }, right: { text: { en: "Piri" } } },
      { id: "p3", left: { text: { en: "3 - Three" } }, right: { text: { en: "Tatu" } } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,
];
