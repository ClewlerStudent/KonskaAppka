#!/usr/bin/env node
// Kolejka zadań EQUENOR: pliki tasks/<obszar>/<ID>-<slug>.md z nagłówkiem (front matter).
// Bez zależności: tylko node:fs i node:path (Node 22). Opis protokołu: tasks/README.md.
//
//   node tasks/queue.mjs check                       sprawdza pliki zadań, decyzje i aktualność QUEUE.md
//   node tasks/queue.mjs next [A | --area A] [--all] zadania gotowe do wzięcia (domyślnie 10)
//   node tasks/queue.mjs list [A | --area A] [--status S]
//   node tasks/queue.mjs show <ID>                   ścieżka, zależności i decyzje zadania
//   node tasks/queue.mjs index                       generuje tasks/QUEUE.md i listy zadań w decisions.md
//   node tasks/queue.mjs claim <ID> <owner> [branch] przejęcie: status in_progress, owner, branch
//   node tasks/queue.mjs set <ID> <status> [--reason "…"]
//
// Opcje: --json (next, list, show), --force (claim, set), --limit N (next),
//        --env emulator,macos,device,owner|none (next: tylko zadania, których kryteria [ręcznie] da się sprawdzić).

import fs from 'node:fs';
import path from 'node:path';

export const AREAS = {
  backend: { prefix: 'BE', name: 'Backend (mikroserwisy i crony)' },
  web: { prefix: 'WEB', name: 'Web: panel admina, wyświetlacz TV, strona www' },
  mobile: { prefix: 'MOB', name: 'Aplikacja mobilna' },
  tablet: { prefix: 'TAB', name: 'Tablet e-ink przy boksie' },
  shared: { prefix: 'SH', name: 'Wspólne: docs, środowisko, CI, akceptacja' },
};
export const STATUSES = ['todo', 'in_progress', 'review', 'done', 'blocked'];
export const SIZES = ['S', 'M', 'L'];
export const DECISION_STATUSES = ['otwarta', 'rozstrzygnięta'];
/** Opcjonalne pole `needs`: środowisko potrzebne do kryteriów [ręcznie] (tasks/README.md punkt 4). */
export const NEEDS = ['emulator', 'macos', 'device', 'owner'];
const MANUAL_TAG = '[ręcznie]';
export const REQUIRED_KEYS = [
  'id',
  'title',
  'area',
  'stage',
  'size',
  'status',
  'depends_on',
  'decisions',
  'owner',
  'branch',
  'trello',
];
export const REQUIRED_SECTIONS = [
  'Cel',
  'Kontekst',
  'Zakres',
  'Poza zakresem',
  'Kryteria akceptacji',
  'Testy',
  'Definicja gotowości',
  'Uwagi dla wykonawcy',
];
const ID_RE = /^(BE|WEB|MOB|TAB|SH)-\d{3}$/;
const ID_IN_TEXT_RE = /\b(?:BE|WEB|MOB|TAB|SH)-\d{3}\b/g;
const DEC_RE = /^DEC-\d{2,}$/;
const DEC_IN_TEXT_RE = /\bDEC-\d{2,}\b/g;
const DEP_OK_RE = /<!--\s*dep-ok:([^>]*)-->/g;
const TASKS_LINE = '- **Zadania:**';
const BLOCK_SECTION = 'Blokada';

// ---------------------------------------------------------------------------
// Front matter: prosty YAML (skalary, listy w nawiasach kwadratowych).

export function parseScalar(raw) {
  const v = raw.trim();
  if (v === '' || v === '~' || v === 'null') return null;
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
    try {
      return JSON.parse(v);
    } catch {
      return v.slice(1, -1);
    }
  }
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) return v.slice(1, -1).replaceAll("''", "'");
  if (/^-?\d+$/.test(v)) return Number(v);
  return v;
}

function splitList(inner) {
  const items = [];
  let cur = '';
  let quote = null;
  for (const ch of inner) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === ',') {
      items.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.trim() !== '') items.push(cur);
  return items.map((s) => s.trim()).filter((s) => s !== '');
}

export function parseValue(raw) {
  const v = raw.trim();
  if (v.startsWith('[')) {
    if (!v.endsWith(']')) throw new Error(`niedomknięta lista: ${v}`);
    return splitList(v.slice(1, -1)).map(parseScalar);
  }
  return parseScalar(v);
}

/** Zwraca { data, body, start, end } (start/end: indeksy linii `---`) albo rzuca błąd. */
export function parseFrontMatter(text) {
  const lines = text.split('\n');
  if (lines[0].trim() !== '---') throw new Error('brak nagłówka: plik musi zaczynać się od linii ---');
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end < 0) throw new Error('niedomknięty nagłówek (brak drugiej linii ---)');
  const data = {};
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    const m = /^([A-Za-z_][\w-]*):(?:\s(.*)|)$/.exec(line);
    if (!m) throw new Error(`linia ${i + 1} nagłówka nie jest parą klucz: wartość: ${line}`);
    if (m[1] in data) throw new Error(`powtórzony klucz ${m[1]}`);
    data[m[1]] = parseValue(m[2] ?? '');
  }
  return { data, body: lines.slice(end + 1).join('\n'), start: 0, end };
}

