// Testy kolejki: node --test tasks/queue.test.mjs
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  REQUIRED_SECTIONS,
  ancestorsMap,
  appendBlockReason,
  checkAll,
  codeStateText,
  findCycles,
  formatValue,
  loadDecisions,
  loadTasks,
  main,
  manualCriteria,
  nearestTasks,
  parseDecisions,
  slugAnchor,
  parseFrontMatter,
  readyTasks,
  setFrontMatterFields,
  unblockers,
} from './queue.mjs';

const body = (id) =>
  `# ${id} · Tytuł\n\n${REQUIRED_SECTIONS.map((s) => `## ${s}\n- treść\n`).join('\n')}`;

function taskFile({ id, area, stage = 0, status = 'todo', deps = [], decisions = [], owner = '', needs, text }) {
  return [
    '---',
    `id: ${id}`,
    `title: "Zadanie ${id}: test"`,
    `area: ${area}`,
    `stage: ${stage}`,
    'size: M',
    `status: ${status}`,
    `depends_on: [${deps.join(', ')}]`,
    `decisions: [${decisions.join(', ')}]`,
    ...(needs ? [`needs: [${needs.join(', ')}]`] : []),
    `owner:${owner ? ` ${owner}` : ''}`,
    'branch:',
    'trello:',
    '---',
    text ?? body(id),
  ].join('\n');
}

const DECISIONS = `# Decyzje

## DEC-01 · Broker
- **Status:** otwarta
- **Blokuje:** brak
- **Zadania:**

## DEC-02 · Dostawca SMS
- **Status:** otwarta
- **Blokuje:** BE-003
- **Zadania:**
`;

const roots = [];
after(() => roots.forEach((r) => fs.rmSync(r, { recursive: true, force: true })));

function fixture(tasks, decisions = DECISIONS) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'queue-test-'));
  roots.push(root);
  for (const t of tasks) {
    fs.mkdirSync(path.join(root, t.area), { recursive: true });
    fs.writeFileSync(path.join(root, t.area, `${t.id}-x.md`), taskFile(t));
  }
  fs.writeFileSync(path.join(root, 'decisions.md'), decisions);
  return root;
}

function run(root, ...args) {
  const out = [];
  const err = [];
  const code = main(args, root, (l) => out.push(l), (l) => err.push(l));
  return { code, out: out.join('\n'), err: err.join('\n') };
}

test('parseFrontMatter: skalary, cudzysłowy, listy i puste wartości', () => {
  const { data } = parseFrontMatter(
    '---\nid: BE-001\ntitle: "lib/db: Drizzle, migrator"\nstage: 3\nsize: L\ndepends_on: [BE-002, "SH-001"]\ndecisions: []\nowner:\nquote: \'it\'\'s\'\n---\n# x\n',
  );
  assert.deepEqual(data, {
    id: 'BE-001',
    title: 'lib/db: Drizzle, migrator',
    stage: 3,
    size: 'L',
    depends_on: ['BE-002', 'SH-001'],
    decisions: [],
    owner: null,
    quote: "it's",
  });
});

test('slugAnchor: kotwice jak w GitLabie', () => {
  assert.equal(slugAnchor('DEC-02 · Położenie kodu apki mobilnej i tabletu'), 'dec-02-położenie-kodu-apki-mobilnej-i-tabletu');
  assert.equal(slugAnchor('DEC-01 · Kolejki: SNS/SQS czy self-hosted'), 'dec-01-kolejki-snssqs-czy-self-hosted');
});

test('parseFrontMatter: błędy formatu', () => {
  assert.throws(() => parseFrontMatter('# bez nagłówka\n'), /brak nagłówka/);
  assert.throws(() => parseFrontMatter('---\nid: BE-001\n'), /niedomknięty/);
  assert.throws(() => parseFrontMatter('---\nto nie jest para\n---\n'), /klucz: wartość/);
  assert.throws(() => parseFrontMatter('---\nx: [a, b\n---\n'), /niedomknięta lista/);
});

