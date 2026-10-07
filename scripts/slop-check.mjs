#!/usr/bin/env node
// slop-check.mjs: flags AI-slop patterns and plain-language problems in a Markdown file.
// Skips frontmatter, fenced code blocks, inline code, HTML comments, and URLs.
// Usage:  node slop-check.mjs <file.md> [--strict]
// Exit:   0 = clean, 1 = errors found (or any warning with --strict), 2 = bad usage.
import { readFileSync } from 'node:fs';

const ERROR = 'ERROR';
const WARN = 'warn';

// [regex source, plain replacement hint]. Matched case-insensitively on word boundaries.
const WORDS = {
  [ERROR]: [
    ['delv(e|es|ed|ing)', 'look at, check, read'],
    ['tapestry', 'mix, set'],
    ['testament', 'proof, shows'],
    ['vibrant', 'delete'],
    ['intricate(ly)?', 'detailed, complex'],
    ['meticulous(ly)?', 'careful'],
    ['pivotal', 'main, deciding'],
    ['utiliz(e|es|ed|ing|ation)', 'use'],
    ['seamless(ly)?', 'delete, or say what does not break'],
    ['holistic(ally)?', 'whole, end-to-end'],
    ['paradigm', 'model, approach'],
    ['synerg(y|ies|istic)', 'delete'],
    ['game[- ]chang(er|ing)', 'delete'],
    ['cutting[- ]edge', 'new, current'],
    ['realm', 'area'],
    ['moreover', 'delete, or "also"'],
    ['furthermore', 'delete, or "also"'],
    ['additionally', 'delete, or "also"'],
    ['foster(s|ed|ing)?', 'build, support'],
    ['showcas(e|es|ed|ing)', 'show'],
    ['empower(s|ed|ing)?', 'let, allow'],
    ['elevat(e|es|ed|ing)', 'raise, improve'],
    ['bolster(s|ed|ing)?', 'support, strengthen'],
    ['garner(s|ed|ing)?', 'get'],
    ['embark(s|ed|ing)?', 'start'],
    ['beacon', 'delete'],
    ['nestled', 'located'],
    ['boasts?', 'has'],
    ['myriad', 'many, or the exact number'],
    ['plethora', 'many, or the exact number'],
    ['unparalleled', 'delete'],
    ['revolutioniz(e|es|ed|ing)', 'change'],
    ['supercharg(e|es|ed|ing)', 'speed up'],
    ['groundbreaking', 'delete'],
    ['transformative', 'delete, say what changes'],
    ['multifaceted', 'say the facets'],
    ['ever[- ]evolving', 'changing'],
    ['interplay', 'interaction'],
    ['commendable', 'delete'],
    ['invaluable', 'useful'],
  ],
  [WARN]: [
    ['robust(ness)?', 'say what it survives: retries, bad input, load'],
    ['leverag(e|es|ed|ing)', 'use'],
    ['landscape', 'delete unless literal'],
    ['crucial(ly)?', 'say the consequence instead'],
    ['vital', 'say the consequence instead'],
    ['comprehensive(ly)?', 'full, or list what is covered'],
    ['streamlin(e|es|ed|ing)', 'simplify, cut steps'],
    ['enhanc(e|es|ed|ing|ement|ements)', 'improve, or say what changes'],
    ['highlight(s|ed|ing)?', 'show, point out'],
    ['underscor(e|es|ed|ing)', 'show (fine if you mean the _ character)'],
    ['navigat(e|es|ed|ing)', 'fine for UI navigation; else "handle"'],
    ['unlock(s|ed|ing)?', 'fine for locks/accounts; else "allow"'],
    ['harness(es|ed|ing)?', 'use'],
    ['notabl(e|y)', 'delete'],
    ['essentially', 'delete'],
    ['ultimately', 'delete'],
    ['basically', 'delete'],
    ['actually', 'delete'],
    ['really', 'delete'],
    ['very', 'delete, or give the number'],
    ['quite', 'delete'],
    ['significant(ly)?', 'give the number'],
    ['various', 'name them, or give the count'],
    ['numerous', 'give the count'],
    ['optimal(ly)?', 'best, or say by what measure'],
    ['facilitat(e|es|ed|ing)', 'help, allow'],
    ['endeavou?r', 'try, work'],
    ['ensur(e|es|ed|ing)', 'fine when it is a real guarantee; else "check"'],
  ],
};