export function formatValue(value) {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (typeof value === 'number') return String(value);
  const s = String(value);
  if (/^[A-Za-z0-9_./@+-][A-Za-z0-9_ ./@+()-]*$/.test(s) && !/\s$/.test(s) && !/^(null|true|false|~)$/i.test(s) && !/^-?\d+$/.test(s))
    return s;
  return JSON.stringify(s);
}

/** Zmienia wartości kluczy w nagłówku (brakujące dopisuje na końcu nagłówka). */
export function setFrontMatterFields(text, updates) {
  const { end } = parseFrontMatter(text);
  const lines = text.split('\n');
  const done = new Set();
  for (let i = 1; i < end; i++) {
    const m = /^([A-Za-z_][\w-]*):/.exec(lines[i]);
    if (m && m[1] in updates) {
      const v = formatValue(updates[m[1]]);
      lines[i] = v === '' ? `${m[1]}:` : `${m[1]}: ${v}`;
      done.add(m[1]);
    }
  }
  const missing = Object.keys(updates).filter((k) => !done.has(k));
  const added = missing.map((k) => {
    const v = formatValue(updates[k]);
    return v === '' ? `${k}:` : `${k}: ${v}`;
  });
  lines.splice(end, 0, ...added);
  return lines.join('\n');
}

export function sectionsOf(body) {
  return body
    .split('\n')
    .map((l) => /^## (.+?)\s*$/.exec(l))
    .filter(Boolean)
    .map((m) => m[1]);
}

/** Treść sekcji `## <name>` (bez nagłówka) albo pusty tekst. */
export function sectionText(body, name) {
  const lines = body.split('\n');
  const start = lines.findIndex((l) => l.trim() === `## ${name}`);
  if (start < 0) return '';
  let end = start + 1;
  while (end < lines.length && !/^## /.test(lines[end])) end++;
  return lines.slice(start + 1, end).join('\n');
}

/** Punkt „Stan kodu” z sekcji Kontekst (od `- Stan kodu` / `- **Stan kodu…**` do następnego punktu). */
export function codeStateText(body) {
  const lines = sectionText(body, 'Kontekst').split('\n');
  const start = lines.findIndex((l) => /^- (\*\*)?Stan kodu/.test(l));
  if (start < 0) return '';
  let end = start + 1;
  while (end < lines.length && !/^- /.test(lines[end])) end++;
  return lines.slice(start, end).join('\n');
}

/** Liczba kryteriów `- [ ] [ręcznie] …` (także odhaczonych) w sekcji Kryteria akceptacji. */
export function manualCriteria(body) {
  return sectionText(body, 'Kryteria akceptacji')
    .split('\n')
    .filter((l) => /^- \[[ xX]\] /.test(l) && l.includes(MANUAL_TAG)).length;
}

/** Zbiór przodków (wszystkie zależności przechodnie) każdego zadania. */
export function ancestorsMap(tasks) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const memo = new Map();
  const visit = (id, stack = new Set()) => {
    if (memo.has(id)) return memo.get(id);
    const acc = new Set();
    if (stack.has(id)) return acc;
    stack.add(id);
    for (const dep of byId.get(id)?.depends_on ?? []) {
      if (!byId.has(dep)) continue;
      acc.add(dep);
      for (const a of visit(dep, stack)) acc.add(a);
    }
    stack.delete(id);
    memo.set(id, acc);
    return acc;
  };
  for (const t of tasks) visit(t.id);
  return memo;
}

/** Dopisuje punkt do sekcji `## Blokada` (tworzy ją na końcu pliku, jeśli jej nie ma). */
export function appendBlockReason(text, line) {
  const lines = text.split('\n');
  const idx = lines.findIndex((l) => l.trim() === `## ${BLOCK_SECTION}`);
  if (idx < 0) {
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    lines.push('', `## ${BLOCK_SECTION}`, line, '');
    return lines.join('\n');
  }
  let j = idx + 1;
  while (j < lines.length && !/^## /.test(lines[j])) j++;
  let insertAt = j;
  while (insertAt > idx + 1 && lines[insertAt - 1].trim() === '') insertAt--;
  lines.splice(insertAt, 0, line);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Wczytywanie zadań i decyzji.

export function loadTasks(root) {
  const tasks = [];
  const errors = [];
  for (const area of Object.keys(AREAS)) {
    const dir = path.join(root, area);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).sort()) {
      if (!file.endsWith('.md')) continue;
      const rel = `${area}/${file}`;
      const text = fs.readFileSync(path.join(dir, file), 'utf8');
      try {
        const { data, body } = parseFrontMatter(text);
        tasks.push({ ...data, dir: area, rel, file: path.join(dir, file), body, sections: sectionsOf(body) });
      } catch (e) {
        errors.push(`${rel}: ${e.message}`);
      }
    }
  }
  // Pliki .md w innych podkatalogach (np. literówka w nazwie obszaru) też są błędem.
  if (fs.existsSync(root)) {
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (entry.isDirectory() && !(entry.name in AREAS) && !entry.name.startsWith('.')) {
        const mds = fs.readdirSync(path.join(root, entry.name)).filter((f) => f.endsWith('.md'));
        if (mds.length) errors.push(`${entry.name}/: nieznany obszar (dozwolone: ${Object.keys(AREAS).join(', ')})`);
      }
    }
  }
  return { tasks, errors };
}

