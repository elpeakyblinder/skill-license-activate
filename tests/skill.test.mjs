import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillName = 'skill-license-activate';
const skill = join(root, skillName);
const read = (path) => readFileSync(path, 'utf8');

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (['.git', 'node_modules', '.agents', '.claude', '.cursor'].includes(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

function targets(text) {
  return [
    ...[...text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]),
    ...[...text.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
  ].filter((target) => !/^(https?:|mailto:)/.test(target));
}

function anchors(text) {
  const ids = new Set([...text.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    ids.add(match[1].toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-'));
  }
  return ids;
}

function checkLinks(file, boundary) {
  for (const target of targets(read(file))) {
    const [filename, fragment] = target.split('#');
    assert.ok(!isAbsolute(filename), `${file}: absolute local link ${target}`);
    const destination = filename ? resolve(dirname(file), filename) : file;
    const rel = relative(boundary, destination);
    assert.ok(rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel), `${file}: escaping link ${target}`);
    assert.ok(existsSync(destination), `${file}: missing target ${target}`);
    if (fragment && destination.endsWith('.md')) {
      assert.ok(anchors(read(destination)).has(decodeURIComponent(fragment)), `${file}: missing anchor ${target}`);
    }
  }
}

test('the installable folder works when copied alone, with all references and legal notices', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'license-skill-test-'));
  assert.ok(relative(tmpdir(), temporary).startsWith('license-skill-test-'));
  try {
    const copy = join(temporary, skillName);
    cpSync(skill, copy, { recursive: true });
    assert.ok(existsSync(join(copy, 'LICENSE')));
    for (const file of files(copy).filter((path) => path.endsWith('.md'))) checkLinks(file, copy);
  } finally {
    // Only the fresh temporary directory created above can be removed.
    assert.equal(dirname(temporary), resolve(tmpdir()));
    assert.ok(temporary.startsWith(resolve(tmpdir()) + sep));
    rmSync(temporary, { recursive: true, force: true });
  }
});

test('repository Markdown and HTML links, images and navigation anchors resolve', () => {
  for (const file of files(root).filter((path) => path.endsWith('.md'))) checkLinks(file, root);
});

test('the official license is unchanged and accompanies both distribution roots', () => {
  const license = read(join(root, 'LICENSE'));
  assert.equal(read(join(skill, 'LICENSE')), license);
  assert.ok(license.startsWith('Attribution-NonCommercial 4.0 International'));
  assert.ok(license.includes('Section 5 -- Disclaimer of Warranties and Limitation of Liability.'));
  const instructions = read(join(skill, 'SKILL.md'));
  assert.match(instructions, /^license: CC-BY-NC-4\.0$/m);
  assert.match(instructions, /\[CC BY-NC 4\.0\]\(LICENSE\)/);
});

test('version, frontmatter and both README release indicators agree', () => {
  const version = read(join(root, 'VERSION')).trim();
  assert.match(version, /^\d+\.\d+\.\d+$/);
  const instructions = read(join(skill, 'SKILL.md'));
  assert.ok(instructions.startsWith(`---\nname: ${skillName}\n`));
  const description = instructions.match(/^description: (.+)$/m)?.[1];
  assert.ok(description && description.length <= 1024);
  assert.equal(instructions.match(/^  version: "([^"]+)"$/m)?.[1], version);
  assert.ok(read(join(root, 'CHANGELOG.md')).includes(`## ${version} — `));
  for (const name of ['README.md', 'README.en.md']) {
    assert.ok(read(join(root, name)).includes(`version-${version}-`));
    assert.ok(read(join(root, name)).includes(`**${version}**`));
  }
});

test('localized banners are accessible and README presentation has no decorative emoji', () => {
  for (const [name, banner] of [['README.md', 'banner.svg'], ['README.en.md', 'banner.en.svg']]) {
    const text = read(join(root, name));
    assert.doesNotMatch(text, /[🀀-🫿☀-➿]/u);
    assert.ok(text.includes(`src="assets/${banner}"`));
    assert.match(text, /<img src="assets\/[^"]+" alt="[^"]+"/);
    const svg = read(join(root, 'assets', banner));
    assert.match(svg, /^<svg /);
    assert.match(svg, /role="img"/);
    assert.match(svg, /aria-labelledby="title desc"/);
    assert.match(svg, /<title id="title">[^<]+<\/title>/);
    assert.match(svg, /<desc id="desc">[^<]+<\/desc>/);
    assert.doesNotMatch(svg, /<script|<foreignObject|(?:href|src)="https?:/i);
  }
});

test('governance, reporting templates and bilingual synthetic scenarios ship together', () => {
  for (const path of [
    'CONTRIBUTING.md', 'SECURITY.md', 'PUBLICAR.md',
    '.github/pull_request_template.md', '.github/ISSUE_TEMPLATE/config.yml',
    '.github/ISSUE_TEMPLATE/bug_report.md', '.github/ISSUE_TEMPLATE/proposal.md',
    'examples/activacion-concurrente.md', 'examples/concurrent-activation.md',
    'examples/recuperacion-offline.md', 'examples/offline-recovery.md',
  ]) assert.ok(existsSync(join(root, path)), path);
  assert.ok(!existsSync(join(root, 'SKILL.md')), 'One canonical installable entrypoint');
});

test('Codex metadata preserves the name and normal implicit invocation', () => {
  const metadata = read(join(skill, 'agents/openai.yaml'));
  assert.match(metadata, new RegExp(`\\$${skillName}`));
  assert.match(metadata, /^  allow_implicit_invocation: true$/m);
  const shortDescription = metadata.match(/^  short_description: "([^"]+)"$/m)?.[1];
  assert.ok(shortDescription && shortDescription.length >= 25 && shortDescription.length <= 64);
});

test('public documents do not include machine paths or private-key blocks', () => {
  const excluded = /(?:[A-Za-z]:[\\/](?:Users|ProgramData)|file:\/\/\/|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY)/i;
  for (const file of files(root).filter((path) => /\.(md|svg|ya?ml)$/.test(path))) {
    assert.doesNotMatch(read(file), excluded, relative(root, file));
  }
});
