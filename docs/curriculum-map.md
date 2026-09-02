# Curriculum Map — Zimbabwe Heritage-Based Curriculum (HBC) 2024–2030, Infant School Module (ECD A / ECD B)

Status: **DRAFT — requires teacher/content validation before content authoring.**

## 1. Sources consulted

| Ref | Source | What it establishes | Confidence |
| --- | --- | --- | --- |
| S1 | MoPSE, *Heritage-Based Curriculum Framework 2024–2030* (consolidated, 31 May 2024) — public copy | Infant School Module = ECD A, ECD B, Grade 1, Grade 2. Six learning areas. Weekly time allocation for ECD A&B: Indigenous Language 4½ h, English 4 h, Mathematics 2½ h, Science & Technology 3 h, Social Sciences 3 h, Physical Education & Arts 3 h (total 20 h). | High |
| S2 | MoPSE Circular (replacement to Circular 4 of 2024) on HBC implementation | Confirms six Infant learning areas; medium of instruction at Infant level is the locally spoken indigenous language; full HBC implementation for ECD A–Grade 6 from 2025. | High |
| S3 | *Infant Science and Technology Syllabus ECD A–Grade 2 (2024–2030)* — public copy | Eight topics and ECD A / ECD B scope & sequence (§4.5). | High for topics; medium for sub-items (OCR of public copy) |
| S4 | *Infant English Language Syllabus ECD A–Grade 2 (2024–2030)* — public copy | Four macro skills (Listening/Observing, Speaking/Signing, Reading/Signing, Writing); ECD A / ECD B scope & sequence (§4.2). | High for skills; medium for sub-items |
| S5 | *Infant Social Science Syllabus (2024–2030)* — topic summary from a secondary index of the MoPSE PDF | Topic list (§4.6). | Medium — sub-topics need validation |
| S6 | *Infant Physical Education and Arts Syllabus (2024–2030)* — secondary index | Topic list (§4.7). | Medium |
| S7 | *Infant Mathematics Syllabus (2024–2030)* — secondary index only | Play-based methodology; strands "numbers, operations, measures, relationships"; 2 h/week for ECD. ECD A/B sub-topics **not verified**. | Low–medium |
| S8 | *Infant Indigenous Languages Syllabus (2024–2030)* — secondary index only | Four macro skills mirror English; detail **not verified**. | Low–medium |
| S9 | Previous-cycle ECD syllabus (2015–2022, "Mathematical Play") | Matching, classification, ordering, pre-number, shapes (circle, square, triangle, rectangle; sides and corners). Used only as **corroboration**. | Corroborative only |

**Rule applied:** where 2024–2030 official wording could not be read directly the
row is marked **VR (VALIDATION REQUIRED)** with the source used. No objective
wording has been invented. The first content task in Session 4 must include a
Nenyere teacher confirming/correcting this map against the printed syllabi held
by the school.

## 2. HBC Infant learning areas → platform domains

| HBC Learning Area (S1) | Domain key | Child-facing tile(s) |
| --- | --- | --- |
| Indigenous Language | `indigenous_language` | Letters & Sounds (locale-aware), Stories |
| English Language | `english_language` | Letters & Sounds, Stories |
| Mathematics | `mathematics` | Numbers, Shapes, Puzzles |
| Science and Technology | `science_technology` | Animals & Nature, Explore |
| Social Sciences | `social_sciences` | Explore (family, community, transport), Stories |
| Physical Education and Arts | `pe_arts` | Colours, Puzzles (fine motor), Explore (music) |

Cross-cutting **development areas** (used in reports; not HBC areas):
`fine_motor`, `hand_eye_coordination`, `listening`, `visual_discrimination`,
`problem_solving`, `communication`, `creativity`, `social_skills`.

## 3. Taxonomy structure

```
learning_area (HBC, 6)
  └── topic (HBC syllabus topic)
        └── objective (HBC scope & sequence item per ECD level; verbatim or VR)
              └── platform skill (what we measure)
                    └── activity (content) — many-to-many with skills
```

