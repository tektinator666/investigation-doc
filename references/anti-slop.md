# Writing rules: plain language and no AI slop

Two goals. A reader outside the team understands the doc on first read. No sentence sounds machine-written.
`scripts/slop-check.mjs` catches most items below. The structural items need a human-style reread.

Sources: Wikipedia "Signs of AI writing" (WP:AISIGNS), hardikpandya/stop-slop, jalaalrd/anti-ai-slop-writing,
U.S. Federal Plain Language Guidelines (plainlanguage.gov), Google developer documentation style guide,
BLUF (bottom line up front) report writing.

---

## 1. Plain language rules

| Rule | Do | Do not |
|---|---|---|
| Put the answer first | "The reset link expires early because the server compares local time to UTC." | Three paragraphs of background, then the cause. |
| One idea per sentence | Two short sentences. | One sentence joined with "and", "which", "while". |
| Short sentences | Target 20 words. Cap 25. | 40-word sentences with nested clauses. |
| Active voice, named actor | "The API rejects the token." | "The token is rejected." |
| Concrete numbers | "Fails for 1 in 40 requests since 2026-09-28." | "Fails frequently in some cases." |
| Same word, same thing | Pick "token" and keep it. | "token", then "key", then "credential" for the same thing. |
| Define terms | "CDN (the network that caches our images)" plus a Glossary row. | Unexplained acronyms. |
| Everyday words | use, start, help, about, because | utilize, commence, facilitate, regarding, due to the fact that |
| Facts vs guesses | "Confirmed:" / "Suspected:" labels. | Guesses written as facts. |
| Imperative for steps | "Restart the worker." | "The worker should be restarted." |
| Sentence-case headings | "How it works today" | "How It Works Today" |
| Lists for parallel items | Steps, options, risks. | Lists for reasoning that needs connecting words. |

**Layering.** Write each section so its first sentence works alone. A stakeholder reads first sentences only. An engineer reads everything.

**Numbers.** Always give the unit and the time window. "p95 latency 1.8 s over the last 7 days", not "latency is high".

**Unknowns.** Write "Unknown." and then how to find out. Never fill a gap with a plausible guess.

---

## 2. Banned words

Errors in `slop-check.mjs`. Replace with the plain word or delete.

| Do not write | Write instead |
|---|---|
| delve | look at, check |
| tapestry, landscape (metaphor), realm | delete, or name the actual area |
| testament to | shows |
| pivotal, crucial, vital | say the consequence: "without this, payments fail" |
| intricate, multifaceted | complex, or list the parts |
| meticulous | careful |
| utilize, leverage (verb) | use |
| seamless | say what does not break |
| holistic, comprehensive | whole, full, or list what is covered |
| robust (outside a precise technical claim) | say what it survives: retries, bad input, 10x load |
| foster, empower, elevate, unlock (metaphor) | help, let, improve, allow |
| showcase, highlight, underscore | show |
| bolster, garner, embark | support, get, start |
| enhance | improve, or say what changes |
| streamline | simplify, cut N steps |
| moreover, furthermore, additionally | delete, or "also" |
| paradigm, synergy, game-changer, cutting-edge, groundbreaking, transformative | delete |
| myriad, plethora, various, numerous | the count, or name them |
| significantly | the number |
| basically, essentially, actually, really, very, quite, ultimately, notably | delete |

## 3. Banned phrases

| Do not write | Write instead |
|---|---|
| It's worth noting that... / It's important to note... | State the fact. |
| plays a key/crucial/pivotal role in | Say what it does. |
| serves as / stands as / functions as | is |
| In today's fast-paced... | Delete. |
| Let's dive in / deep dive | Delete / "investigation". |
| In conclusion / In summary / Overall / All in all | Delete the recap. |
| When it comes to | for |
| Due to the fact that | because |
| In order to | to |
| At this point in time | now |
| A wide range of / a diverse array of | The count, or name them. |
| Rest assured / I hope this helps / Great question | Delete. |
| may potentially / could possibly | One hedge, or the likelihood. |
| It seems / it appears / we believe | What the evidence shows, or "Suspected:" plus the reason. |

