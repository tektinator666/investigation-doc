---
name: investigation-doc
description: Write a plain-language investigation document for a ServiceNow incident (INC, RITM, PRB), an Azure DevOps (ADO) Bug or PBI, or a Spike. Covers findings with evidence, root cause, workflow diagrams before and after, code fix as diffs, test scenarios, risks, and rollback, readable by junior engineers, PMs, and non-technical stakeholders. Enforces anti-AI-slop writing with a linter. Use when the user asks to investigate, analyze, or document a ticket, bug, incident, PBI, user story, or spike, or asks for root cause analysis, findings, or a write-up.
---

# Investigation doc

Produce one Markdown document that answers a ticket. Anyone can read the top half. Engineers read the whole thing.

Files in this skill:

- `references/template.md`: the master structure. Always start here.
- `references/modes.md`: what changes for Incident, Bug, PBI, and Spike.
- `references/anti-slop.md`: writing rules, banned words and structures, self-score rubric.
- `references/example.md`: a fictional, finished Bug doc. Match its depth and tone. Never copy its facts.
- `scripts/slop-check.mjs`: linter. Node only, no dependencies.

## Workflow

### 1. Pick the mode

Use the signal table at the top of `references/modes.md`. Ask the user only when two modes fit equally.

### 2. Gather evidence before writing

- Read the ticket text the user gives you. If they give only an ID, ask them to paste the description, repro steps, and comments. Do not guess ticket content.
- Search the repo for the code paths named in the ticket: error messages, page names, API routes, config keys.
- Read the code you will discuss. Note exact `file:line` locations.
- For bugs and incidents, run `git log` and `git blame` on the suspect lines to find when the behavior changed.
- Reproduce the problem or run existing tests when the environment allows it. A reproduction moves a claim from "Suspected" to "Confirmed".
- Keep a list of what you checked and ruled out. It goes in the doc.

Stop and tell the user when evidence is too thin for a root cause. Write the doc with "Suspected" labels and a clear "Still unknown" list instead of inventing certainty.

### 3. Write the doc

- Copy the structure of `references/template.md` and apply the mode changes from `references/modes.md`.
- Write the TL;DR last, after every other section is done. Then move it to the top.
- Order inside each section: the plain sentence first, the detail after.
- Draw two Mermaid diagrams: how it works today (failure marked `broken`) and how it works after the fix (changes marked `fixed`). Keep each under 10 nodes. Label nodes with actions a non-engineer understands.
- Diffs: real code only, unified diff format, about 3 lines of context, one block per file, each with a one-sentence "Why". Mark unverified diffs "Sketch, not final".
- Test scenarios: cover the happy path, the exact failing case from the ticket, edges, bad input, and nearby features that could regress.
- Glossary: every acronym and every team-specific term used in the top half.
- Delete every HTML guidance comment from the template before saving.

### 4. Apply the writing rules

Read `references/anti-slop.md` before writing prose. The short version:

- Answer first. One idea per sentence. Target 20 words, cap 25.
- Active voice with a named actor. Numbers with units and time windows instead of adjectives.
- Same term for the same thing everywhere.
- "Confirmed" and "Suspected" labels on every finding.
- No em dashes, emoji, exclamation marks, Title Case headings, or decorative bold.
- No banned words, phrases, openers, or structures from `references/anti-slop.md` sections 2 to 5.
- Never invent numbers, quotes, paths, names, commits, or ticket IDs. Write "Unknown." and how to find out.
- Remove secrets and personal data from any pasted log.

### 5. Lint and fix

```bash
node <this skill's directory>/scripts/slop-check.mjs <path/to/doc.md>
```

Fix every ERROR. Fix every warn unless it is a false positive (for example "navigate" for UI navigation, "unlock" for an account lock, "ensure" for a real guarantee). Run the linter again until it reports 0 errors.

The linter cannot see structural slop: forced lists of three, uniform rhythm, recaps, pull-quote lines, meta-commentary. Reread the doc once for those using `references/anti-slop.md` section 5.

### 6. Self-score

Score the draft with the rubric in `references/anti-slop.md` section 8. Rewrite the weakest dimension if the total is below 40/50.

### 7. Save and report

- Save to `docs/investigations/<ID>-<short-slug>.md` in the repo the ticket belongs to. Follow the repo's own convention if it has one (check `docs/` first). Ask if you are not in a repo.
- In chat, give the user: the file link, the TL;DR in 3 lines, the linter result, the self-score, and any open questions that block the doc.
- Do not paste the whole document into chat.

## Rules that override everything else

- Evidence beats fluency. A short doc with real evidence is better than a long doc with guesses.
- If the fix is unclear, say so in the TL;DR and make "Decision needed" the most visible bullet.
- Do not post to ServiceNow, ADO, or any other system. Writing the file is the whole job unless the user asks for more.