test('setFrontMatterFields: zmienia tylko wskazane klucze i cytuje, gdy trzeba', () => {
  const text = taskFile({ id: 'BE-001', area: 'backend' });
  const next = setFrontMatterFields(text, { status: 'in_progress', owner: 'agent-1', branch: 'claude/BE-001-x', extra: 'a: b' });
  const { data, body: b } = parseFrontMatter(next);
  assert.equal(data.status, 'in_progress');
  assert.equal(data.owner, 'agent-1');
  assert.equal(data.branch, 'claude/BE-001-x');
  assert.equal(data.extra, 'a: b');
  assert.equal(data.title, 'Zadanie BE-001: test');
  assert.equal(b, parseFrontMatter(text).body);
  assert.equal(formatValue(null), '');
  assert.equal(formatValue(['A', 'B']), '[A, B]');
  assert.equal(formatValue('123'), '"123"');
});

test('appendBlockReason: tworzy sekcję i dopisuje kolejne powody', () => {
  let text = taskFile({ id: 'BE-001', area: 'backend' });
  text = appendBlockReason(text, '- 2026-10-14: czeka na DEC-01');
  text = appendBlockReason(text, '- 2026-10-15: dalej czeka');
  const section = text.slice(text.indexOf('## Blokada'));
  assert.match(section, /czeka na DEC-01\n- 2026-10-15: dalej czeka/);
});

test('parseDecisions: status i lista blokowanych zadań', () => {
  const d = parseDecisions(DECISIONS);
  assert.deepEqual(
    d.map((x) => [x.id, x.status, x.blocks]),
    [
      ['DEC-01', 'otwarta', []],
      ['DEC-02', 'otwarta', ['BE-003']],
    ],
  );
});

test('findCycles: wykrywa cykl i nie zgłasza grafu bez cyklu', () => {
  const t = (id, deps) => ({ id, stage: 0, depends_on: deps });
  assert.deepEqual(findCycles([t('BE-001', []), t('BE-002', ['BE-001']), t('BE-003', ['BE-001', 'BE-002'])]), []);
  const cycles = findCycles([t('BE-001', ['BE-003']), t('BE-002', ['BE-001']), t('BE-003', ['BE-002']), t('BE-004', [])]);
  assert.equal(cycles.length, 1);
  assert.deepEqual(new Set(cycles[0]), new Set(['BE-001', 'BE-002', 'BE-003']));
});

test('check: zgłasza złe ID, obszar, zależności, decyzje, sekcje i cykle', () => {
  const root = fixture([
    { id: 'BE-001', area: 'backend' },
    { id: 'BE-002', area: 'backend', deps: ['BE-003'] },
    { id: 'BE-003', area: 'backend', deps: ['BE-002'] },
    { id: 'BE-004', area: 'backend', deps: ['BE-999'], decisions: ['DEC-09'] },
    { id: 'WEB-001', area: 'backend' },
    { id: 'MOB-001', area: 'mobile', status: 'started' },
  ]);
  fs.writeFileSync(path.join(root, 'backend', 'BE-005-x.md'), taskFile({ id: 'BE-005', area: 'backend' }).replace('## Testy', '## Testy?'));
  const { tasks, errors: loadErrors } = loadTasks(root);
  const { decisions } = loadDecisions(root);
  const { errors } = checkAll(tasks, decisions, { loadErrors });
  const all = errors.join('\n');
  assert.match(all, /cykl zależności/);
  assert.match(all, /zależność BE-999 nie istnieje/);
  assert.match(all, /decyzja DEC-09 nie istnieje/);
  assert.match(all, /WEB-001 nie pasuje do obszaru backend/);
  assert.match(all, /status „started”/);
  assert.match(all, /BE-005-x.md: brak sekcji „## Testy”/);
  assert.equal(run(root, 'check').code, 1);
});

test('check: poprawna kolejka przechodzi po index, a nieaktualny QUEUE.md jest błędem', () => {
  const root = fixture(
    [
      { id: 'BE-001', area: 'backend', decisions: ['DEC-01'] },
      { id: 'WEB-001', area: 'web', deps: ['BE-001'] },
    ],
    DECISIONS.replace('- **Blokuje:** BE-003', '- **Blokuje:** brak'),
  );
  assert.equal(run(root, 'check').code, 1, 'bez QUEUE.md');
  assert.equal(run(root, 'index').code, 0);
  const res = run(root, 'check');
  assert.equal(res.code, 0, res.err);
  const queue = fs.readFileSync(path.join(root, 'QUEUE.md'), 'utf8');
  assert.match(queue, /\| BE-001 \| \[Zadanie BE-001: test\]\(backend\/BE-001-x\.md\) \| 0 \| M \| todo \|/);
  assert.match(fs.readFileSync(path.join(root, 'decisions.md'), 'utf8'), /- \*\*Zadania:\*\* \[BE-001\]\(backend\/BE-001-x\.md\)/);
  fs.appendFileSync(path.join(root, 'web', 'WEB-001-x.md'), '\n');
  assert.equal(run(root, 'check').code, 0, 'zmiana treści bez zmiany nagłówka nie psuje QUEUE.md');
  const f = path.join(root, 'web', 'WEB-001-x.md');
  fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace('size: M', 'size: S'));
  assert.equal(run(root, 'check').code, 1, 'zmiana nagłówka wymaga index');
});

