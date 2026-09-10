export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const SAFE_URL = /^(https?:\/\/|mailto:|#|\/|\.{1,2}\/|[\w./-]+$)/i;
const safeUrl = (u) => (SAFE_URL.test(u.trim()) ? u.trim() : '#');

function inline(text) {
  const codes = [];
  let out = esc(text)
    .replace(/`([^`\n]+)`/g, (_, c) => `\0${codes.push(`<code>${c}</code>`) - 1}\0`)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${safeUrl(src)}" alt="${alt}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => {
      const u = safeUrl(href);
      const ext = /^https?:\/\//i.test(u) ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${u}"${ext}>${t}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/==(\S(?:.*?\S)?)==/g, '<mark>$1</mark>')   // ==highlight==
    .replace(/(^|[^"'>])(https?:\/\/[^\s<]*[^\s<.,;:!?)])/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  out = out.replace(/\0(\d+)\0/g, (_, i) => codes[i]);
  return out.replace(/ {2,}\n/g, '<br>\n');
}

const RE = {
  fence: /^```(\w*)\s*$/,
  heading: /^(#{1,6})\s+(.+?)\s*#*\s*$/,
  hr: /^\s*([-*_])(\s*\1){2,}\s*$/,
  quote: /^>\s?/,
  ul: /^\s*[-*+]\s+/,
  ol: /^\s*\d+[.)]\s+/,
  tableSep: /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/,
  cont: /^\s{2,}\S/,
};

const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

function table(lines, i) {
  const head = cells(lines[i]);
  const align = cells(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /-+:$/.test(c) ? 'right' : ''));
  const rows = [];
  let j = i + 2;
  while (j < lines.length && lines[j].includes('|') && lines[j].trim()) rows.push(cells(lines[j++]));
  const td = (tag, row) => row.map((c, k) => `<${tag}${align[k] ? ` style="text-align:${align[k]}"` : ''}>${inline(c)}</${tag}>`).join('');
  const body = rows.length ? `<tbody>${rows.map((r) => `<tr>${td('td', r)}</tr>`).join('')}</tbody>` : '';
  return [`<table><thead><tr>${td('th', head)}</tr></thead>${body}</table>`, j];
}

export function renderMarkdown(src) {
  const lines = String(src ?? '').replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join('\n'))}</p>`);
    para = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    let m;

    if ((m = RE.fence.exec(line))) {
      flush();
      const buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code${m[1] ? ` class="language-${m[1]}"` : ''}>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }
    if ((m = RE.heading.exec(line))) {
      flush();
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
      i++;
      continue;
    }
    if (RE.hr.test(line)) {
      flush();
      out.push('<hr>');
      i++;
      continue;
    }
    if (RE.quote.test(line)) {
      flush();
      const buf = [];
      while (i < lines.length && RE.quote.test(lines[i])) buf.push(lines[i++].replace(RE.quote, ''));
      out.push(`<blockquote>${renderMarkdown(buf.join('\n'))}</blockquote>`);
      continue;
    }
    if (RE.ul.test(line) || RE.ol.test(line)) {
      flush();
      const ordered = RE.ol.test(line);
      const re = ordered ? RE.ol : RE.ul;
      const items = [];
      while (i < lines.length && re.test(lines[i])) {
        items.push(lines[i++].replace(re, ''));
        while (i < lines.length && RE.cont.test(lines[i]) && !re.test(lines[i])) items[items.length - 1] += `\n${lines[i++].trim()}`;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && RE.tableSep.test(lines[i + 1])) {
      flush();
      const [html, next] = table(lines, i);
      out.push(html);
      i = next;
      continue;
    }
    if (!line.trim()) {
      flush();
      i++;
      continue;
    }
    para.push(line.trim());
    i++;
  }
  flush();
  return out.join('\n');
}
