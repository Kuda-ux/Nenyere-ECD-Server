# Privacy Model — Children's Data

Status: **PROPOSED — requires human legal/compliance review before production.**
Nothing in this document is a legal opinion or a claim of compliance.

## 1. Legal context (research summary, for human verification)

| Instrument | Key points relevant to this platform | Source |
| --- | --- | --- |
| **Cyber and Data Protection Act [Chapter 12:07]** (Act 5 of 2021) | "Child" = under 18. Consent must be given by a competent person (parent/guardian) for a child. POTRAZ is the Data Protection Authority. Data subject rights (s.14) apply to children. | potraz.gov.zw copy of the Act |
| **SI 155 of 2024** — Cyber and Data Protection (Licensing of Data Controllers and Appointment of DPOs) Regulations | Data controllers must be **licensed by POTRAZ** and **appoint a Data Protection Officer**. Children's data: no processing without parent/guardian consent; reasonable efforts to verify consent; regular **DPIAs**; privacy by design and by default; no automated decision-making affecting children's rights. Written data-processing agreements with processors. | potraz.gov.zw SI 155 PDF; DLA Piper Africa summary |
| **CDPG 2 of 2024** — Guideline on Processing of Children's Personal Information | **Written** guardian consent before processing; controllers must verify guardianship (e.g. birth certificate, custody order); consent requests must be clear and age-appropriate; best interests of the child; processing without consent only in listed cases and with notification to the Authority. | veritaszim.net copy |
| **POTRAZ Implementation Guidelines** (incl. DPIA guidance) | DPIA is mandatory when data subjects include vulnerable groups (children) and when new technologies are deployed. | veritaszim.net copy |

**Implications flagged for human decision (H1–H6):**
- **H1** Who is the *data controller*? Most likely Nenyere Day Care Centre (determines purpose) with KuWeX as *processor* — or joint controllers. This decides who must hold the POTRAZ licence and appoint a DPO. Needs legal advice.
- **H2** A written **data processing agreement** between Nenyere and KuWeX is required under SI 155 s.4(f) if KuWeX is a processor.
- **H3** A **DPIA** must be completed before production (children = vulnerable group; new technology). Template stub to be produced in Session 3; content requires the controller's input.
- **H4** Consent must be **written** and guardianship verified. The platform records *that* a written consent exists and who verified it; the paper form stays with the school. Decide whether digital consent is acceptable/required.
- **H5** Cross-border transfer: Supabase and Vercel host data outside Zimbabwe. SI 155 requires notification/authorisation for transfers outside Zimbabwe with a DPIA. Region choice (e.g. Supabase `eu-west` or `af-south` if available) and the transfer basis need legal confirmation.
- **H6** Retention periods (below) are proposals; the controller must set them.

## 2. Data inventory (minimisation applied)

| Data | Collected? | Purpose | Basis (proposed) | Notes |
| --- | --- | --- | --- | --- |
| Learner first name / preferred name | Yes | Identify child in class; audio greeting | Guardian consent | Surname optional, off by default |
| Learner birth month | Yes (month/year) | ECD level placement, age-band reporting | Consent | Full DOB **not** stored (ADR-018) — flag H6 |
| Learner photo | **No** | — | — | Illustrated avatars only |
| Learner address / phone / ID number | **No** | — | — | |
| Medical data | **No** | — | — | Teacher may note accessibility needs in observations only if guardian consents; flag |
| Guardian name + relationship | Yes (name only) | Evidence of consent | Consent record | Contact details **not** stored in MVP; school holds them offline |
| Learning evidence (attempts, responses, mastery) | Yes | Educational purpose; teacher support | Consent + legitimate educational interest | Pseudonymous learner UUID in all logs |
| Teacher observations (free text) | Yes | Educational purpose | Consent | Editor lint warns on sensitive terms |
| Device id, viewport, app version | Yes (technical) | Sync reliability | Legitimate interest | Purged after 90 days |
| Adult staff: email, display name | Yes | Authentication | Contract/legitimate interest | |
| Analytics / advertising identifiers | **No** | — | — | No third-party analytics |

## 3. Privacy by design controls

| Control | Implementation |
| --- | --- |
| Consent gate | Learner is not selectable in Child Mode until `consent_status = granted` (RLS in `learner_picker` view) |
| Withdrawal | Setting `consent_status = withdrawn` hides learner immediately; starts erase workflow after configurable grace (proposal 30 days) |
| Pseudonymisation | Sentry, server logs, `sync_batches`, analytics use `learner_id` UUID only; `beforeSend` scrubber removes names |
| No public exposure | No learner route without an authenticated, authorised session; no share links; reports are generated on demand for authorised users only |
| Access control | RLS per role; teachers see only own classes; CLASSROOM_DEVICE sees picker fields only |
| Audit | All access-affecting and learner-record changes logged |
| Export (DSAR) | `learner_export` produces JSON + printable PDF of all learner data; admin-triggered; logged |
| Erasure | `learner_erase` hard-deletes learner data; keeps anonymous aggregate counts; logged; irreversible with two-step confirmation |
| Retention | Proposals in database.md §6; enforced by scheduled Postgres function (`pg_cron`) |
| Automated decisions | None. Mastery stages are *indicators* shown to teachers; no automated action affects a child. AI excluded from MVP |
| Data location | Choose Supabase/Vercel regions after H5 decision; document in deployment.md |
| Third parties | Supabase (DB/auth/storage), Vercel (hosting), Sentry (errors, scrubbed), GitHub (code, no data). DPAs to be signed (H2) |

## 4. Consent workflow (MVP)

1. School gives guardian the written consent form (template to be produced with
   the school; age-appropriate explanation for the child included per CDPG 2).
2. Guardian signs; school verifies guardianship per its enrolment process.
3. SCHOOL_ADMIN records in the platform: guardian name, relationship,
   `method = paper_on_file`, date, recording staff member. No scan is uploaded
   in MVP (decision H4 may change this; if scans are stored they go to
   `media-private` with signed URLs and a retention rule).
4. Learner becomes active in Child Mode.
5. Withdrawal recorded the same way; triggers hide + erase workflow.

## 5. Privacy-facing UI (in Figma inventory)
- Admin: Consent register (status per learner, filters, evidence fields).
- Admin: Learner data actions (Export, Erase) with confirmations and audit trail.
- Public: Privacy policy page (content supplied by controller; platform provides
  template sections: what we collect, why, where stored, rights, contact/DPO).
- Teacher: banner when a learner's consent is pending/withdrawn.

## 6. Open items for human review
H1–H6 above, plus:
- H7 Whether teachers' free-text observations require additional guardian notice.
- H8 Whether ECD B "picture-PIN" is acceptable (it is not personal data, but confirm).
- H9 Approve retention defaults and the erase grace period.