export function parseDecisions(text) {
  const decisions = [];
  let cur = null;
  for (const line of text.split('\n')) {
    const h = /^## (DEC-\d{2,})\s*·\s*(.+?)\s*$/.exec(line);
    if (h) {
      cur = { id: h[1], title: h[2], status: null, blocks: [] };
      decisions.push(cur);
      continue;
    }
    if (/^## /.test(line)) {
      cur = null;
      continue;
    }
    if (!cur) continue;
    const s = /^- \*\*Status:\*\*\s*(.+?)\s*$/.exec(line);
    if (s) cur.status = s[1].split(/[\s(—–-]/)[0].trim();
    const b = /^- \*\*Blokuje:\*\*\s*(.*)$/.exec(line);
    if (b) cur.blocks = [...new Set(b[1].match(ID_IN_TEXT_RE) ?? [])];
  }
  return decisions;
}

export function loadDecisions(root) {
  const file = path.join(root, 'decisions.md');
  if (!fs.existsSync(file)) return { decisions: [], text: null, file };
  const text = fs.readFileSync(file, 'utf8');
  return { decisions: parseDecisions(text), text, file };
}

// ---------------------------------------------------------------------------
// Sprawdzenia.

export function findCycles(tasks) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const color = new Map();
  const stack = [];
  const cycles = [];
  const seen = new Set();
  const visit = (id) => {
    color.set(id, 1);
    stack.push(id);
    for (const dep of byId.get(id)?.depends_on ?? []) {
      if (!byId.has(dep)) continue;
      const c = color.get(dep) ?? 0;
      if (c === 0) visit(dep);
      else if (c === 1) {
        const cycle = stack.slice(stack.indexOf(dep)).concat(dep);
        const key = [...cycle.slice(0, -1)].sort().join(',');
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push(cycle);
        }
      }
    }
    stack.pop();
    color.set(id, 2);
  };
  for (const t of [...tasks].sort(byStageAndId)) if (!color.get(t.id)) visit(t.id);
  return cycles;
}