`curriculum_objectives.validation_status ∈ {verified, validation_required}` is a
DB column shown in the CMS; unverified objectives are excluded from printed
reports until verified.

## 4. Detailed mapping

Legend: **V** = verified against a public copy of the 2024–2030 syllabus;
**VR** = validation required. Activity type codes per `activity-engine.md`.

### 4.2 English Language (S4)

| HBC skill | ECD A items | ECD B items | Platform skills | Activity types | Status |
| --- | --- | --- | --- | --- | --- |
| Listening / Observing | Sounds in the immediate environment (objects, voices of people, sources of sounds, musical instruments); instructions; stories; yes/no responses | Sounds in immediate environment; vowel sounds; letter sounds; instructions; stories; yes/no responses | `env_sound_recognition`, `people_sounds`, `object_sounds`, `musical_sounds`, `follow_simple_instruction`, `story_listening`, `vowel_sound_recognition` (B), `letter_sound_recognition` (B) | sound_recognition, audio_to_image, image_to_audio, animal_sound, story_interaction, phonics_recognition | V |
| Speaking / Signing | Verbal greetings; names; stories and news; likes/dislikes | Verbal greetings; phonic sounds; interpersonal communication; asking/answering | `greeting_recognition`; oral prompts recorded as **teacher observations** (not auto-scored) | story_interaction prompts, multiple_choice (picture) | V (items); platform can only prompt speaking |
| Reading / Signing | Picture reading; visual discrimination; pre-reading | Picture reading; letter recognition; matching letters; beginning sounds | `picture_recognition`, `visual_discrimination`, `letter_recognition` (B), `beginning_sound` (B) | image_identification, matching, spot_the_difference, tap_correct, phonics_recognition | V skill / VR sub-items |
| Writing | Pre-writing patterns; scribbling; drawing; hand-eye coordination | Writing patterns; tracing; letter-formation readiness | `trace_straight`, `trace_curve`, `trace_zigzag`, `trace_pattern`, `join_dots`, `colour_within` | tracing, joining_dots, colouring, pointing_target | V skill / VR sub-items |

### 4.3 Indigenous Language (S8) — structure verified, content VR

Same four macro skills, keyed by locale (`sn` Shona first for Mbare; `nd`
scaffolded). **All indigenous-language audio/phonics must be recorded and
approved by a competent Shona educator before publishing** — a hard CMS gate
(`requires_language_review = true`).

| Skill | Platform skills | Activity types | Status |
| --- | --- | --- | --- |
| Listening/Observing (Shona) | `sn_env_sounds`, `sn_follow_instruction`, `sn_story_listening` | sound_recognition, story_interaction | VR |
| Speaking/Signing (Shona) | `sn_greeting_recognition`; teacher-observed oral prompts | multiple_choice (picture), story prompts | VR |
| Reading (Shona) | `sn_picture_reading`, `sn_vowel_recognition` (a e i o u) | phonics_recognition, matching | VR (vowel set is linguistically standard; syllabus wording unverified) |
| Writing (Shona) | shares `trace_*` | tracing, joining_dots | VR |

### 4.4 Mathematics (S7 + S9) — wording VR; skills developmentally standard