// Multi-word phrases. Matched case-insensitively.
const PHRASES = {
  [ERROR]: [
    ["it(?:'|’)?s worth noting", 'delete; state the fact'],
    ['it is worth noting', 'delete; state the fact'],
    ["it(?:'|’)?s important to note", 'delete; state the fact'],
    ['it is important to note', 'delete; state the fact'],
    ['it should be noted', 'delete; state the fact'],
    ["in today(?:'|’)?s\\b", 'delete'],
    ['plays? an? (?:key|crucial|pivotal|vital|critical|important) role', 'say what it does'],
    ['serves? as', 'is'],
    ['stands? as', 'is'],
    ['at the end of the day', 'delete'],
    ['in conclusion', 'delete the recap'],
    ['in summary', 'delete the recap'],
    ['to summarize', 'delete the recap'],
    ['all in all', 'delete'],
    ["let(?:'|’)?s dive", 'delete'],
    ['dive into', 'look at'],
    ['rest assured', 'delete'],
    ['i hope this helps', 'delete'],
    ['needless to say', 'delete'],
    ['when it comes to', 'for'],
    ['a testament to', 'shows'],
    ['the world of', 'delete'],
    ['navigat(?:e|ing) the complexit(?:y|ies)', 'handle'],
    ['great question', 'delete'],
    ['without further ado', 'delete'],
    ['in the realm of', 'in'],
    ['the power of', 'delete'],
    ['first and foremost', 'first'],
    ['last but not least', 'finally, or delete'],
    ['due to the fact that', 'because'],
    ['at this point in time', 'now'],
    ['in light of', 'because of'],
    ['a wide (?:range|array|variety) of', 'give the count, or name them'],
    ['a (?:diverse|rich) array of', 'give the count, or name them'],
    ['deep dive', 'investigation, review'],
    ['best[- ]in[- ]class', 'delete'],
    ['as an ai', 'delete'],
  ],
  [WARN]: [
    ['in order to', 'to'],
    ['a number of', 'give the count'],
    ['in terms of', 'for, about'],
    ['going forward', 'from now on, or delete'],
    ['moving forward', 'from now on, or delete'],
    ['it seems', 'state what the evidence shows'],
    ['we believe', 'mark as "Suspected" and give the reason'],
    ['it appears', 'state what the evidence shows'],
    ['(?:may|might|could) (?:potentially|possibly|perhaps)', 'pick one hedge, or give the likelihood'],
    ['potentially', 'give the likelihood or delete'],
  ],
};