test('next: tylko todo z zależnościami done, sortowanie po etapie i ID, filtr obszaru, blokada decyzją', () => {
  const tasks = [
    { id: 'BE-001', area: 'backend', stage: 0, status: 'done', depends_on: [] },
    { id: 'BE-002', area: 'backend', stage: 1, status: 'todo', depends_on: ['BE-001'] },
    { id: 'BE-003', area: 'backend', stage: 0, status: 'todo', depends_on: [] },
    { id: 'BE-004', area: 'backend', stage: 0, status: 'todo', depends_on: ['BE-002'] },
    { id: 'BE-005', area: 'backend', stage: 0, status: 'in_progress', depends_on: [] },
    { id: 'WEB-001', area: 'web', stage: 0, status: 'todo', depends_on: ['BE-001'] },
    { id: 'SH-001', area: 'shared', stage: 0, status: 'todo', depends_on: [] },
  ];
  const decisions = parseDecisions(DECISIONS);
  const { ready, waiting } = readyTasks(tasks, decisions);
  assert.deepEqual(
    ready.map((t) => t.id),
    ['SH-001', 'WEB-001', 'BE-002'],
  );
  assert.deepEqual(
    waiting.map((t) => [t.id, t.blockedBy]),
    [['BE-003', ['DEC-02']]],
  );
  assert.deepEqual(
    readyTasks(tasks, decisions, { area: 'backend' }).ready.map((t) => t.id),
    ['BE-002'],
  );
  assert.deepEqual(
    nearestTasks(tasks, { area: 'backend' }).map((t) => [t.id, t.missing.map((m) => `${m.id}:${m.status}`)]),
    [['BE-004', ['BE-002:todo']]],
  );
  const resolved = decisions.map((d) => ({ ...d, status: 'rozstrzygnięta' }));
  assert.deepEqual(
    readyTasks(tasks, resolved, { area: 'backend' }).ready.map((t) => t.id),
    ['BE-003', 'BE-002'],
  );
});