| Strand | ECD A skills | ECD B skills | Activity types | Status |
| --- | --- | --- | --- | --- |
| Numbers | `one_to_one_correspondence`, `counting_1_5`, `number_recognition_1_5`, `compare_more_less` | `counting_1_10`, `number_recognition_1_10`, `ordinal_first_last`, `number_sequence_1_10` | counting, tap_correct, image_identification, sequence_ordering | VR |
| Operations | *combining* only, no symbols | `addition_within_5`, `subtraction_within_5` (concrete objects) | basic_addition, basic_subtraction, counting | VR — conservative; teacher may raise to 10 |
| Relationships (sort, classify, match, order, pattern) | `sort_by_colour`, `sort_by_shape`, `sort_by_size`, `match_identical`, `ab_pattern` | `sort_two_attributes`, `abc_pattern`, `order_by_size`, `odd_one_out` | sorting, classification, matching, pattern_completion, shape_sorting | VR (S9 corroborates) |
| Shapes & space | `shape_circle_square_triangle`, `position_in_on_under` | `shape_rectangle_oval`, `shape_sides_corners`, `position_left_right_between` | shape_matching, shape_sorting, tap_correct, puzzle, tracing | VR (S9 names the four shapes) |
| Measures | `big_small`, `long_short`, `heavy_light` (visual) | `tall_short`, `full_empty`, `more_fewer` | tap_correct, sorting, multiple_choice | VR |

### 4.5 Science and Technology (S3) — topics V

| HBC topic | ECD A items (S3) | ECD B items (S3) | Platform skills | Activity types | Status |
| --- | --- | --- | --- | --- | --- |
| 1 Health and Hygiene Practices | Body parts; toilet training; hand washing; safe food handling; cleanliness of living spaces; ventilation and sunlight | Bathing and grooming; human body parts; hand washing; toilet habits; food preparation; etiquette; cleanliness; pest control | `body_parts_identify`, `hygiene_sequence`, `clean_unclean_sort` | image_identification, tap_correct, sequence_ordering, sorting | V |
| 2 Food and Nutrition | Sources of food: plants, animals; healthy vs unhealthy snacks | Food groups (grains, dairy, fruits, vegetables); balanced meals; local food sources | `food_source_sort`, `healthy_snack_choice`, `food_group_sort` (B) | sorting, classification, tap_correct | V |
| 3 Crops, Plants and Animals | Plant types/parts; domestic and wild animals; habitats | Vegetable gardening stages; simple food chains | `animal_identify`, `domestic_wild_sort`, `animal_sound_match`, `plant_parts` (B), `seed_to_plant_sequence` (B) | image_identification, matching, animal_sound_recognition, sorting, sequence_ordering | V topic / VR split |
| 4 Environmental Awareness and Conservation | Weather conditions; soil; water | Four seasons; water conservation; natural resources | `weather_identify`, `weather_clothing_match`, `seasons_sequence` (B) | image_identification, matching, sequence_ordering | V topic / VR split |
| 5 Tools, Equipment and Implements | Household and garden tools | Measuring devices; observation tools | `tool_use_match`, `tool_identify` | matching, image_identification | V topic / VR split |
| 6 Energy and Fuels | Sources of energy (sun, fire) | Renewable vs non-renewable (introductory) | `energy_source_identify` | tap_correct | V topic; beyond MVP content |
| 7 Disaster Risk Management and Resilience | Household hazards; safety | Early warning signs; emergency responders | `safe_unsafe_sort`, `responder_identify` (B) | sorting, image_identification | V topic / VR split |
| 8 Educational Technology and Innovation | Everyday digital devices; safe technology usage | Educational software interactions; basic programming concepts | `device_identify`, `safe_device_use`, `simple_sequence_instructions` (B) | image_identification, tap_correct, sequence_ordering | V |

### 4.6 Social Sciences (S5) — VR