export function checkAll(tasks, decisions, { loadErrors = [] } = {}) {
  const errors = [...loadErrors];
  const warnings = [];
  const byId = new Map();
  const decById = new Map(decisions.map((d) => [d.id, d]));

  const seenDec = new Set();
  for (const d of decisions) {
    if (seenDec.has(d.id)) errors.push(`decisions.md: powtórzona decyzja ${d.id}`);
    seenDec.add(d.id);
    if (!DECISION_STATUSES.includes(d.status))
      errors.push(`decisions.md: ${d.id} ma status „${d.status ?? 'brak'}” (dozwolone: ${DECISION_STATUSES.join(', ')})`);
  }

  for (const t of tasks) {
    const where = t.rel;
    for (const k of REQUIRED_KEYS) if (!(k in t)) errors.push(`${where}: brak klucza „${k}” w nagłówku`);
    if (typeof t.id !== 'string' || !ID_RE.test(t.id)) {
      errors.push(`${where}: niepoprawne id „${t.id}” (wzór: BE-001, WEB-001, MOB-001, TAB-001, SH-001)`);
      continue;
    }
    if (byId.has(t.id)) errors.push(`${where}: id ${t.id} powtórzone (także ${byId.get(t.id).rel})`);
    else byId.set(t.id, t);
    const area = AREAS[t.area];
    if (!area) errors.push(`${where}: nieznany obszar „${t.area}”`);
    else {
      if (t.area !== t.dir) errors.push(`${where}: area „${t.area}”, a plik leży w katalogu ${t.dir}/`);
      if (!t.id.startsWith(`${area.prefix}-`))
        errors.push(`${where}: id ${t.id} nie pasuje do obszaru ${t.area} (prefiks ${area.prefix}-)`);
    }
    if (!path.basename(t.rel).startsWith(`${t.id}-`)) errors.push(`${where}: nazwa pliku powinna zaczynać się od „${t.id}-”`);
    if (typeof t.title !== 'string' || t.title.trim() === '') errors.push(`${where}: pusty tytuł`);
    if (!Number.isInteger(t.stage) || t.stage < 0 || t.stage > 9) errors.push(`${where}: stage „${t.stage}” poza 0–9`);
    if (!SIZES.includes(t.size)) errors.push(`${where}: size „${t.size}” (dozwolone: ${SIZES.join(', ')})`);
    if (!STATUSES.includes(t.status)) errors.push(`${where}: status „${t.status}” (dozwolone: ${STATUSES.join(', ')})`);
    if (['in_progress', 'review'].includes(t.status) && !t.owner) errors.push(`${where}: status ${t.status} bez owner`);
    if (t.status === 'blocked' && !t.sections.includes(BLOCK_SECTION))
      errors.push(`${where}: status blocked bez sekcji „## ${BLOCK_SECTION}” z powodem`);
    if (t.trello && !/^https:\/\/trello\.com\/c\//.test(String(t.trello)))
      warnings.push(`${where}: trello „${t.trello}” nie wygląda na link do karty (https://trello.com/c/…)`);
    if (!Array.isArray(t.depends_on)) errors.push(`${where}: depends_on musi być listą [..]`);
    if (!Array.isArray(t.decisions)) errors.push(`${where}: decisions musi być listą [..]`);
    for (const dec of Array.isArray(t.decisions) ? t.decisions : []) {
      if (!DEC_RE.test(String(dec))) errors.push(`${where}: niepoprawny identyfikator decyzji „${dec}”`);
      else if (!decById.has(dec)) errors.push(`${where}: decyzja ${dec} nie istnieje w decisions.md`);
    }
    if (Array.isArray(t.decisions) && new Set(t.decisions).size !== t.decisions.length)
      warnings.push(`${where}: powtórzona decyzja w decisions`);
    if ('needs' in t && t.needs !== null) {
      if (!Array.isArray(t.needs)) errors.push(`${where}: needs musi być listą [..]`);
      else
        for (const n of t.needs)
          if (!NEEDS.includes(n)) errors.push(`${where}: needs „${n}” (dozwolone: ${NEEDS.join(', ')})`);
    }
    const hasManual = t.body.includes(MANUAL_TAG);
    const needs = Array.isArray(t.needs) ? t.needs : [];
    if (hasManual && !needs.length) warnings.push(`${where}: kryteria ${MANUAL_TAG} bez pola needs w nagłówku`);
    if (!hasManual && needs.length) warnings.push(`${where}: needs bez kryteriów ${MANUAL_TAG} w treści`);
    if (Array.isArray(t.decisions)) {
      const cited = new Set();
      for (const s of t.sections.filter((x) => x !== 'Poza zakresem' && x !== BLOCK_SECTION))
        for (const m of sectionText(t.body, s).match(DEC_IN_TEXT_RE) ?? []) cited.add(m);
      for (const m of t.body.split('\n').find((l) => /^# /.test(l))?.match(DEC_IN_TEXT_RE) ?? []) cited.add(m);
      const missing = [...cited].filter((d) => !t.decisions.includes(d)).sort();
      if (missing.length) warnings.push(`${where}: treść cytuje ${missing.join(', ')}, których nie ma w decisions`);
    }
    const h1 = t.body.split('\n').find((l) => /^# /.test(l));
    if (!h1 || !h1.startsWith(`# ${t.id} · `)) errors.push(`${where}: pierwszy nagłówek powinien mieć postać „# ${t.id} · <tytuł>”`);
    for (const s of REQUIRED_SECTIONS) if (!t.sections.includes(s)) errors.push(`${where}: brak sekcji „## ${s}”`);
  }

  for (const t of byId.values()) {
    const deps = Array.isArray(t.depends_on) ? t.depends_on : [];
    if (new Set(deps).size !== deps.length) warnings.push(`${t.rel}: powtórzona zależność w depends_on`);
    for (const dep of deps) {
      if (dep === t.id) errors.push(`${t.rel}: zadanie zależy samo od siebie`);
      else if (!byId.has(dep)) errors.push(`${t.rel}: zależność ${dep} nie istnieje`);
      else {
        const d = byId.get(dep);
        if (Number.isInteger(d.stage) && Number.isInteger(t.stage) && d.stage > t.stage)
          warnings.push(`${t.rel}: zależy od ${dep} z późniejszego etapu (${d.stage} > ${t.stage})`);
        if (t.status === 'done' && d.status !== 'done') warnings.push(`${t.rel}: done, a zależność ${dep} ma status ${d.status}`);
      }
    }
  }

  for (const d of decisions)
    for (const id of d.blocks) if (!byId.has(id)) errors.push(`decisions.md: ${d.id} blokuje nieistniejące zadanie ${id}`);

  // Zadania z „Stan kodu” i „Testy” muszą być przed tym zadaniem (przodek) albo po nim (potomek).
  const valid = [...byId.values()];
  const anc = ancestorsMap(valid);
  for (const t of valid) {
    const ok = new Set([t.id]);
    for (const m of t.body.matchAll(DEP_OK_RE)) for (const id of m[1].match(ID_IN_TEXT_RE) ?? []) ok.add(id);
    const text = `${codeStateText(t.body)}\n${sectionText(t.body, 'Testy')}`;
    const loose = [...new Set(text.match(ID_IN_TEXT_RE) ?? [])]
      .filter((id) => byId.has(id) && !ok.has(id) && !anc.get(t.id)?.has(id) && !anc.get(id)?.has(t.id))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    if (loose.length)
      warnings.push(
        `${t.rel}: „Stan kodu”/„Testy” korzystają z ${loose.join(', ')}, których nie ma w depends_on (ani przechodnio); dopisz zależność albo <!-- dep-ok: ID -->`,
      );
  }

  for (const cycle of findCycles([...byId.values()])) errors.push(`cykl zależności: ${cycle.join(' → ')}`);
  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// Kolejka.

export function byStageAndId(a, b) {
  return (a.stage ?? 99) - (b.stage ?? 99) || String(a.id).localeCompare(String(b.id), 'en', { numeric: true });
}

/** Otwarte decyzje, które blokują start zadania (pole „Blokuje” w decisions.md). */
export function blockingDecisions(task, decisions) {
  return decisions.filter((d) => d.status !== 'rozstrzygnięta' && d.blocks.includes(task.id)).map((d) => d.id);
}

/** Czy środowisko `env` (lista z NEEDS) wystarcza do wszystkich kryteriów [ręcznie] zadania. */
export function fitsEnv(task, env) {
  if (!env) return true;
  return (Array.isArray(task.needs) ? task.needs : []).every((n) => env.includes(n));
}

/** Zadania todo z wszystkimi zależnościami done. `waiting` = gotowe, ale czekają na decyzję właściciela. */
export function readyTasks(tasks, decisions = [], { area, env } = {}) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const ready = [];
  const waiting = [];
  for (const t of [...tasks].sort(byStageAndId)) {
    if (t.status !== 'todo') continue;
    if (area && t.area !== area) continue;
    if (!fitsEnv(t, env)) continue;
    if (!(t.depends_on ?? []).every((d) => byId.get(d)?.status === 'done')) continue;
    const blockedBy = blockingDecisions(t, decisions);
    (blockedBy.length ? waiting : ready).push({ ...t, blockedBy });
  }
  return { ready, waiting };
}

/** Zadania todo, którym brakuje najmniej zakończonych zależności (podpowiedź, gdy nic nie jest gotowe). */
export function nearestTasks(tasks, { area, limit = 5 } = {}) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  return tasks
    .filter((t) => t.status === 'todo' && (!area || t.area === area))
    .map((t) => ({ ...t, missing: (t.depends_on ?? []).filter((d) => byId.get(d)?.status !== 'done') }))
    .filter((t) => t.missing.length > 0)
    .sort((a, b) => a.missing.length - b.missing.length || byStageAndId(a, b))
    .slice(0, limit)
    .map((t) => ({ ...t, missing: t.missing.map((d) => ({ id: d, status: byId.get(d)?.status ?? '?' })) }));
}

/**
 * Gotowe zadania (z dowolnego obszaru), od których przechodnio zależą zadania todo obszaru `area`,
 * posortowane według liczby zadań obszaru, które czekają na nie (najwięcej pierwsze).
 */
export function unblockers(tasks, decisions = [], { area, env, limit = 5 } = {}) {
  const { ready } = readyTasks(tasks, decisions, { env });
  const anc = ancestorsMap(tasks);
  const waitingInArea = tasks.filter((t) => t.status === 'todo' && t.area === area);
  return ready
    .map((r) => ({ ...r, unblocks: waitingInArea.filter((w) => anc.get(w.id)?.has(r.id)).length }))
    .filter((r) => r.unblocks > 0)
    .sort((a, b) => b.unblocks - a.unblocks || byStageAndId(a, b))
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// QUEUE.md i listy zadań w decisions.md.

const AREA_ORDER = ['backend', 'web', 'mobile', 'tablet', 'shared'];
const cell = (s) => String(s ?? '').replaceAll('|', '\\|');
const link = (t) => `[${cell(t.title)}](${t.rel})`;

export function renderQueue(tasks, decisions) {
  const out = [];
  out.push('# Kolejka zadań EQUENOR', '');
  out.push(
    '> Plik generowany przez `node tasks/queue.mjs index` z nagłówków plików zadań. Nie edytuj go ręcznie:',
    '> zmieniaj pliki zadań (najlepiej komendami `claim` i `set`) i uruchom `index`.',
    '> Protokół pracy agentów: [README.md](README.md). Decyzje właściciela: [decisions.md](decisions.md).',
    '',
  );

  out.push('## Podsumowanie', '');
  out.push(`| Obszar | Katalog | ${STATUSES.join(' | ')} | Razem |`);
  out.push(`|---|---|${STATUSES.map(() => '--:').join('|')}|--:|`);
  const total = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const area of AREA_ORDER) {
    const list = tasks.filter((t) => t.area === area);
    const counts = STATUSES.map((s) => list.filter((t) => t.status === s).length);
    STATUSES.forEach((s, i) => (total[s] += counts[i]));
    out.push(`| ${AREAS[area].name} | [${area}/](${area}/) | ${counts.join(' | ')} | ${list.length} |`);
  }
  out.push(`| **Razem** | | ${STATUSES.map((s) => `**${total[s]}**`).join(' | ')} | **${tasks.length}** |`, '');
  const sizes = SIZES.map((s) => `${s}: ${tasks.filter((t) => t.size === s).length}`).join(', ');
  const openDec = decisions.filter((d) => d.status !== 'rozstrzygnięta').length;
  out.push(`Rozmiary: ${sizes}. Decyzje otwarte: ${openDec} z ${decisions.length}.`, '');

  const { ready, waiting } = readyTasks(tasks, decisions);
  out.push(`## Gotowe do wzięcia (${ready.length})`, '');
  out.push('Status `todo` i wszystkie zależności `done`. Kolejność: etap, potem ID. Komenda: `node tasks/queue.mjs next --area <obszar>`.', '');
  if (ready.length) {
    out.push('| ID | Zadanie | Obszar | Etap | Rozmiar | Decyzje (rekomendacja obowiązuje do rozstrzygnięcia) |', '|---|---|---|--:|---|---|');
    for (const t of ready) out.push(`| ${t.id} | ${link(t)} | ${t.area} | ${t.stage} | ${t.size} | ${(t.decisions ?? []).join(', ')} |`);
  } else out.push('Brak.');
  out.push('');
  if (waiting.length) {
    out.push('Gotowe, ale czekają na decyzję właściciela (pole „Blokuje” w decisions.md):', '');
    for (const t of waiting) out.push(`- ${t.id} ${link(t)}: ${t.blockedBy.join(', ')}`);
    out.push('');
  }

  const active = tasks.filter((t) => ['in_progress', 'review', 'blocked'].includes(t.status)).sort(byStageAndId);
  out.push(`## W toku, do przeglądu i zablokowane (${active.length})`, '');
  if (active.length) {
    out.push('| ID | Zadanie | Status | Wykonawca | Gałąź |', '|---|---|---|---|---|');
    for (const t of active)
      out.push(`| ${t.id} | ${link(t)} | ${t.status} | ${cell(t.owner ?? '')} | ${t.branch ? `\`${cell(t.branch)}\`` : ''} |`);
  } else out.push('Brak.');
  out.push('');

  for (const area of AREA_ORDER) {
    const list = tasks.filter((t) => t.area === area).sort(byStageAndId);
    out.push(`## ${AREAS[area].name} (${AREAS[area].prefix}, ${list.length})`, '');
    if (!list.length) {
      out.push('Brak zadań.', '');
      continue;
    }
    out.push('| ID | Zadanie | Etap | Rozmiar | Status | Zależności | Decyzje | Wymaga |', '|---|---|--:|---|---|---|---|---|');
    for (const t of list)
      out.push(
        `| ${t.id} | ${link(t)} | ${t.stage} | ${t.size} | ${t.status} | ${(t.depends_on ?? []).join(', ')} | ${(t.decisions ?? []).join(', ')} | ${(Array.isArray(t.needs) ? t.needs : []).join(', ')} |`,
      );
    out.push('');
  }

  out.push(`## Decyzje właściciela (${decisions.length})`, '');
  if (decisions.length) {
    out.push('| DEC | Temat | Status | Blokuje start | Zadań, których dotyczy |', '|---|---|---|---|--:|');
    for (const d of decisions) {
      const n = tasks.filter((t) => (t.decisions ?? []).includes(d.id)).length;
      const anchor = `decisions.md#${slugAnchor(`${d.id} · ${d.title}`)}`;
      out.push(`| ${d.id} | [${cell(d.title)}](${anchor}) | ${d.status} | ${d.blocks.join(', ')} | ${n} |`);
    }
  } else out.push('Brak.');
  out.push('');
  return out.join('\n');
}

/** Kotwica nagłówka jak w GitLabie (małe litery, bez interpunkcji, spacje → myślniki, bez powtórzonych myślników). */
export function slugAnchor(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-')
    .replace(/-{2,}/g, '-');
}

/** Przepisuje linie „- **Zadania:** …” w sekcjach decyzji na podstawie nagłówków zadań. */
export function renderDecisionsText(text, tasks) {
  const lines = text.split('\n');
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const h = /^## (DEC-\d{2,})\b/.exec(lines[i]);
    if (h) {
      cur = h[1];
      continue;
    }
    if (/^## /.test(lines[i])) cur = null;
    if (cur && lines[i].startsWith(TASKS_LINE)) {
      const list = tasks.filter((t) => (t.decisions ?? []).includes(cur)).sort(byStageAndId);
      const items = list.map((t) => `[${t.id}](${t.rel})`).join(', ');
      lines[i] = `${TASKS_LINE} ${items || 'brak'}`;
    }
  }
  return lines.join('\n');
}

export function writeIndex(root) {
  const { tasks } = loadTasks(root);
  const { decisions, text, file } = loadDecisions(root);
  const queuePath = path.join(root, 'QUEUE.md');
  fs.writeFileSync(queuePath, renderQueue(tasks, decisions));
  if (text !== null) {
    const next = renderDecisionsText(text, tasks);
    if (next !== text) fs.writeFileSync(file, next);
  }
  return queuePath;
}

function staleGenerated(root, tasks, decisions, decText) {
  const errors = [];
  const queuePath = path.join(root, 'QUEUE.md');
  const expected = renderQueue(tasks, decisions);
  if (!fs.existsSync(queuePath) || fs.readFileSync(queuePath, 'utf8') !== expected)
    errors.push('QUEUE.md nieaktualny: uruchom node tasks/queue.mjs index');
  if (decText !== null && renderDecisionsText(decText, tasks) !== decText)
    errors.push('decisions.md: listy „Zadania” nieaktualne: uruchom node tasks/queue.mjs index');
  return errors;
}

// ---------------------------------------------------------------------------
// CLI.

function parseArgs(argv) {
  const positional = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, inline] = a.slice(2).split('=', 2);
      if (inline !== undefined) opts[k] = inline;
      else if (['all', 'json', 'force'].includes(k)) opts[k] = true;
      else opts[k] = argv[++i];
    } else positional.push(a);
  }
  return { positional, opts };
}

