---
name: spec-driven-development
description: Use this skill whenever asked to build or add a new feature. Instead of jumping straight to code, it first searches the project to establish what already exists and what's actually missing, then writes a short implementation spec that follows the codebase's existing conventions, and always stops for explicit approval before writing any implementation code. After implementation, it enforces regression testing — establishing a test baseline before changes and re-confirming it after, not just adding tests for the new feature in isolation. Trigger this for requests like "add a feature that...", "build a page/endpoint for...", "implement X", or similar new-feature asks — not for bug fixes (see log-driven-debugging for that) and not for trivial one-line changes.
---

# Spec-Driven Development (with regression testing)

## Why this workflow exists

Two failure modes this is built to prevent:

1. **Building something that already half-exists**, or that ignores the
   project's existing patterns, because the request went straight from prompt
   to code without checking what's already there.
2. **"It works on my new feature" being mistaken for "nothing broke"** —
   regression testing means proving the *existing* behavior still holds, not
   just that the new code passes its own tests.

The workflow: **analyze → spec → approve → implement → regression-test.** The
approval gate exists so design decisions get caught on paper, before they're
implemented — spending five minutes reviewing a spec is cheaper than
undoing code.

## Step 1 — Understand the request

If the request is genuinely ambiguous on scope (e.g. it's unclear which user
roles this applies to, or whether it needs a UI as well as a backend), ask 1-2
targeted questions before proceeding. Don't guess on something that changes
the shape of the whole spec — but don't over-ask either; if a reasonable
default is obvious, state the assumption in the spec instead of stopping to
ask.

## Step 2 — Search the project before designing anything

Before writing a single line of the spec, actually look:

- **Does something like this already exist?** Search for similar
  models/controllers/routes/views. Half-built or adjacent functionality
  changes the spec from "build X" to "extend X."
- **What conventions does this codebase already use?** Look at a few existing
  files in the area being touched: naming patterns, validation style,
  authorization pattern (e.g. role checks like `abort_unless(...)`),
  how state changes get recorded (e.g. an existing audit-logging service
  called from controllers), how errors get logged (e.g. an existing
  event-logging service/channel), how responses are returned
  (`back()->with(...)`, JSON, etc.). Match these rather than introducing a new
  pattern — and if a new pattern genuinely seems warranted, call that out
  explicitly in the spec rather than slipping it in silently.
- **What data model already supports this?** Check existing migrations/models
  for fields or relationships that already cover part of the ask.
- **What tests already exist near this area?** Note them — they matter in
  Step 3.

## Step 3 — Establish a regression baseline

Before any implementation, run the existing automated tests that touch the
area being changed (or the full suite, if it's fast enough to run in full).
Record what currently passes and what's already failing/skipped independent
of this work. This baseline is what Step 6 gets compared against — without
it, there's no way to tell whether a post-implementation failure is a
regression this work caused, or a pre-existing issue.

## Step 4 — Write the spec

Keep it concise but complete. Use this structure:

```
## Spec: <feature name>

**Goal:** <what this should do, in plain terms>

**Existing state:** <what's already in the codebase that's relevant —
reused models/controllers/patterns, found in Step 2>

**Gaps:** <what doesn't exist yet and needs to be built>

**Proposed design:**
- <design decisions — note explicitly where an existing convention is being
  followed vs. where something new is being introduced, and why>

**Data model changes:** <new/modified migrations, models, relationships —
or "none">

**Files to add/modify:**
- <list, grouped by new vs. modified>

**Edge cases & validation:** <list>

**Out of scope:** <explicitly excluded items, so scope doesn't silently grow>

**Regression test plan:**
- Existing flows touched: <list + why each is at risk>
- Baseline (Step 3 result): <pass/fail state of existing related tests,
  before any changes>
- New test cases to add: <list, covering the feature's acceptance criteria>
```

## Step 5 — Stop and get approval

Present the spec and wait. Do not write any implementation code until it's
explicitly approved. If feedback comes back requesting changes, revise the
spec and present it again rather than starting to implement a partially-agreed
version.

If, partway through implementation, something is discovered that the spec
didn't account for (Step 2 missed something, or a requirement turns out to be
harder/different than expected), stop, update the spec with the change, and
get re-approval before continuing — don't silently deviate from what was
agreed.

## Step 6 — Implement per the approved spec

Follow the conventions identified in Step 2. Build only what's in the spec's
"Gaps" section — reuse what Step 2 found rather than re-building it.

## Step 7 — Write regression tests for the new feature

Add automated tests (matching whatever framework the project already uses,
e.g. Pest/PHPUnit for a Laravel project) covering the acceptance criteria
listed in the spec's "New test cases to add" section — not just a happy path,
but the edge cases called out in Step 4.

## Step 8 — Re-run the full regression baseline

Run the same tests from Step 3, plus the new ones from Step 7. Compare
against the Step 3 baseline specifically:

- Anything that passed before and now fails is a regression this work
  introduced — fix it before considering the feature done, don't just note it.
- Anything that was already failing before (per the Step 3 baseline) and is
  still failing is a pre-existing issue, not something this work is on the
  hook for — but worth flagging separately rather than silently ignoring.
- All new tests from Step 7 should pass.

Report the before/after comparison, not just a final "tests pass."