| HBC topic | Platform skills | Activity types | Status |
| --- | --- | --- | --- |
| Identity and Family Relationships | `family_members_identify`, `my_school_places`, `roles_at_home` (B) | image_identification, matching, story_interaction | VR |
| National History, Sovereignty and Governance | `national_flag_recognise`, `national_symbols` (B) | image_identification, puzzle (flag jigsaw) | VR — recognition only |
| Heritage and Ubuntu/Unhu/Vumunhu | `sharing_scenarios`, `respect_greetings`, `traditional_objects_identify` (B) | story_interaction, multiple_choice (picture scenarios) | VR |
| Work, Leisure and Creative Industries | `indigenous_games_identify`, `helping_at_home_sort` | image_identification, sorting | VR |
| Transport, Communication and Safety | `transport_identify` (kombi, bus, bicycle, car, truck, train, aeroplane, scotch-cart), `road_safety_signs` (B), `transport_land_air_water_sort` | image_identification, sorting, audio_to_image (vehicle sounds), spot_the_difference | VR |
| Shelter and Environmental Awareness | `shelter_types_identify`, `animal_home_match` | matching, image_identification | VR |
| Health Education and Social Etiquette | `polite_words_scenarios` (overlaps S&T 1) | story_interaction, multiple_choice | VR |
| Career Guidance / Financial Literacy / Social Services | `community_helpers_identify` (nurse, teacher, police, farmer) | image_identification, matching | VR — MVP limited to community helpers |

### 4.7 Physical Education and Arts (S6) — VR

| HBC topic | Platform role | Platform skills | Activity types | Status |
| --- | --- | --- | --- | --- |
| Gymnastics / Play and Game Skills | Screen supports **fine motor + hand-eye** only; gross motor is teacher-led (platform may show movement prompts/songs) | `tap_target_accuracy`, `drag_precision`, `bilateral_tracking` | pointing_target, drag_and_drop, tracing | VR |
| Creative Processes and Performance | Rhythm/sound recognition; colouring; storytelling | `rhythm_pattern_match`, `colour_recognition`, `colour_matching`, `colouring_control`, `story_retell_prompt` | sound_recognition, colour_identification, colouring, pattern_completion (audio), story_interaction | VR |
| History of Arts | Instrument sound → image (mbira, ngoma, hosho) | `instrument_sound_match` | audio_to_image, image_identification | VR — culturally reviewed audio |
| Aesthetic Values and Appreciation | Listening, choosing favourites (unscored) | teacher-observed | story_interaction | VR |
| PE & Arts Technology | Using the app; environmental sounds | `env_sound_recognition` | sound_recognition | VR |

## 5. Nenyere requirement → coverage check

| Requirement | Covered by | Levels |
| --- | --- | --- |
| Pre-writing | Writing → `trace_*` | A, B |
| Joining dots | Writing → `join_dots` | A (3–6 dots), B (6–12) |
| Patterns | Maths Relationships; PE&Arts rhythm | A, B |
| Numbers, counting | Maths Numbers | A (1–5), B (1–10) |
| Matching | Maths; S&T animals; English picture reading | A, B |
| Colouring | PE&Arts → `colouring_control` | A, B |
| Puzzles | Maths shapes/space; Social Sciences (flag) | A (2–4 pieces), B (4–9) |
| Shapes / shape matching / sorting | Maths Shapes, Relationships | A, B |
| Spot the differences | English visual discrimination | A (1–2), B (3–4) |
| Phonics, vowels | English/Indigenous Listening & Reading | B (A: sounds only) |
| Number operations (+/−) | Maths Operations | B |
| Colours | PE&Arts; Maths sorting | A, B |
| Hand-eye coordination, point activities | PE&Arts fine motor | A, B |
| Stories | All language areas; Social Sciences | A, B |
| Transport | Social Sciences Transport | A, B |
| Weather | S&T topic 4 | A, B |
| Animal sounds | S&T topic 3; English Listening | A, B |
| ICT tools | S&T topic 8 | A, B |

All 24 original requirements are covered by at least one verified or VR-flagged
objective.

## 6. Validation actions before Session 4 content authoring

1. Obtain the school's printed 2024–2030 Infant syllabi (Mathematics, Indigenous
   Languages, Social Sciences, PE & Arts) and replace VR rows with verbatim items.
2. Nenyere ECD teachers confirm ECD A vs ECD B splits and the conservative
   operations range (within 5 vs within 10).
3. A Shona-competent educator approves the vowel/phonics set and all Shona audio.
4. Record `curriculum_objectives.validation_status` and `source_ref` in the seed.
