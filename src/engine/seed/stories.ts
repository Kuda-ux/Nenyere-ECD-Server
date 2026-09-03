import type { AnyActivity } from "../schema";
import { base, SKILL } from "./helpers";

export const seedStories: AnyActivity[] = [
  // -- The Hungry Caterpillar --
  {
    ...base("00000000-0000-0000-0006-000000000001", "story_interaction", "story", "The Hungry Caterpillar", {
      learning_area: "english_language", skills: [SKILL.story],
      description: "A story about a caterpillar eating food", scoring_method: "completion", duration: 120,
      title_sn: "Gonye Rinenzara", title_nd: "Inyebele Enilambalanga",
      tags: ["stories"],
    }),
    pages: [
      { id: "pg1", image: { en: "img/stories/caterpillar/pg1.png" }, narration: { en: "audio/stories/caterpillar/pg1.mp3" }, text: { en: "Once there was a little caterpillar. He was very hungry!", sn: "Paive gonye diki. Raive nenzara!", nd: "Bekutholwa inyebele encane. Belambile kakhulu!" } },
      { id: "pg2", image: { en: "img/stories/caterpillar/pg2.png" }, narration: { en: "audio/stories/caterpillar/pg2.mp3" }, text: { en: "He ate one apple. But he was still hungry!", sn: "Rakadya aple rimwe. Asi rakange richiri nenzara!", nd: "Wadla i-apple elilodwa. Kodwa besagula nendzala!" } },
      { id: "pg3", image: { en: "img/stories/caterpillar/pg3.png" }, narration: { en: "audio/stories/caterpillar/pg3.mp3" }, text: { en: "Then he ate two pears. Was he still hungry?" }, interaction: { type: "tap_correct", choices: [{ id: "ch1", text: { en: "Yes!" }, is_correct: true }, { id: "ch2", text: { en: "No" }, is_correct: false }] } },
      { id: "pg4", image: { en: "img/stories/caterpillar/pg4.png" }, narration: { en: "audio/stories/caterpillar/pg4.mp3" }, text: { en: "Now he was a big, beautiful butterfly! The End.", sn: "Iye zvino rave shavishavi hombe rakanaka! Pakazopera.", nd: "Manje sebeyibhabhathi enkulu enhle! Sekupheleni." } },
    ],
    auto_advance: false, auto_advance_delay_ms: 2000,
  } as unknown as AnyActivity,

  // -- Sharing is Caring --
  {
    ...base("00000000-0000-0000-0006-000000000002", "story_interaction", "story", "Sharing is Caring", {
      learning_area: "social_sciences", skills: [SKILL.story, SKILL.sharing],
      description: "A story about sharing with friends", scoring_method: "completion", duration: 90,
      title_sn: "Kugoverana Kurudo", title_nd: "Ukwabelana Kuthanda",
      tags: ["stories"],
    }),
    pages: [
      { id: "pg1", image: { en: "img/stories/sharing/pg1.png" }, narration: { en: "audio/stories/sharing/pg1.mp3" }, text: { en: "Tariro had three oranges. Her friend Tendai had none.", sn: "Tariro aine maorenji matatu. Shamwari yake Tendai aive pasina.", nd: "UTariro abenama-oranges amathathu. Umngane wakhe uTendai ebengenalutho." } },
      { id: "pg2", image: { en: "img/stories/sharing/pg2.png" }, narration: { en: "audio/stories/sharing/pg2.mp3" }, text: { en: "What should Tariro do?" }, interaction: { type: "tap_correct", choices: [{ id: "ch1", text: { en: "Share with Tendai" }, is_correct: true }, { id: "ch2", text: { en: "Eat all alone" }, is_correct: false }] } },
      { id: "pg3", image: { en: "img/stories/sharing/pg3.png" }, narration: { en: "audio/stories/sharing/pg3.mp3" }, text: { en: "Tariro shared her oranges. They were both happy! The End.", sn: "Tariro akagoverana maorenji ake. Vose vakafara! Pakazopera.", nd: "UTariro wabelana ama-oranges akhe. Bobabili bajabule! Sekupheleni." } },
    ],
    auto_advance: false, auto_advance_delay_ms: 2000,
  } as unknown as AnyActivity,

  // -- The Clever Hare --
  {
    ...base("00000000-0000-0000-0006-000000000003", "story_interaction", "story", "The Clever Hare", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.story, SKILL.zimbabwe_identity],
      description: "A traditional Zimbabwean tale", scoring_method: "completion", duration: 150,
      title_sn: "Tsuro Yakangwara", title_nd: "Insimbimbi Ekhokhle",
      tags: ["stories"],
    }),
    pages: [
      { id: "pg1", image: { en: "img/stories/hare/pg1.png" }, narration: { en: "audio/stories/hare/pg1.mp3" }, text: { en: "Long ago, Hare and Elephant had a race. Elephant was big and strong.", sn: "Kare kare, Tsuro naNzou vakaita mujaho. Nzou huru uye wakasimba.", nd: "Kudala, Insimbimbi neZindlovu bagijana. Zindlovu bekulukhulu benamehlo." } },
      { id: "pg2", image: { en: "img/stories/hare/pg2.png" }, narration: { en: "audio/stories/hare/pg2.mp3" }, text: { en: "Who do you think won the race?" }, interaction: { type: "tap_correct", choices: [{ id: "ch1", text: { en: "Hare" }, is_correct: true }, { id: "ch2", text: { en: "Elephant" }, is_correct: false }] } },
      { id: "pg3", image: { en: "img/stories/hare/pg3.png" }, narration: { en: "audio/stories/hare/pg3.mp3" }, text: { en: "Clever Hare won by being smart, not strong. The End.", sn: "Tsuro yakangwara yakahwina nokuchenjera, kwete nesimba. Pakazopera.", nd: "Insimbimbi elikhokhle waphumelela ngokuhlakanipha, hhayi ngamandla. Sekupheleni." } },
    ],
    auto_advance: false, auto_advance_delay_ms: 2000,
  } as unknown as AnyActivity,

  // -- The River that Saved the Village --
  {
    ...base("00000000-0000-0000-0006-000000000004", "story_interaction", "story", "The River that Saved the Village", {
      ecd_level: "ECD_B", learning_area: "social_sciences", skills: [SKILL.story, SKILL.zimbabwe_identity],
      description: "A Zimbabwean story about community and water", scoring_method: "completion", duration: 150,
      title_sn: "Rwizi Rwaponesa Misha", title_nd: "Umlamula Osindise Isigodi",
      tags: ["stories"],
    }),
    pages: [
      { id: "pg1", image: { en: "img/stories/river/pg1.png" }, narration: { en: "audio/stories/river/pg1.mp3" }, text: { en: "There was a village far from any river. The people were thirsty.", sn: "Paive nomusha kure nerwizi. Vanhu vaiva nenyota.", nd: "Bekusikhona isigodi sikude nalomlamula. Abantu belomthiriso." } },
      { id: "pg2", image: { en: "img/stories/river/pg2.png" }, narration: { en: "audio/stories/river/pg2.mp3" }, text: { en: "What should the village do?" }, interaction: { type: "tap_correct", choices: [{ id: "ch1", text: { en: "Work together to dig a well" }, is_correct: true }, { id: "ch2", text: { en: "Wait for rain and do nothing" }, is_correct: false }] } },
      { id: "pg3", image: { en: "img/stories/river/pg3.png" }, narration: { en: "audio/stories/river/pg3.mp3" }, text: { en: "Everyone worked together. They found water! The village was saved. The End.", sn: "Vose vakabatirana. Vakawana mvura! Musha waponeswa. Pakazopera.", nd: "Bonke basebendzana. Bathola amanzi! Isigodi sasindiswa. Sekupheleni." } },
    ],
    auto_advance: false, auto_advance_delay_ms: 2000,
  } as unknown as AnyActivity,

  // -- The Kind Farmer --
  {
    ...base("00000000-0000-0000-0006-000000000005", "story_interaction", "story", "The Kind Farmer", {
      learning_area: "social_sciences", skills: [SKILL.story, SKILL.sharing],
      description: "A story about kindness and farming in Zimbabwe", scoring_method: "completion", duration: 100,
      title_sn: "Mudzimu Mutsvene", title_nd: "Umlimi Onothando",
      tags: ["stories"],
    }),
    pages: [
      { id: "pg1", image: { en: "img/stories/farmer/pg1.png" }, narration: { en: "audio/stories/farmer/pg1.mp3" }, text: { en: "Gogo Rumbi was a kind farmer. She grew maize and vegetables.", sn: "Gogo Rumbi aive mudzimu mupfumi. Aimirira chibage nemirichi.", nd: "UGogo Rumbi beyingumlimi onothando. Walima umbila nemifino." } },
      { id: "pg2", image: { en: "img/stories/farmer/pg2.png" }, narration: { en: "audio/stories/farmer/pg2.mp3" }, text: { en: "One day, a hungry child came to her farm. What did Gogo do?" }, interaction: { type: "tap_correct", choices: [{ id: "ch1", text: { en: "Give the child food" }, is_correct: true }, { id: "ch2", text: { en: "Send the child away" }, is_correct: false }] } },
      { id: "pg3", image: { en: "img/stories/farmer/pg3.png" }, narration: { en: "audio/stories/farmer/pg3.mp3" }, text: { en: "Gogo Rumbi gave the child food and seeds. The child grew up to be a kind farmer too! The End.", sn: "Gogo Rumbi akapa mwana chokudya nhodzi. Mwana akakura ave mudzimu mupfumiwo! Pakazopera.", nd: "UGogo Rumbi wapha umntwana ukudla nembezu. Umntwana wakhula waba ngumlimi onothando naye! Sekupheleni." } },
    ],
    auto_advance: false, auto_advance_delay_ms: 2000,
  } as unknown as AnyActivity,
];
