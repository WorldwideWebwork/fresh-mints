// Guards the frontend consolidation (AGENTS.md 1.F, 2.A). Two frontends once lived side
// by side and silently diverged: state ordering, the state options export name, and
// nursing and beauty pricing. These assertions walk the real filesystem so they fail on
// a recurrence of that drift, not merely on a missing file from a remembered list.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { US_STATES } from './states';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const TYPES_HOME = 'src/lib/types/';
const SKIPPED_DIRS = new Set(['node_modules', '.git', 'dist', 'docs', '.superpowers', '.next', 'coverage']);
const CODE_FILE = /\.(?:[cm]?[jt]sx?|svelte)$/;
const ROOT_TOOLCHAIN_CONFIG = /^[^/]+\.config\.[cm]?[jt]s$/;
const CANONICAL_SYMBOLS = ['Lead', 'ProfessionCategory', 'PROFESSION_CONFIGS', 'US_STATES'];
const FRAMEWORK_PACKAGES = ['react', 'react-dom', 'next'];
const FRAMEWORK_IMPORT = /(?:from|import|require\()\s*['"](?:react|react-dom|next)(?:\/[^'"]*)?['"]/;
const MAX_TYPE_FILE_LINES = 500;
const STATE_TABLE_THRESHOLD = 5;

const toPosix = (path: string): string => path.split(sep).join('/');

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return SKIPPED_DIRS.has(entry.name) ? [] : listFiles(path);
    return entry.isFile() ? [toPosix(relative(ROOT, path))] : [];
  });
}

function listDirNames(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !SKIPPED_DIRS.has(entry.name))
    .map((entry) => entry.name);
}

// A declaration, not a mention: imports (`import { type Lead }`), `from` re-exports and
// usages such as `const row: Lead` are deliberately not matched.
function declarationPattern(name: string): RegExp {
  const forms = [
    String.raw`(?:const|let|var)\s+${name}\s*[:=]`,
    String.raw`(?:abstract\s+)?(?:class|interface|enum)\s+${name}\b`,
    String.raw`type\s+${name}\s*(?:<[^=\n]*>\s*)?=`,
    String.raw`(?:async\s+)?function\s*\*?\s*${name}\s*[(<]`,
  ];
  const direct = String.raw`^[ \t]*(?:export\s+)?(?:declare\s+)?(?:${forms.join('|')})`;
  const renamed = String.raw`^[ \t]*export\s+(?:type\s+)?\{[^}]*\bas\s+${name}\b[^}]*\}(?!\s*from)`;
  return new RegExp(`${direct}|${renamed}`, 'm');
}

// The substring check is a cheap prefilter so the exported-symbol sweep stays fast.
const declares = (source: string, name: string): boolean =>
  source.includes(name) && declarationPattern(name).test(source);

const allFiles = listFiles(ROOT);
const codeFiles = allFiles.filter((file) => CODE_FILE.test(file));
const sources = new Map(codeFiles.map((file) => [file, readFileSync(join(ROOT, file), 'utf8')]));
const sourceOf = (file: string): string => sources.get(file) ?? '';

