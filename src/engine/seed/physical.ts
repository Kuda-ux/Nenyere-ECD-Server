import type { AnyActivity } from "../schema";
import { base, SKILL } from "./helpers";

export const physicalActivities: AnyActivity[] = [
  // -- Find Red! (Physical coordination) --
  {
    ...base("00000000-0000-0000-000a-000000000001", "tap_correct", "choice", "Jump to the Colour!", {
      learning_area: "physical_education_and_arts", skills: [SKILL.coordination, SKILL.colour_red],
      description: "Tap the colour and jump!",
      title_sn: "Tembera Ruwara! ", title_nd: "Tinta Umbala!",
      instruction: "Tap the colour you see!",
      tags: ["physical"],
    }),
    items: [
      { id: "i1", stimulus: { colour: "#E85D5D" }, is_correct: true, alt: { en: "Red - jump!" } },
      { id: "i2", stimulus: { colour: "#5BA85B" }, is_correct: false, alt: { en: "Green" } },
    ],
    prompt: { text: { en: "Tap RED and jump!", sn: "Bata tsvuku wobva wachambuka!", nd: "Tinta okubomvu bese ugaxa!" }, audio: { en: "audio/jump_colour.mp3" } },
    layout: "grid", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Body Movement (ECD_B) --
  {
    ...base("00000000-0000-0000-000a-000000000002", "tap_correct", "choice", "Move Your Body!", {
      ecd_level: "ECD_B", learning_area: "physical_education_and_arts", skills: [SKILL.coordination],
      description: "Learn body movements",
      title_sn: "Tembera Muviri Wako!", title_nd: "Shukumisa Umzimba Wakho!",
      instruction: "What can your arms do?",
      tags: ["physical"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "🙌 Reach up high!" } }, is_correct: true, alt: { en: "Reach up!" } },
      { id: "i2", stimulus: { text: { en: "😴 Go to sleep" } }, is_correct: false, alt: { en: "Not now" } },
    ],
    prompt: { text: { en: "What can your arms do?", sn: "Maoko ako anogona kuita chii?", nd: "Izandla zakho zingakwazi ukwenzani?" }, audio: { en: "audio/body_move.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,

  // -- Clap the Beat (ECD_B) --
  {
    ...base("00000000-0000-0000-000a-000000000003", "tap_correct", "choice", "Clap the Beat!", {
      ecd_level: "ECD_B", learning_area: "physical_education_and_arts", skills: [SKILL.coordination, SKILL.dance],
      description: "Clap to the rhythm",
      title_sn: "Tsvoda Nguva!", title_nd: "Qhweba Isiginci!",
      instruction: "When the music plays, what do we do?",
      tags: ["physical"],
    }),
    items: [
      { id: "i1", stimulus: { text: { en: "👏 Clap!" } }, is_correct: true, alt: { en: "Clap to the beat!" } },
      { id: "i2", stimulus: { text: { en: "🤫 Be quiet" } }, is_correct: false, alt: { en: "Don't be quiet" } },
    ],
    prompt: { text: { en: "Listen to the beat. What should we do?", sn: "Teerera nguva. Tinofanira kuita chii?", nd: "Lalele isiginci. Kumele sizenze ntoni?" }, audio: { en: "audio/clap_beat.mp3" } },
    layout: "row", show_correct_after_attempts: 3,
  } as unknown as AnyActivity,
];