test('claim i set: zmieniają nagłówek, pilnują zależności i odświeżają QUEUE.md', () => {
  const root = fixture([
    { id: 'BE-001', area: 'backend' },
    { id: 'BE-002', area: 'backend', deps: ['BE-001'] },
    { id: 'BE-003', area: 'backend' },
  ]);
  assert.throws(() => run(root, 'claim', 'BE-002', 'agent-1'), /niezakończone zależności: BE-001/);
  assert.throws(() => run(root, 'claim', 'BE-003', 'agent-1'), /czeka na decyzję: DEC-02/);
  assert.equal(run(root, 'claim', 'BE-001', 'agent-1').code, 0);
  let t = loadTasks(root).tasks.find((x) => x.id === 'BE-001');
  assert.deepEqual([t.status, t.owner, t.branch], ['in_progress', 'agent-1', 'claude/BE-001-x']);
  assert.throws(() => run(root, 'claim', 'BE-001', 'agent-2'), /status in_progress/);
  assert.throws(() => run(root, 'set', 'BE-001', 'blocked'), /wymaga --reason/);
  assert.equal(run(root, 'set', 'BE-001', 'blocked', '--reason', 'czeka na DEC-01').code, 0);
  assert.match(fs.readFileSync(path.join(root, 'backend', 'BE-001-x.md'), 'utf8'), /## Blokada\n- \d{4}-\d{2}-\d{2} \(agent-1\): czeka na DEC-01/);
  assert.equal(run(root, 'set', 'BE-001', 'done').code, 0);
  assert.equal(run(root, 'claim', 'BE-002', 'agent-2', 'feature/x').code, 0);
  t = loadTasks(root).tasks.find((x) => x.id === 'BE-002');
  assert.equal(t.branch, 'feature/x');
  assert.equal(run(root, 'set', 'BE-002', 'todo').code, 0);
  t = loadTasks(root).tasks.find((x) => x.id === 'BE-002');
  assert.deepEqual([t.status, t.owner, t.branch], ['todo', null, null]);
  assert.match(fs.readFileSync(path.join(root, 'QUEUE.md'), 'utf8'), /\| BE-001 \|.*\| done \|/);
  assert.equal(run(root, 'check').code, 0);
});

test('prawdziwa kolejka w repo przechodzi check', () => {
  const res = run(import.meta.dirname, 'check');
  assert.equal(res.code, 0, res.err);
});

const bodyWith = (id, parts) =>
  `# ${id} · Tytuł\n\n${REQUIRED_SECTIONS.map((s) => `## ${s}\n${parts[s] ?? '- treść'}\n`).join('\n')}`;

test('check: zadania ze „Stan kodu” i „Testy” spoza depends_on dają uwagę, dep-ok ją wycisza', () => {
  const text = (extra = '') =>
    bodyWith('WEB-002', {
      Kontekst: '- **Stan kodu:** komponenty z WEB-001, kolejka z MOB-001 i kontrakt z BE-001.\n- **Dokumenty:** WEB-003 tylko w dokumentach',
      Testy: '- Playwright na atrapie z SH-001.',
      'Uwagi dla wykonawcy': `- uwaga${extra}`,
    });
  const tasks = [
    { id: 'BE-001', area: 'backend' },
    { id: 'WEB-001', area: 'web', deps: ['BE-001'] },
    { id: 'WEB-002', area: 'web', deps: ['WEB-001'], text: text() },
    { id: 'WEB-003', area: 'web', deps: ['WEB-002'] },
    { id: 'MOB-001', area: 'mobile' },
    { id: 'SH-001', area: 'shared' },
  ];
  let root = fixture(tasks);
  let { tasks: loaded } = loadTasks(root);
  let { warnings } = checkAll(loaded, parseDecisions(DECISIONS));
  const w = warnings.filter((x) => x.includes('WEB-002'));
  assert.equal(w.length, 1, warnings.join('\n'));
  assert.match(w[0], /korzystają z MOB-001, SH-001,/);
  assert.equal(codeStateText(loaded.find((x) => x.id === 'WEB-002').body).includes('WEB-003'), false, 'tylko punkt „Stan kodu”');
  assert.equal(ancestorsMap(loaded).get('WEB-003').has('BE-001'), true);
  root = fixture(tasks.map((x) => (x.id === 'WEB-002' ? { ...x, text: text('\n<!-- dep-ok: MOB-001, SH-001 (wzór) -->') } : x)));
  ({ tasks: loaded } = loadTasks(root));
  ({ warnings } = checkAll(loaded, parseDecisions(DECISIONS)));
  assert.deepEqual(warnings.filter((x) => x.includes('WEB-002')), []);
});

test('check: DEC cytowana w treści poza „Poza zakresem” musi być w decisions', () => {
  const text = bodyWith('BE-001', { Kontekst: '- Decyzje: DEC-01 A.', 'Poza zakresem': '- coś innego (DEC-02).' });
  let root = fixture([{ id: 'BE-001', area: 'backend', text }]);
  let { warnings } = checkAll(loadTasks(root).tasks, parseDecisions(DECISIONS));
  assert.equal(warnings.length, 1, warnings.join('\n'));
  assert.match(warnings[0], /cytuje DEC-01, których nie ma w decisions/);
  root = fixture([{ id: 'BE-001', area: 'backend', text, decisions: ['DEC-01'] }]);
  ({ warnings } = checkAll(loadTasks(root).tasks, parseDecisions(DECISIONS)));
  assert.deepEqual(warnings, []);
});

test('check i next: needs, kryteria [ręcznie] i filtr --env', () => {
  const manual = bodyWith('TAB-001', { 'Kryteria akceptacji': '- [ ] Jest zielony.\n- [ ] [ręcznie] Na emulatorze działa.' });
  const root = fixture(
    [
      { id: 'TAB-001', area: 'tablet', text: manual, needs: ['emulator'] },
      { id: 'TAB-002', area: 'tablet', text: manual },
      { id: 'TAB-003', area: 'tablet', needs: ['kvm'] },
      { id: 'TAB-004', area: 'tablet' },
    ],
    DECISIONS.replace('- **Blokuje:** BE-003', '- **Blokuje:** brak'),
  );
  const { tasks } = loadTasks(root);
  const { errors, warnings } = checkAll(tasks, parseDecisions(DECISIONS));
  assert.match(errors.join('\n'), /needs „kvm”/);
  assert.match(warnings.join('\n'), /TAB-002-x\.md: kryteria \[ręcznie\] bez pola needs/);
  assert.match(warnings.join('\n'), /TAB-003-x\.md: needs bez kryteriów/);
  assert.equal(manualCriteria(tasks.find((x) => x.id === 'TAB-001').body), 1);
  const ok = tasks.filter((x) => x.id !== 'TAB-003');
  assert.deepEqual(readyTasks(ok, [], { env: [] }).ready.map((x) => x.id), ['TAB-002', 'TAB-004']);
  assert.deepEqual(readyTasks(ok, [], { env: ['emulator'] }).ready.map((x) => x.id), ['TAB-001', 'TAB-002', 'TAB-004']);
  fs.rmSync(path.join(root, 'tablet', 'TAB-003-x.md'));
  run(root, 'index');
  assert.match(run(root, 'next', '--env', 'none').out, /Gotowe do wzięcia \(środowisko: none\): 2/);
  assert.throws(() => run(root, 'next', '--env', 'kvm'), /nieznane środowisko kvm/);
  assert.match(run(root, 'show', 'TAB-001').out, /Kryteria \[ręcznie\]: 1 \(wymaga: emulator/);
});

test('next i list: obszar jako argument pozycyjny, nieznany argument to błąd', () => {
  const root = fixture(
    [
      { id: 'BE-001', area: 'backend' },
      { id: 'WEB-001', area: 'web', deps: ['BE-001'] },
    ],
    DECISIONS.replace('- **Blokuje:** BE-003', '- **Blokuje:** brak'),
  );
  run(root, 'index');
  assert.match(run(root, 'next', 'backend').out, /Gotowe do wzięcia \(backend\): 1/);
  const web = run(root, 'next', 'web').out;
  assert.match(web, /Gotowe do wzięcia \(web\): 0/);
  assert.match(web, /odblokują obszar web[\s\S]*BE-001/);
  assert.match(run(root, 'list', 'web').out, /^WEB-001 /);
  assert.doesNotMatch(run(root, 'list', 'web').out, /BE-001/);
  assert.throws(() => run(root, 'next', 'bakend'), /nieoczekiwany argument „bakend”/);
  assert.throws(() => run(root, 'list', 'web', 'backend'), /nieoczekiwany argument/);
  assert.throws(() => run(root, 'next', 'web', '--area', 'backend'), /nieoczekiwany argument/);
  const { tasks } = loadTasks(root);
  assert.deepEqual(unblockers(tasks, [], { area: 'web' }).map((x) => [x.id, x.unblocks]), [['BE-001', 1]]);
});