function slugOf(task) {
  return path.basename(task.rel, '.md').slice(task.id.length + 1);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fmtTask(t) {
  const dec = (t.decisions ?? []).length ? `  [${t.decisions.join(', ')}]` : '';
  const needs = Array.isArray(t.needs) && t.needs.length ? `  wymaga: ${t.needs.join(', ')}` : '';
  return `${t.id.padEnd(8)} etap ${t.stage}  ${t.size}  ${t.status.padEnd(11)} ${t.title}${dec}${needs}\n         tasks/${t.rel}`;
}

export function main(argv, root = import.meta.dirname, log = console.log, logErr = console.error) {
  const { positional, opts } = parseArgs(argv);
  const [cmd, ...rest] = positional;
  const load = () => {
    const { tasks, errors } = loadTasks(root);
    const { decisions, text } = loadDecisions(root);
    return { tasks, loadErrors: errors, decisions, decText: text };
  };
  const findTask = (tasks, id) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) throw new Error(`nie ma zadania ${id}`);
    return t;
  };
  let areaOpt = opts.area;
  if (['next', 'list'].includes(cmd) && rest.length) {
    if (rest.length > 1 || areaOpt) throw new Error(`nieoczekiwany argument „${rest.join(' ')}” (użycie: ${cmd} [obszar] albo ${cmd} --area <obszar>)`);
    if (!(rest[0] in AREAS))
      throw new Error(`nieoczekiwany argument „${rest[0]}”: to nie obszar (dozwolone: ${Object.keys(AREAS).join(', ')}; albo --area <obszar>)`);
    areaOpt = rest[0];
  }
  if (areaOpt && !(areaOpt in AREAS)) throw new Error(`nieznany obszar ${areaOpt} (dozwolone: ${Object.keys(AREAS).join(', ')})`);

  switch (cmd) {
    case 'check': {
      const { tasks, loadErrors, decisions, decText } = load();
      const { errors, warnings } = checkAll(tasks, decisions, { loadErrors });
      if (decText === null) errors.push('brak pliku tasks/decisions.md');
      if (!errors.length) errors.push(...staleGenerated(root, tasks, decisions, decText));
      for (const w of warnings) log(`uwaga: ${w}`);
      for (const e of errors) logErr(`błąd: ${e}`);
      const byArea = AREA_ORDER.map((a) => `${a} ${tasks.filter((t) => t.area === a).length}`).join(', ');
      log(`${errors.length ? 'BŁĘDY' : 'OK'}: ${tasks.length} zadań (${byArea}), ${decisions.length} decyzji, błędów ${errors.length}, uwag ${warnings.length}`);
      return errors.length ? 1 : 0;
    }
    case 'next': {
      const { tasks, decisions } = load();
      let env;
      if (opts.env !== undefined) {
        env = String(opts.env)
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s && s !== 'none');
        const bad = env.filter((e) => !NEEDS.includes(e));
        if (bad.length) throw new Error(`nieznane środowisko ${bad.join(', ')} (dozwolone: ${NEEDS.join(', ')} albo none)`);
      }
      const { ready, waiting } = readyTasks(tasks, decisions, { area: areaOpt, env });
      const limit = opts.all ? Infinity : Number(opts.limit ?? 10);
      const shown = ready.slice(0, limit);
      const nearest = ready.length ? [] : nearestTasks(tasks, { area: areaOpt });
      const unblock = ready.length || !areaOpt ? [] : unblockers(tasks, decisions, { area: areaOpt, env });
      if (opts.json) {
        log(
          JSON.stringify(
            {
              ready: shown.map(pick),
              total: ready.length,
              waitingForDecision: waiting.map(pick),
              nearest: nearest.map((t) => ({ ...pick(t), missing: t.missing })),
              unblockers: unblock.map((t) => ({ ...pick(t), unblocks: t.unblocks })),
            },
            null,
            2,
          ),
        );
        return 0;
      }
      log(`Gotowe do wzięcia${areaOpt ? ` (${areaOpt})` : ''}${env ? ` (środowisko: ${env.join(', ') || 'none'})` : ''}: ${ready.length}${shown.length < ready.length ? `, pokazuję ${shown.length} (--all: wszystkie)` : ''}`);
      for (const t of shown) log(fmtTask(t));
      if (waiting.length) log(`Czekają na decyzję właściciela: ${waiting.map((t) => `${t.id} (${t.blockedBy.join(', ')})`).join('; ')}`);
      if (nearest.length) {
        log('Nic gotowego. Najbliższe (czekają na zależności):');
        for (const t of nearest) log(`  ${t.id.padEnd(8)} ${t.title}  ← ${t.missing.map((m) => `${m.id} (${m.status})`).join(', ')}`);
      }
      if (unblock.length) {
        log(`Gotowe zadania, które odblokują obszar ${areaOpt} (tasks/README.md punkt 1):`);
        for (const t of unblock) log(`  ${t.id.padEnd(8)} ${t.area.padEnd(8)} ${t.title}  (zależnych zadań obszaru: ${t.unblocks})`);
      }
      return 0;
    }
    case 'list': {
      const { tasks } = load();
      if (opts.status && !STATUSES.includes(opts.status)) throw new Error(`nieznany status ${opts.status}`);
      const list = tasks
        .filter((t) => (!areaOpt || t.area === areaOpt) && (!opts.status || t.status === opts.status))
        .sort(byStageAndId);
      if (opts.json) {
        log(JSON.stringify(list.map(pick), null, 2));
        return 0;
      }
      for (const t of list) log(`${t.id.padEnd(8)} ${t.status.padEnd(11)} etap ${t.stage}  ${t.size}  ${t.title}${t.owner ? `  (${t.owner})` : ''}`);
      log(`Razem: ${list.length}`);
      return 0;
    }
    case 'show': {
      const { tasks, decisions } = load();
      const t = findTask(tasks, rest[0]);
      const byId = new Map(tasks.map((x) => [x.id, x]));
      const decById = new Map(decisions.map((d) => [d.id, d]));
      const dependents = tasks.filter((x) => (x.depends_on ?? []).includes(t.id)).map((x) => x.id);
      if (opts.json) {
        log(JSON.stringify({ ...pick(t), dependents }, null, 2));
        return 0;
      }
      log(fmtTask(t));
      log(`owner: ${t.owner ?? '-'}  branch: ${t.branch ?? '-'}  trello: ${t.trello ?? '-'}`);
      log('Zależności:');
      for (const d of t.depends_on ?? []) log(`  ${d.padEnd(8)} ${byId.get(d)?.status ?? '?'}  ${byId.get(d)?.title ?? ''}`);
      log('Decyzje:');
      for (const d of t.decisions ?? [])
        log(`  ${d} ${decById.get(d)?.status ?? '?'}${decById.get(d)?.blocks.includes(t.id) ? ' (blokuje start)' : ''}  ${decById.get(d)?.title ?? ''}`);
      log(`Zależą od niego: ${dependents.join(', ') || '-'}`);
      const manual = manualCriteria(t.body);
      if (manual) log(`Kryteria ${MANUAL_TAG}: ${manual} (wymaga: ${(t.needs ?? []).join(', ') || '-'}; tasks/README.md punkt 4)`);
      return 0;
    }
    case 'index': {
      const p = writeIndex(root);
      log(`zapisano ${path.relative(process.cwd(), p) || p}`);
      return 0;
    }
    case 'claim': {
      const [id, owner, branchArg] = rest;
      if (!id || !owner) throw new Error('użycie: claim <ID> <owner> [branch]');
      const { tasks, decisions } = load();
      const t = findTask(tasks, id);
      const byId = new Map(tasks.map((x) => [x.id, x]));
      const problems = [];
      if (t.status !== 'todo' && !(t.status === 'in_progress' && t.owner === owner))
        problems.push(`status ${t.status}${t.owner ? `, wykonawca ${t.owner}` : ''}`);
      const notDone = (t.depends_on ?? []).filter((d) => byId.get(d)?.status !== 'done');
      if (notDone.length) problems.push(`niezakończone zależności: ${notDone.map((d) => `${d} (${byId.get(d)?.status})`).join(', ')}`);
      const blockedBy = blockingDecisions(t, decisions);
      if (blockedBy.length) problems.push(`czeka na decyzję: ${blockedBy.join(', ')}`);
      if (problems.length && !opts.force) throw new Error(`nie można przejąć ${id}: ${problems.join('; ')} (--force, jeśli świadomie)`);
      const branch = branchArg ?? `claude/${t.id}-${slugOf(t)}`;
      const text = fs.readFileSync(t.file, 'utf8');
      fs.writeFileSync(t.file, setFrontMatterFields(text, { status: 'in_progress', owner, branch }));
      writeIndex(root);
      log(`${id}: in_progress, owner ${owner}, branch ${branch}`);
      log(`Zacommituj tasks/ i wypchnij przed rozpoczęciem pracy (patrz tasks/README.md).`);
      return 0;
    }
    case 'set': {
      const [id, status] = rest;
      if (!id || !status) throw new Error('użycie: set <ID> <status> [--reason "…"]');
      if (!STATUSES.includes(status)) throw new Error(`nieznany status ${status} (dozwolone: ${STATUSES.join(', ')})`);
      const { tasks } = load();
      const t = findTask(tasks, id);
      const byId = new Map(tasks.map((x) => [x.id, x]));
      const updates = { status };
      let text = fs.readFileSync(t.file, 'utf8');
      if (['in_progress', 'review'].includes(status) && !t.owner)
        throw new Error(`${id} nie ma wykonawcy: najpierw claim <ID> <owner>`);
      if (status === 'done') {
        const notDone = (t.depends_on ?? []).filter((d) => byId.get(d)?.status !== 'done');
        if (notDone.length && !opts.force) throw new Error(`${id}: zależności nie są done: ${notDone.join(', ')} (--force, jeśli świadomie)`);
      }
      if (status === 'blocked') {
        if (!opts.reason) throw new Error('status blocked wymaga --reason "co blokuje (np. DEC-01, BE-013)"');
        text = appendBlockReason(text, `- ${today()}${t.owner ? ` (${t.owner})` : ''}: ${opts.reason}`);
      } else if (opts.reason) {
        text = appendBlockReason(text, `- ${today()}: ${status}: ${opts.reason}`);
      }
      if (status === 'todo') {
        updates.owner = null;
        updates.branch = null;
      }
      fs.writeFileSync(t.file, setFrontMatterFields(text, updates));
      writeIndex(root);
      log(`${id}: ${t.status} → ${status}`);
      return 0;
    }
    default:
      log(
        [
          'Kolejka zadań EQUENOR (tasks/README.md)',
          '  check                          sprawdza pliki zadań i aktualność QUEUE.md (kod 1 przy błędach)',
          '  next [A | --area A] [--all]    zadania gotowe do wzięcia (domyślnie 10; --limit N, --json, --env E,…|none)',
          '  list [A | --area A] [--status S]  lista zadań (--json)',
          '  show <ID>                      zależności, decyzje i zadania zależne',
          '  index                          generuje tasks/QUEUE.md i listy w decisions.md',
          '  claim <ID> <owner> [branch]    przejęcie zadania (status in_progress)',
          '  set <ID> <status> [--reason]   todo | in_progress | review | done | blocked',
          `Obszary: ${Object.keys(AREAS).join(', ')}`,
        ].join('\n'),
      );
      return cmd ? 1 : 0;
  }
}

function pick(t) {
  const { id, title, area, stage, size, status, depends_on, decisions, needs, owner, branch, trello, rel, blockedBy } = t;
  return {
    id,
    title,
    area,
    stage,
    size,
    status,
    depends_on,
    decisions,
    needs: Array.isArray(needs) ? needs : [],
    owner,
    branch,
    trello,
    file: `tasks/${rel}`,
    ...(blockedBy?.length ? { blockedBy } : {}),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    console.error(`błąd: ${e.message}`);
    process.exitCode = 1;
  }
}