// Sentence-level structure rules: [level, rule name, regex, hint]
const STRUCTURES = [
  [ERROR, 'negative-parallelism', /\bnot (?:just|only|merely|simply)\b[^.?!]*\bbut\b/gi, 'state the real point once'],
  [ERROR, 'negative-parallelism', /\b(?:it|this|that)(?:'|’)?s not\b[^.?!]*[,;:]\s*(?:it|this|that)(?:'|’)?s\b/gi, 'state the real point once'],
  [ERROR, 'negative-parallelism', /\b(?:isn|doesn|wasn)(?:'|’)t just\b/gi, 'state the real point once'],
  [ERROR, 'slop-opener', /(?:^|[.?!]\s+|^\s*(?:[-*+]|\d+\.)\s+)(?:Certainly|Absolutely|Indeed|Notably|Importantly|Interestingly|Ultimately|Essentially|Overall|Simply put|That said|Of course|Crucially)\b/g, 'delete the opener'],
  [WARN, 'trailing-ing-clause', /,\s+(?:ensuring|highlighting|underscoring|emphasizing|showcasing|reflecting|contributing to|fostering|enabling|allowing|making it|paving the way)\b/gi, 'split into its own sentence with a real subject, or delete'],
  [WARN, 'passive-voice', /\b(?:is|are|was|were|been|being|be)\s+\w+(?:ed|en)\s+by\b/gi, 'name the actor first: "<actor> <verb>s <object>"'],
  [WARN, 'vague-attribution', /\b(?:experts|studies|research|many people|some say|observers|industry reports)\b(?: (?:say|show|suggest|argue|agree|believe))/gi, 'cite the source or delete'],
];

const ACRONYM_ALLOW = new Set(['TL', 'DR', 'ID', 'IDS', 'OK']);

// ---------- input ----------
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('Usage: node slop-check.mjs <file.md> [--strict]');
  process.exit(2);
}
const lines = readFileSync(file, 'utf8').split(/\r?\n/);

const blank = (s) => ' '.repeat(s.length);
const maskInline = (s) =>
  s
    .replace(/`[^`]*`/g, blank)
    .replace(/\]\([^)]*\)/g, (m) => ']' + blank(m.slice(1)))
    .replace(/https?:\/\/\S+/g, blank);

// ---------- pass 1: build prose lines ----------
const prose = []; // { n, text, heading, section }
let inFront = lines[0]?.trim() === '---';
let inFence = false;
let inComment = false;
let section = '';
for (let i = 0; i < lines.length; i++) {
  const raw = lines[i];
  if (inFront) {
    if (i > 0 && raw.trim() === '---') inFront = false;
    continue;
  }
  if (!inComment && /^\s*(```|~~~)/.test(raw)) {
    inFence = !inFence;
    continue;
  }
  if (inFence) continue;

  let out = '';
  let j = 0;
  while (j < raw.length) {
    if (inComment) {
      const end = raw.indexOf('-->', j);
      if (end === -1) { out += blank(raw.slice(j)); j = raw.length; }
      else { out += blank(raw.slice(j, end + 3)); j = end + 3; inComment = false; }
    } else {
      const start = raw.indexOf('<!--', j);
      if (start === -1) { out += raw.slice(j); j = raw.length; }
      else { out += raw.slice(j, start); j = start; inComment = true; }
    }
  }
  const text = maskInline(out);
  if (!text.trim()) continue;
  const h = text.match(/^(#{1,6})\s+(.*)$/);
  if (h) section = h[2].trim().toLowerCase();
  prose.push({ n: i + 1, text, heading: h ? h[2] : null, section });
}

// ---------- pass 2: checks ----------
const hits = [];
const add = (level, n, col, rule, match, hint) => hits.push({ level, n, col, rule, match, hint });

const wordRules = [];
for (const level of [ERROR, WARN]) {
  for (const [src, hint] of WORDS[level]) wordRules.push([level, 'banned-word', new RegExp(`\\b(?:${src})\\b`, 'gi'), hint]);
  for (const [src, hint] of PHRASES[level]) wordRules.push([level, 'banned-phrase', new RegExp(`\\b${src}`, 'gi'), hint]);
}

const isGlossary = (s) => /glossary/.test(s);
const glossaryAcronyms = new Set();
let hasTldr = false;
let hasGlossary = false;

for (const p of prose) {
  if (p.heading && /tl;?\s?dr/i.test(p.heading)) hasTldr = true;
  if (p.heading && isGlossary(p.heading.toLowerCase())) hasGlossary = true;
  if (isGlossary(p.section)) {
    for (const m of p.text.matchAll(/\b[A-Z][A-Z0-9&]{1,5}\b/g)) glossaryAcronyms.add(m[0]);
  }
}

const seenAcronym = new Set();
for (const { n, text, heading, section: sec } of prose) {
  for (const [level, rule, re, hint] of [...wordRules, ...STRUCTURES]) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) add(level, n, m.index + 1, rule, m[0].trim(), hint);
  }

  for (const m of text.matchAll(/—|\s–\s|\s--\s/g)) add(ERROR, n, m.index + 1, 'em-dash', m[0].trim(), 'use a period, comma, colon, or parentheses');
  for (const m of text.matchAll(/!(?![\[=])/g)) add(ERROR, n, m.index + 1, 'exclamation', '!', 'use a period');
  for (const m of text.matchAll(/\p{Extended_Pictographic}/gu)) add(ERROR, n, m.index + 1, 'emoji', m[0], 'delete; use words like "Status: Done"');
  for (const m of text.matchAll(/[“”‘’]/g)) add(WARN, n, m.index + 1, 'curly-quote', m[0], 'use straight quotes');

  if (heading) {
    const words = heading.replace(/[`*_]/g, '').split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
    const rest = words.slice(1).filter((w) => w.length > 3 && w !== w.toUpperCase());
    if (rest.length >= 2 && rest.every((w) => /^[A-Z]/.test(w))) add(WARN, n, 1, 'title-case-heading', heading, 'use sentence case');
  }

  const bold = text.match(/\*\*[^*]+\*\*/g) || [];
  if (bold.length > 2) add(WARN, n, 1, 'bold-overuse', `${bold.length} bold spans`, 'bold only warnings and TL;DR labels');

  const isTable = /^\s*\|/.test(text);
  if (!heading && !isTable) {
    const body = text.replace(/^\s*(?:[-*+]|\d+\.)\s+(?:\[[ xX]\]\s+)?/, '').replace(/\*\*|__/g, '');
    for (const s of body.split(/(?<=[.?!])\s+/)) {
      const count = s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
      if (count > 30) add(ERROR, n, Math.max(1, text.indexOf(s.slice(0, 15)) + 1), 'long-sentence', `${count} words`, 'split; target 20, cap 25');
      else if (count > 25) add(WARN, n, Math.max(1, text.indexOf(s.slice(0, 15)) + 1), 'long-sentence', `${count} words`, 'split; target 20, cap 25');
      if (/\?\s*$/.test(s.trim()) && !/question|decision/.test(sec)) add(WARN, n, 1, 'rhetorical-question', s.trim().slice(0, 40), 'state the answer instead');
    }
  }

  if (!isGlossary(sec)) {
    for (const m of text.matchAll(/\b([A-Z][A-Z0-9&]{1,5})(?:s)?\b/g)) {
      const a = m[1];
      if (ACRONYM_ALLOW.has(a) || glossaryAcronyms.has(a) || seenAcronym.has(a)) continue;
      if (/^\d+$/.test(a.slice(1)) && a.length <= 2) continue;
      seenAcronym.add(a);
      add(WARN, n, m.index + 1, 'undefined-acronym', a, 'add to Glossary');
    }
  }
}

if (!hasTldr) add(ERROR, 1, 1, 'missing-section', 'TL;DR', 'add a TL;DR section at the top');
if (!hasGlossary) add(WARN, 1, 1, 'missing-section', 'Glossary', 'add a Glossary section');

// ---------- report ----------
hits.sort((a, b) => a.n - b.n || a.col - b.col);
for (const h of hits) {
  console.log(`${file}:${h.n}:${h.col}  ${h.level.padEnd(5)}  ${h.rule.padEnd(20)}  "${h.match}"  -> ${h.hint}`);
}
const errors = hits.filter((h) => h.level === ERROR).length;
const warns = hits.length - errors;
console.log(`\n${errors} error(s), ${warns} warning(s)`);
process.exit(errors > 0 || (strict && warns > 0) ? 1 : 0);
