/**
 * Seed activities for the Nenyere ECD platform.
 * Covers 10 developmental pillars for ECD A & ECD B learners.
 * Activities support English, ChiShona (sn), and isiNdebele (nd).
 * Each pillar has activities for both ECD_A and ECD_B levels.
 */
import type { AnyActivity } from "../schema";
import { cognitiveActivities } from "./cognitive";
import { preWritingActivities } from "./pre-writing";
import { mathActivities } from "./math";
import { literacyActivities } from "./literacy";
import { indigenousActivities } from "./indigenous";
import { scienceActivities } from "./science";
import { socialStudiesActivities } from "./social-studies";
import { socialEmotionalActivities } from "./social-emotional";
import { creativityActivities } from "./creativity";
import { physicalActivities } from "./physical";
import { seedStories } from "./stories";

export const seedActivities: AnyActivity[] = [
  ...cognitiveActivities,
  ...preWritingActivities,
  ...mathActivities,
  ...literacyActivities,
  ...indigenousActivities,
  ...scienceActivities,
  ...socialStudiesActivities,
  ...socialEmotionalActivities,
  ...creativityActivities,
  ...physicalActivities,
];

export { seedStories };
