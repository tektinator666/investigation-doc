# investigation-doc

A [Claude Code](https://claude.com/claude-code) skill that writes investigation documents for ServiceNow incidents, Azure DevOps Bugs and PBIs, and Spikes.

The output is one Markdown file. Junior engineers, product managers, and non-technical stakeholders can read the top half. Engineers read the whole thing. A bundled linter blocks the phrases and patterns that make text read as machine-written.

## What the document contains

| # | Section | For |
|---|---|---|
| 1 | Header table: ticket, status, severity, author, related PRs | Everyone |
| 2 | TL;DR: problem, cause, fix, risk, decision needed | Everyone |
| 3 | Who is affected: users, systems, frequency, business impact, workaround | PMs, stakeholders |
| 4 | How it works today: numbered steps and a Mermaid diagram with the failure point marked | Everyone |
| 5 | What we found: root cause, evidence table (Confirmed or Suspected), what was ruled out, confidence | Engineers |
| 6 | Proposed fix: plain summary, after-fix diagram, one diff per file with a "Why" line | Everyone, then engineers |
| 7 | Test scenarios: Given / When / Then table tagged happy path, edge, negative, regression | QA, engineers, PMs |
| 8 | Risks, rollback plan, blast radius | Everyone |
| 9 | Open questions with owners and dates | PMs, stakeholders |
| 10 | Next steps checklist | Everyone |
| 11 | Glossary of every acronym and team term | Junior and non-technical readers |
| 12 | Appendix: raw logs and queries | Engineers |

Each ticket type adds its own sections:

- **Incident (ServiceNow):** customer-facing summary, UTC timeline, workaround, prevention.
- **Bug (ADO):** steps to reproduce, expected vs actual, environment, the commit that introduced it.
- **PBI (ADO):** scope in and out, acceptance criteria mapped to test IDs, dependencies.
- **Spike:** question and timebox, options compared, proof-of-concept results, recommendation, open unknowns, follow-up PBIs.

See [`references/example.md`](references/example.md) for a finished (fictional) Bug document.

## Install

Clone into your personal skills folder:

```bash
git clone https://github.com/tektinator666/investigation-doc.git ~/.claude/skills/investigation-doc
```

On Windows the folder is `%USERPROFILE%\.claude\skills\investigation-doc`.

To share it with a team through one repo, clone it into `<repo>/.claude/skills/investigation-doc` instead.

The linter needs [Node.js](https://nodejs.org) 18 or later. It has no dependencies.

## Use

Start a new Claude Code session and ask for it:

```text
/investigation-doc INC0041234
Investigate ADO bug 4521 and write it up.
Write up the findings for the caching spike.
```

Paste the ticket description, repro steps, and comments when Claude asks. The skill reads the code, checks `git blame` for when the behavior changed, and saves the result to `docs/investigations/<ID>-<slug>.md`.

## The linter

```bash
node ~/.claude/skills/investigation-doc/scripts/slop-check.mjs path/to/doc.md
node ~/.claude/skills/investigation-doc/scripts/slop-check.mjs path/to/doc.md --strict
```

It skips frontmatter, code blocks, inline code, HTML comments, and URLs. It reports `file:line:col` for:

- Banned words and phrases ("delve", "leverage", "it's worth noting", "plays a key role", "serves as") with a plain replacement
- Structures such as "not just X, but Y", trailing "-ing" commentary clauses, slop sentence openers, passive voice, hedge stacks, vague attribution
- Em dashes, emoji, exclamation marks, curly quotes, Title Case headings, too much bold
- Sentences over 25 words (warning) or 30 words (error)
- Acronyms missing from the Glossary
- A missing TL;DR or Glossary section

Exit code 0 means clean. Exit code 1 means errors, or any warning when you pass `--strict`. Edit the lists at the top of the script to fit your team.

## Files

```text
SKILL.md                    Workflow Claude follows
references/template.md      Master document structure
references/modes.md         Changes per ticket type
references/anti-slop.md     Writing rules, banned lists with rewrites, self-score rubric
references/example.md       Finished example document
scripts/slop-check.mjs      Linter
```

## Credits

The writing rules draw on these sources. No text is copied from them.

- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
- [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop)
- [jalaalrd/anti-ai-slop-writing](https://github.com/jalaalrd/anti-ai-slop-writing)
- [U.S. Federal Plain Language Guidelines](https://plainlanguage.gov/guidelines/)
- [Google developer documentation style guide](https://developers.google.com/style)

## License

[MIT](LICENSE)
