// validates data/portfolio.json (npm run check)
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const problems = [];
const exists = (p) => access(resolve(ROOT, p)).then(() => true, () => false);
const isStringArray = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string');

let data;
try {
  data = JSON.parse(await readFile(resolve(ROOT, 'data/portfolio.json'), 'utf8'));
} catch (err) {
  console.error(`data/portfolio.json: ${err.message}`);
  process.exit(1);
}

async function checkFile(tag, field, file) {
  if (file && !(await exists(file))) problems.push(`${tag}: ${field} points to a missing file: ${file}`);
}

function checkLinks(tag, links) {
  if (links == null) return;
  if (!Array.isArray(links)) return problems.push(`${tag}: links must be an array`);
  links.forEach((l, i) => {
    if (!l?.label || !l?.url) problems.push(`${tag}: links[${i}] needs both label and url`);
  });
}

const site = data.site ?? {};
const types = new Set((site.sections ?? []).map((s) => s.type));
if (!site.title) problems.push('site.title is missing');
if (!site.owner) problems.push('site.owner is missing');
if (!types.size) problems.push('site.sections is empty');
for (const s of site.sections ?? []) if (!s.type || !s.label) problems.push('every site.sections entry needs type and label');
await checkFile('site', 'avatar', site.avatar);
await checkFile('site', 'avatar_pixel', site.avatar_pixel);
if (site.avatar_pixel && !site.avatar) problems.push('site.avatar_pixel needs site.avatar as well (4K uses it)');
checkLinks('site', site.links);

const ids = new Set();
let improvements = 0;
let logs = 0;

for (const p of data.projects ?? []) {
  const tag = p.id ?? p.title ?? '(unnamed project)';
  if (!p.id) problems.push(`${tag}: id is missing`);
  else if (ids.has(p.id)) problems.push(`${tag}: duplicate project id`);
  ids.add(p.id);
  if (!p.title) problems.push(`${tag}: title is missing`);
  if (!types.has(p.type)) problems.push(`${tag}: type "${p.type}" is not in site.sections`);
  await checkFile(tag, 'thumbnail', p.thumbnail);
  await checkFile(tag, 'thumbnail_pixel', p.thumbnail_pixel);
  if (p.thumbnail_pixel && !p.thumbnail) problems.push(`${tag}: thumbnail_pixel needs thumbnail as well (4K uses it)`);
  await checkFile(tag, 'aboutFile', p.aboutFile);
  if (p.about && p.aboutFile) problems.push(`${tag}: use either about or aboutFile, not both`);
  if (p.stack != null && !isStringArray(p.stack)) problems.push(`${tag}: stack must be an array of strings`);
  checkLinks(tag, p.links);

  const iids = new Set();
  for (const it of p.improvements ?? []) {
    improvements++;
    if (!it.id) problems.push(`${tag}: improvement "${it.title ?? ''}" has no id`);
    else if (iids.has(it.id)) problems.push(`${tag}: duplicate improvement id ${it.id}`);
    iids.add(it.id);
    const itag = `${tag}/${it.id}`;
    if (!it.title) problems.push(`${itag}: title is missing`);
    await checkFile(itag, 'file', it.file);
    if (!it.file && !it.body) problems.push(`${itag}: needs either file or body`);
    if (it.file && it.body) problems.push(`${itag}: use either file or body, not both`);
    if (it.tags != null && !isStringArray(it.tags)) problems.push(`${itag}: tags must be an array of strings`);
    if (it.metrics != null) {
      if (!Array.isArray(it.metrics)) problems.push(`${itag}: metrics must be an array`);
      else it.metrics.forEach((m, i) => { if (!m?.label || m?.after == null) problems.push(`${itag}: metrics[${i}] needs label and after`); });
    }
  }

  const lids = new Set();
  for (const l of p.logs ?? []) {
    logs++;
    const id = l.id ?? l.date;
    const ltag = `${tag}/${id}`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(l.date ?? '')) problems.push(`${tag}: log date must be YYYY-MM-DD (${l.date})`);
    else if (Number.isNaN(Date.parse(l.date))) problems.push(`${tag}: log date is not a real date (${l.date})`);
    if (lids.has(id)) problems.push(`${tag}: two logs share the same day; give one an explicit id (${id})`);
    lids.add(id);
    if (!l.title) problems.push(`${ltag}: title is missing`);
    await checkFile(ltag, 'file', l.file);
    if (!l.file && !l.body) problems.push(`${ltag}: needs either file or body`);
    if (l.file && l.body) problems.push(`${ltag}: use either file or body, not both`);
    if (l.tags != null && !isStringArray(l.tags)) problems.push(`${ltag}: tags must be an array of strings`);
  }
}

if (problems.length) {
  console.error(problems.map((p) => ` - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`ok: ${ids.size} projects, ${improvements} improvements, ${logs} logs`);