const ownersOf = (name: string): string[] => codeFiles.filter((file) => declares(sourceOf(file), name));
const isTypeFile = (file: string): boolean =>
  /\.ts$/.test(file) && !/\.test\.ts$/.test(file) && (/\.d\.ts$/.test(file) || /(?:^|\/)types\//.test(file));
const typeFiles = codeFiles.filter(isTypeFile);
const countLines = (source: string): number => source.replace(/\n$/, '').split('\n').length;

function exportedNames(source: string): string[] {
  const exported = /^export\s+(?:declare\s+)?(?:const|let|var|function|class|interface|enum|type)\s+(\w+)/gm;
  return [...source.matchAll(exported)].map((match) => match[1]);
}

describe('declaration detector', () => {
  const declarations = [
    'export const PROFESSION_CONFIGS = {};',
    'const US_STATES: unknown[] = [];',
    'export interface Lead {}',
    'type Lead = { id: string };',
    'export type Lead<T> = { id: T };',
    'export function Lead() {}',
    'export { somethingElse as ProfessionCategory };',
  ];
  const mentions = [
    "import { type Lead, PROFESSION_CONFIGS } from './lead';",
    '  type Lead,',
    "export { Lead } from './lead';",
    "export type { Lead } from './lead';",
    "export { thing as Lead } from './lead';",
    'const row: Lead = build();',
    '// export const US_STATES = [];',
    'const US_STATES_COUNT = 50;',
    'interface LeadRow {}',
  ];

  it.each(declarations)('matches the declaration %s', (line) => {
    const matched = CANONICAL_SYMBOLS.filter((name) => declares(line, name));
    expect(matched).toHaveLength(1);
  });

  it.each(mentions)('ignores the mention %s', (line) => {
    const matched = CANONICAL_SYMBOLS.filter((name) => declares(line, name));
    expect(matched).toEqual([]);
  });
});

describe('one canonical definition per pattern', () => {
  it.each(CANONICAL_SYMBOLS)('declares %s in exactly one file, under src/lib/types', (name) => {
    const owners = ownersOf(name);
    expect(owners, `${name} is declared in: ${owners.join(', ') || 'no file'}`).toHaveLength(1);
    expect(owners[0].startsWith(TYPES_HOME), `${name} must live under ${TYPES_HOME}`).toBe(true);
  });

  it('declares every symbol exported by src/lib/types in exactly one file', () => {
    const typesSources = codeFiles.filter((file) => isTypeFile(file) && file.startsWith(TYPES_HOME));
    const names = new Set(typesSources.flatMap((file) => exportedNames(sourceOf(file))));
    const duplicated = [...names].map((name) => ({ name, owners: ownersOf(name) })).filter(({ owners }) => owners.length > 1);
    expect(names.size).toBeGreaterThan(0);
    expect(duplicated).toEqual([]);
  });

  it('keeps the US state table out of every other file, whatever it is named', () => {
    const [stateOwner] = ownersOf('US_STATES');
    const exempt = new Set([stateOwner, stateOwner.replace(/\.ts$/, '.test.ts')]);
    const quoted = (source: string, text: string): boolean => ["'", '"', '`'].some((q) => source.includes(`${q}${text}${q}`));
    const statesIn = (source: string): number =>
      US_STATES.filter((state) => quoted(source, state.name) || quoted(source, state.fullName)).length;
    const tables = codeFiles
      .filter((file) => !exempt.has(file))
      .map((file) => ({ file, states: statesIn(sourceOf(file)) }))
      .filter(({ states }) => states >= STATE_TABLE_THRESHOLD);
    expect(tables).toEqual([]);
  });
});

describe('no parallel frontend tree', () => {
  it('has no root directory shadowing a live src directory', () => {
    const hasCode = (dir: string): boolean => codeFiles.some((file) => file.startsWith(`src/${dir}/`) || file.startsWith(`src/lib/${dir}/`));
    const live = [...listDirNames(join(ROOT, 'src')), ...listDirNames(join(ROOT, 'src/lib'))].filter(hasCode);
    const shadows = listDirNames(ROOT).filter((name) => live.includes(name));
    expect(live.length).toBeGreaterThan(0);
    expect(shadows).toEqual([]);
  });

  it('keeps all source under src, apart from root toolchain config', () => {
    const stray = codeFiles.filter((file) => !file.startsWith('src/') && !ROOT_TOOLCHAIN_CONFIG.test(file));
    expect(stray).toEqual([]);
  });

  it('has no Next.js root artifacts', () => {
    const nextArtifacts = allFiles.filter((file) => /^(?:next\.config\.[^/]+|next-env\.d\.ts|middleware\.[jt]s)$/.test(file));
    expect(nextArtifacts).toEqual([]);
  });

  it('has no react or next dependency, JSX file or import', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    const declared = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const jsxFiles = codeFiles.filter((file) => /\.[jt]sx$/.test(file));
    const importers = codeFiles.filter((file) => FRAMEWORK_IMPORT.test(sourceOf(file)));
    expect(declared.filter((name) => FRAMEWORK_PACKAGES.includes(name))).toEqual([]);
    expect(jsxFiles).toEqual([]);
    expect(importers).toEqual([]);
  });
});

describe('domain type file size (AGENTS.md 2.A)', () => {
  it('keeps every type file within the line limit', () => {
    const oversized = typeFiles
      .map((file) => ({ file, lines: countLines(sourceOf(file)) }))
      .filter(({ lines }) => lines > MAX_TYPE_FILE_LINES);
    expect(typeFiles.length).toBeGreaterThan(0);
    expect(oversized).toEqual([]);
  });
});
