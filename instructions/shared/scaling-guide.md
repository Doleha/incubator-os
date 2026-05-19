# Scaling Guide — When and Why to Request Headcount

This document is the standard for making headcount decisions. Every director and manager references this guide. Read it carefully before requesting a hire or updating instructions.

---

## The Core Principle

Hiring is an escalation, not a first response. Before you request a hire, you must be confident you have ruled out the less costly interventions. The Board will reject vague or premature hire requests.

---

## Signs of Capacity Overload

You have a capacity problem — not an instructions problem — when you observe these patterns over **at least 3 consecutive heartbeats**:

**Generic reasoning replacing entity-specific analysis.** Your output contains correct-sounding language but doesn't reference the actual entities you reviewed. You write "the founder shows good momentum" instead of "Amira Hassan's readiness score increased from 58 to 71 over 3 sessions, with specific improvement in market understanding following her mentor's introduction to two domain experts."

**Growing task backlog.** You have more entities to review than you can meaningfully address in a single heartbeat. You are processing some founders thoroughly and skimming others, or skipping entities entirely.

**Missing reasoning sections consistently.** You find yourself producing output that states conclusions without the supporting analysis that led to them, not because you forgot, but because there isn't enough inference capacity to reason through every case.

**Identical output structure regardless of entities.** You notice your reports look the same every heartbeat — same structure, same length, similar conclusions — regardless of whether the actual state of your entities has changed. This is the system flattening nuance under load.

---

## Signs of an Instructions Quality Issue

You have an instructions problem — not a capacity problem — when:

**The same specific field or section is consistently missing.** Your output is always missing reasoning for a particular type of decision. This means the instructions didn't make clear what reasoning is required for that specific case, not that you lack capacity.

**Recommendations consistently fall outside your defined scope.** You are making decisions about things that aren't clearly yours. This means your scope boundary wasn't defined sharply enough in your instructions.

**Quality improves when the task type changes but degrades on one specific task type.** You handle most of your responsibilities well but consistently struggle with one category. The instructions for that category likely need to be rewritten with more specificity.

---

## Decision Framework

Before requesting a hire, work through this sequence:

**Step 1 — Identify the symptom.** What specifically is degraded? Which output quality flag appeared? Which entities were processed poorly?

**Step 2 — Diagnose the cause.** Is the same section consistently missing (instructions problem)? Or is quality universally degraded across all entities as volume increases (capacity problem)?

**Step 3 — Apply the lower-cost fix first.** If instructions, update them. If data quality, flag it to the Performance Analyst. If scope, propose a scope reduction to your director.

**Step 4 — Observe 3 heartbeats.** After the fix, run your next 3 heartbeats normally. If quality recovers, the problem is solved. If quality remains degraded despite the fix, you have a capacity problem.

**Step 5 — If capacity is confirmed, build the case.** Document what you observed, what you tried, and why you conclude it is a capacity issue rather than an instructions issue. This documentation is your hire rationale.

---

## Clone vs. Specialist

When you do need to hire, you must decide whether to clone yourself or hire a specialist.

**Clone (same instructions, same role):** Use this when you are doing your job well but have too many entities. Your output quality is high on the entities you do reach, but you can't reach them all. A clone runs the same instructions on a different subset of the workload.

**Specialist (narrower scope, different instructions):** Use this when your role has expanded to encompass two genuinely different professional functions that would benefit from dedicated focus. A Mentor Coordinator who has also been asked to manage curriculum development should request a Curriculum Developer — someone trained specifically for that domain — rather than cloning themselves.

**Test:** Ask whether a professional in your field would consider these two functions the same job. If yes, clone. If a professional would say "those are two different specialties," hire a specialist.

---

## What to Include in a Hire Request

The Board will not approve requests that lack substantive rationale. Your `request_hire` tool call must include:

1. **The specific role and capabilities** — what professional domain this agent will cover
2. **The evidence of need** — what you observed, over how many heartbeats, that demonstrates capacity or capability gap
3. **What you already tried** — confirm you addressed instructions quality before concluding it is a capacity issue
4. **Why a hire resolves it** — how adding this role specifically addresses the gap
5. **The heartbeat interval** — justified by how often the work actually needs to happen
6. **Budget** — use 0 for local inference agents

---

## What Not to Do

**React after one bad run.** A single low-quality output is not evidence of a systemic problem. Wait for the pattern.

**Hire to compensate for unclear instructions.** If your instructions don't tell you clearly what to do, the fix is rewriting the instructions, not adding more agents who will face the same ambiguity.

**Submit vague requests.** "I am overwhelmed and need help" will not be approved. The Board expects specific evidence, specific diagnosis, and a specific solution.

**Let degradation persist for more than 3 heartbeats without action.** If you identify a problem, take action — instructions update, scope reduction, or hire request. Passive degradation is not acceptable.

**Request a hire without consulting your director.** Use `create_task` to brief your director on what you've observed before submitting a hire request. Directors are accountable for the quality of their team's hire requests.

---

## Escalation Thresholds

These are not judgment calls — they are automatic:

- **Escalate to Director:** auto_score below 60 for 2 consecutive runs
- **Escalate to Executive Director:** below 60 for 4 consecutive runs after corrective action was applied
- **Immediate Board notification:** any run below 40, OR cycle_count reaches 3 with no improvement, OR decisions are being approved upstream from a degraded agent

The Board is the final escalation point. There is no unresolvable state. Everything either gets fixed at the level where it's diagnosed or surfaces to the Board with full context: what failed, what was tried, how many cycles, what is recommended.
