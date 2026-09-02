-- ============================================================================
-- Seed: Development data
-- Per docs/database.md §7: Nenyere school, admin, teachers, classes, device,
-- curriculum areas, skills, demo learners (fictional, dev only).
-- ============================================================================

-- ── Nenyere school ─────────────────────────────────────────────────────────
insert into public.schools (id, name, slug, locale_default, timezone)
values (
  '00000000-0000-0000-0000-000000000001',
  'Nenyere Day Care Centre',
  'nenyere',
  'en',
  'Africa/Harare'
)
on conflict (slug) do nothing;

-- ── Curriculum areas ───────────────────────────────────────────────────────
insert into public.curriculum_areas (id, key, name_en, name_sn, sort) values
  ('00000000-0000-0000-0000-000000000010', 'english_language', 'English Language', 'Chirungu', 1),
  ('00000000-0000-0000-0000-000000000020', 'indigenous_language', 'Indigenous Language', 'Chikaranga', 2),
  ('00000000-0000-0000-0000-000000000030', 'mathematics', 'Mathematics', 'Masvomhu', 3),
  ('00000000-0000-0000-0000-000000000040', 'science_and_technology', 'Science and Technology', 'Sayansi neVatechno', 4),
  ('00000000-0000-0000-0000-000000000050', 'social_sciences', 'Social Sciences', 'Hupfumi neTsika', 5),
  ('00000000-0000-0000-0000-000000000060', 'physical_education_and_arts', 'Physical Education and Arts', 'Michezo neZvekuumbwa', 6)
on conflict (key) do nothing;

-- ── Classes ────────────────────────────────────────────────────────────────
insert into public.classes (id, school_id, name, ecd_level, academic_year) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'ECD A - Sunrise', 'ECD_A', 2025),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'ECD B - Starlight', 'ECD_B', 2025)
on conflict do nothing;

-- ── Demo learners (fictional — dev/preview only, NOT production) ───────────
insert into public.learners (id, school_id, first_name, preferred_name, birth_month, ecd_level, avatar_key, consent_status) values
  ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000001', 'Tariro', 'Tari', '2021-01-01', 'ECD_A', 'star', 'granted'),
  ('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000001', 'Tinashe', 'Tina', '2021-03-01', 'ECD_A', 'elephant', 'granted'),
  ('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000001', 'Rumbidzai', 'Rumbi', '2020-06-01', 'ECD_B', 'lion', 'granted'),
  ('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000001', 'Kudzai', 'Kuds', '2020-09-01', 'ECD_B', 'bird', 'pending')
on conflict do nothing;

-- ── Enrollments ────────────────────────────────────────────────────────────
insert into public.enrollments (school_id, learner_id, class_id, start_date) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000101', '2025-01-13'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000101', '2025-01-13'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000102', '2025-01-13'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000102', '2025-01-13')
on conflict do nothing;

-- ── Skills (sample — full set in curriculum-map.md) ───────────────────────
insert into public.skills (id, key, area_id, development_areas, name, mastery_window) values
  ('00000000-0000-0000-0000-000000000a01', 'fine_motor_tracing', '00000000-0000-0000-0000-000000000060', '{"physical"}', '{"en": "Pre-writing: Tracing lines"}', 5),
  ('00000000-0000-0000-0000-000000000a02', 'counting_1_5', '00000000-0000-0000-0000-000000000030', '{"cognitive"}', '{"en": "Counting 1-5"}', 5),
  ('00000000-0000-0000-0000-000000000a03', 'counting_1_10', '00000000-0000-0000-0000-000000000030', '{"cognitive"}', '{"en": "Counting 1-10"}', 5),
  ('00000000-0000-0000-0000-000000000a04', 'colour_identification', '00000000-0000-0000-0000-000000000040', '{"cognitive"}', '{"en": "Colour identification"}', 5),
  ('00000000-0000-0000-0000-000000000a05', 'shape_recognition', '00000000-0000-0000-0000-000000000030', '{"cognitive"}', '{"en": "Shape recognition"}', 5),
  ('00000000-0000-0000-0000-000000000a06', 'phonics_vowels', '00000000-0000-0000-0000-000000000010', '{"literacy"}', '{"en": "Phonics: Vowel sounds"}', 5),
  ('00000000-0000-0000-0000-000000000a07', 'listening_comprehension', '00000000-0000-0000-0000-000000000010', '{"literacy"}', '{"en": "Listening comprehension"}', 5),
  ('00000000-0000-0000-0000-000000000a08', 'animal_recognition', '00000000-0000-0000-0000-000000000040', '{"cognitive"}', '{"en": "Animal recognition"}', 5),
  ('00000000-0000-0000-0000-000000000a09', 'pattern_recognition', '00000000-0000-0000-0000-000000000030', '{"cognitive"}', '{"en": "Pattern recognition (ABAB)"}', 5),
  ('00000000-0000-0000-0000-000000000a10', 'social_sharing', '00000000-0000-0000-0000-000000000050', '{"social"}', '{"en": "Social: Sharing"}', 5)
on conflict (key) do nothing;
