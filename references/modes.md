# Mode variants

Start from `template.md`. Each mode below lists what to add, change, or drop, and where it goes.

## How to pick the mode

| Signal in the request | Mode |
|---|---|
| `INC`, `RITM`, `PRB`, `CHG` ticket number, "incident", "outage", "ServiceNow", "SNOW" | Incident |
| "bug", "defect", ADO work item of type Bug, a stack trace, "broken", "regression" | Bug |
| "PBI", "user story", "feature", "acceptance criteria", "requirement" | PBI |
| "spike", "investigate options", "feasibility", "research", "should we use X", "timebox" | Spike |

If two modes fit, ask the user once. A problem ticket (`PRB`) behind an incident uses Incident mode.

---

## Incident (ServiceNow)

Goal: restore trust. Readers include support staff and customer-facing teams.

**Add after "Who is affected":**

```markdown
## Customer-facing summary

<!-- 2 to 3 sentences. Zero jargon. Safe to paste into a customer email or status page.
No blame, no internal system names, no guesses presented as fact. -->

## Timeline

<!-- All times in UTC, 24-hour clock. One row per event. Facts only. -->

| Time (UTC) | Event |
|---|---|
| 2026-10-01 08:14 | First customer report (INC0041234) |
| 2026-10-01 08:40 | On-call engineer confirms the issue |
| 2026-10-01 09:05 | Workaround shared with support |

## Workaround

<!-- Steps support staff can give a user today. "None" if there is none. -->
```

**Add after "Risks and rollback":**

```markdown
## Prevention

<!-- What stops this class of problem from happening again: alert, test, guard, process change.
Each item becomes a "Next steps" checkbox with an owner. -->
```

**Change:** the header table gets `Priority (P1-P4)`, `Assignment group`, and `Affected CI` rows.

---

## Bug (Azure DevOps)

Goal: make the bug easy to reproduce, fix, and verify.

**Add before "How it works today":**

```markdown
## Steps to reproduce

1. <step>
2. <step>

**Expected:** <what should happen>
**Actual:** <what happens>

| Environment | Value |
|---|---|
| App version / build | <value> |
| Browser / OS / device | <value> |
| Data or account needed | <value, no real customer data> |
```

**Add inside "What we found", after "Evidence":**

```markdown
### When it started

<!-- The commit, PR, or release that introduced the bug, found with git log / git blame.
"Unknown" is allowed. Say what you checked. -->
```

**Change:** the header table gets `Area path`, `Iteration`, and `Found in build` rows.

---

## PBI (Azure DevOps)

Goal: agree on what "done" means before coding. Often written before any bug exists.

**Rename:** "What we found" becomes "What we learned about the current system". "Root cause" becomes "Gap" (what the system cannot do today).

**Add after "Who is affected":**

```markdown
## Scope

**In scope:**
- <item>

**Out of scope:**
- <item, with the reason or the follow-up ticket>

## Acceptance criteria

<!-- Each criterion maps to at least one test ID in "Test scenarios". Write them so a PM can tick them off. -->

| AC | The system must... | Test IDs |
|---|---|---|
| AC1 | <behavior> | T1, T2 |
| AC2 | <behavior> | T3 |

## Dependencies

| Depends on | Owner | Status |
|---|---|---|
| <team, API, ticket> | <owner> | <status> |
```

**Change:** every test row in "Test scenarios" names the AC it covers in the Scenario column, e.g. "AC1: ...".

---

## Spike

Goal: answer one question inside a timebox and make a recommendation someone can approve.

**Replace the TL;DR bullets with:**

```markdown
- **Question:** <the one question this spike answers>
- **Answer:** <short answer, or "Partly answered" plus what is missing>
- **Recommendation:** <option name>, because <one reason>.
- **Effort if approved:** <estimate and unit, e.g. "8-12 dev days">
- **Decision needed:** <who approves what, by when>
```

**Add after "Who is affected":**

```markdown
## The question and the timebox

- **Question:** <exact question>
- **Why we asked:** <the business reason>
- **Timebox:** <N days>, used <M days>
- **Not in this spike:** <items left out on purpose>
```

**Replace "What we found" and "Proposed fix" with:**

```markdown
## Options compared

<!-- 2 to 4 real options. Always include "Do nothing" when it is a real choice.
Use the same criteria for every option. Give numbers where you have them. -->

| Criteria | Option A: <name> | Option B: <name> | Do nothing |
|---|---|---|---|
| Effort | | | |
| Risk | | | |
| Running cost | | | |
| Fits current stack | | | |
| Reversible | | | |

## What we tried

<!-- Proof of concept results. Link the branch. Show the key diff or snippet, not the whole POC.
Report what failed too. -->

## Recommendation

<!-- Option name, the deciding reason, and the conditions under which you would change your mind. -->

### How it would work

<!-- Mermaid diagram of the recommended design. -->

### Code sketch

<!-- Short diff or snippet showing the shape of the change. Mark it "Sketch, not final". -->

## Still unknown

<!-- What the spike could not answer, and how to find out. -->

## Follow-up work

| Proposed PBI | Size | Notes |
|---|---|---|
| <title> | S/M/L | <note> |
```

**Change:** "Test scenarios" becomes "How we would test it" and lists the scenarios the follow-up PBIs must cover.
