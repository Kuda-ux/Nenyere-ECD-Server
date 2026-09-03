import type { AnyActivity } from "../schema";
import { base, SKILL } from "./helpers";

export const socialEmotionalActivities: AnyActivity[] = [
  // -- Happy or Sad? --
  {
    ...base("00000000-0000-0000-0008-000000000001", "tap_correct", "choice", "Happy or Sad?", {
      learning_area: "social_sciences", skills: [SKILL.emotions],
      description: "Identify emotions",
      title_sn: "Kufara kana Kusuruvara?", title_nd: "Ukujabula noma Ukudabuka?",
      instruction: "How does this child feel?",
      instruction_sn: "Mwana anoonekwa akafarisa here?", instruction_nd: "Umntwana uzizwaunjani?",
      tags: ["social-emotional"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "😊 Happy" } }, is_correct: true, alt: { en: "Happy face!" } },
      { id: "i2", stimulus: { text: { en: "😢 Sad" } }, is_correct: false, alt: { en: "Sad face" } },
    ],
    prompt: { text: { en: "This child is smiling. How do they feel?", sn: "Mwana akuseka. Anonzwa seakafara here?", nd: "Umntwana ukhanya ejabulile. Uzizwaunjani?" }, audio: { en: "audio/emotions.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Sharing is Good (ECD_B) --
  {
    ...base("00000000-0000-0000-0008-000000000002", "tap_correct", "choice", "Sharing is Good", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.sharing],
      description: "Learn about sharing",
      title_sn: "Kugoverana Kwakanaka", title_nd: "Ukwabelana Kulungile",
      instruction: "What should Tariro do?",
      tags: ["social-emotional"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🍎 Share with friends" } }, is_correct: true, alt: { en: "Sharing is good!" } },
      { id: "i2", stimulus: { text: { en: "🚫 Keep all alone" } }, is_correct: false, alt: { en: "Don't be selfish" } },
    ],
    prompt: { text: { en: "Tariro has 4 apples. What should she do?", sn: "Tariro anemaapuro mana. Anofanira kuita chii?", nd: "UTariro une ama-apple amane. Kumele enze ntoni?" }, audio: { en: "audio/sharing.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Match Emotions (ECD_B) --
  {
    ...base("00000000-0000-0000-0008-000000000003", "matching", "match", "Match Emotions", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.emotions],
      description: "Match faces to feelings",
      title_sn: "Enzanisa Mafungiro", title_nd: "Fanisa Izinkalo",
      instruction: "Match the face to the feeling!",
      tags: ["social-emotional"],
    }),
    pairs: [
      { id: "p1", left: { text: { en: "😊" } }, right: { text: { en: "Happy" } } },
      { id: "p2", left: { text: { en: "😢" } }, right: { text: { en: "Sad" } } },
      { id: "p3", left: { text: { en: "😠" } }, right: { text: { en: "Angry" } } },
    ],
    layout: "two_column", shuffle_right: true,
  } as unknown as AnyActivity,

  // -- Helping Hands (ECD_B) --
  {
    ...base("00000000-0000-0000-0008-000000000004", "tap_correct", "choice", "Helping Hands", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.sharing, SKILL.community_helpers],
      description: "Learn about helping others",
      title_sn: "Maoko Ekubatsira", title_nd: "Izandla Ezisizayo",
      instruction: "What should you do?",
      tags: ["social-emotional"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🤝 Help your friend" } }, is_correct: true, alt: { en: "Helping is good!" } },
      { id: "i2", stimulus: { text: { en: "🏃 Run away" } }, is_correct: false, alt: { en: "Don't run away" } },
    ],
    prompt: { text: { en: "Your friend fell down. What should you do?", sn: "Shamwari yako yakawa. Unofanira kuita chii?", nd: "Umngane wakho wawe. Kumele enze ntoni?" }, audio: { en: "audio/helping.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,
];