## 4. Banned sentence openers

Certainly, Absolutely, Indeed, Notably, Importantly, Interestingly, Ultimately, Essentially, Overall, Simply put, That said, Of course, Crucially, Moreover, Furthermore, Additionally.

Start with the subject instead: "The worker...", "Users in Australia...".

## 5. Banned structures

These are the strongest tells. The linter catches some. Reread for the rest.

| Pattern | Slop example | Plain rewrite |
|---|---|---|
| Negative parallelism | "This is not just a bug fix, but a reliability improvement." | "This fix stops the duplicate charges." |
| "It's not X, it's Y" | "It's not a network problem; it's a caching problem." | "The cache returns stale data. The network is healthy (see evidence 3)." |
| Forced rule of three | "fast, reliable, and scalable" | Keep only the item you can prove. |
| Trailing "-ing" commentary | "We added a retry, ensuring reliability." | "We added a retry. It recovers from the 2-second outages seen in the logs." |
| Copula avoidance | "The cache serves as the source of truth." | "The cache is the source of truth." |
| Rhetorical question opener | "Why does this matter? Because..." | "This matters because..." |
| Section-ending recap | "Overall, these changes improve stability." | Delete. The section already said it. |
| Pull-quote punchline | "Small fix. Big impact." | Delete. Give the impact number in the TL;DR. |
| Hedge stack | "This may potentially cause some issues." | "This breaks exports for files over 2 GB." |
| Vague attribution | "Experts recommend..." / "Best practice says..." | Cite the doc or delete. |
| Significance inflation | "This marks a key turning point for the platform." | Delete. |
| Uniform rhythm | Every sentence 15-18 words, every paragraph 3 sentences. | Vary length. Some sentences are 5 words. |
| Inanimate actors doing human things | "The data tells us..." / "The code wants..." | "The logs show..." / "The code requires..." |
| Meta-commentary | "This section explains..." / "As mentioned above..." | Delete. Say the thing. |

## 6. Formatting tells

| Rule | Why |
|---|---|
| No em dashes (—). Use a period, comma, colon, or parentheses. | The most common machine tell. |
| No emoji. Write "Status: Done", not a check mark. | Emoji read as decoration and break in some renderers. |
| No exclamation marks. | Investigation docs are calm. |
| Bold only for warnings and TL;DR labels. Max 2 bold spans per line. | Bold everywhere means nothing stands out. |
| Sentence-case headings. Never skip heading levels. | Title Case Everywhere is a tell. |
| Straight quotes (" and '). | Curly quotes come from copy-paste and chat output. |
| Tables only for data with 2+ columns that a reader compares. | Do not wrap prose in tables. |
| No horizontal rules between every section. | Headings already separate sections. |

## 7. Accuracy rules

- Never invent a number, quote, file path, function name, line number, commit, or ticket ID.
- Every root-cause claim has an Evidence row.
- Diffs come from code you read in this session. Mark untested diffs "Sketch, not final".
- Remove secrets, tokens, connection strings, customer names, and emails from logs before pasting.

## 8. Self-score before you finish

Score the draft 0-10 on each line. Ship at 40/50 or higher. Below 40, rewrite the weakest dimension and score again.

| Dimension | 10 means |
|---|---|
| Directness | TL;DR answers the reader's question in the first bullet. No warm-up anywhere. |
| Clarity for non-technical readers | A PM can read the top half and explain the problem and fix to someone else. |
| Specificity | Every claim has a number, a name, a path, or a link. No "various", "some", "significant". |
| Rhythm | Sentence lengths vary. No repeated sentence shapes. No slop structures from section 5. |
| Density | Nothing can be deleted without losing information. No recaps, no meta-commentary. |

Report the score in chat to the user, not in the document.
