export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ProcessedContent {
  html: string;
  headings: Heading[];
}

export interface KeyPointsData {
  lead: string;
  items: string[];      // up to 3 h2 texts
  firstHeadingId: string;
}

/**
 * Converts heading text to a URL-safe id.
 * Keeps ASCII alphanumeric, hyphens, CJK/hiragana/katakana codepoints.
 * No DOM dependency; deterministic string processing only.
 */
function slugify(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      // keep: a-z, 0-9, hyphen, CJK Unified (4E00-9FFF), Hiragana (3040-309F), Katakana (30A0-30FF)
      .replace(/[^a-z0-9一-鿿぀-ゟ゠-ヿ-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "heading"
  );
}

/** Tables with fewer columns fit a phone screen as they are. */
const STACK_MIN_COLUMNS = 3;

function escapeAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Copies each header cell's text onto the body cells of that column as data-label,
 * so CSS can render the table as "label | value" blocks on phones instead of scrolling sideways.
 * Returns null (leave the table as is) when the first row is not all <th>,
 * the table has merged cells, or it has fewer than STACK_MIN_COLUMNS columns.
 */
function labelTableCells(table: string): string | null {
  if (/\s(?:colspan|rowspan)\s*=/i.test(table)) return null;
  const firstRow = table.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
  if (!firstRow) return null;
  const headerCells = Array.from(firstRow[1].matchAll(/<(th|td)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi));
  if (
    headerCells.length < STACK_MIN_COLUMNS ||
    headerCells.some((c) => c[1].toLowerCase() !== "th")
  ) {
    return null;
  }
  const labels = headerCells.map((c) =>
    c[2].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim()
  );

  let rowIndex = 0;
  return table.replace(
    /<tr([^>]*)>([\s\S]*?)<\/tr>/gi,
    (row: string, attrs: string, inner: string): string => {
      if (rowIndex++ === 0) return row;
      let column = 0;
      const labeled = inner.replace(
        /<td(\s[^>]*)?>/gi,
        (_m: string, tdAttrs?: string): string =>
          `<td data-label="${escapeAttr(labels[column++] ?? "")}"${tdAttrs ?? ""}>`
      );
      return `<tr${attrs}>${labeled}</tr>`;
    }
  );
}

/**
 * Processes raw WordPress HTML:
 *  (a) Adds unique ids to h2/h3 elements (slugified from text).
 *  (b) Wraps every <table> in <div class="table-wrap">; tables with a header row
 *      also get data-label on each cell and the table-stack class (see labelTableCells).
 *      Note: nested tables are not supported; WordPress rarely produces them.
 *  (c) Adds rel/target attributes to affiliate and external links.
 *
 * Returns the modified HTML and an ordered list of headings for TOC use.
 */
export function processContent(raw: string): ProcessedContent {
  const headings: Heading[] = [];
  const usedIds = new Set<string>();

  // (a) Add ids to h2 / h3 -----------------------------------------------
  let html = raw.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string, inner: string): string => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const base = slugify(text);
      let id = base;
      let n = 1;
      while (usedIds.has(id)) id = `${base}-${n++}`;
      usedIds.add(id);

      const level: 2 | 3 = tag.toLowerCase() === "h2" ? 2 : 3;
      headings.push({ id, text, level });

      // Remove any existing id attribute then inject the new one
      const cleanAttrs = attrs.replace(/\s+id="[^"]*"/gi, "");
      return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
    }
  );

  // (b) Wrap tables -------------------------------------------------------
  html = html.replace(/<table[\s\S]*?<\/table>/gi, (table: string): string => {
    const labeled = labelTableCells(table);
    return labeled
      ? `<div class="table-wrap table-stack">${labeled}</div>`
      : `<div class="table-wrap">${table}</div>`;
  });

  // (c) Link attributes ---------------------------------------------------
  html = html.replace(/<a([^>]*)>/gi, (_m, attrs: string): string => {
    const hrefMatch = attrs.match(/href="([^"]*)"/i);
    if (!hrefMatch) return `<a${attrs}>`;
    const href = hrefMatch[1];

    const parseRel = (): string[] => {
      const m = attrs.match(/rel="([^"]*)"/i);
      return m ? m[1].split(/\s+/).filter(Boolean) : [];
    };

    const stripAttr = (a: string, name: string): string =>
      a.replace(new RegExp(`\\s+${name}="[^"]*"`, "gi"), "");

    if (href.includes("af.moshimo.com") || /^https:\/\/(www\.)?amazon\.co\.jp\//.test(href)) {
      const parts = new Set([...parseRel(), "nofollow", "sponsored", "noopener"]);
      let clean = stripAttr(attrs, "rel");
      clean = stripAttr(clean, "target");
      return `<a${clean} rel="${Array.from(parts).join(" ")}" target="_blank">`;
    }

    if (/^https?:\/\//.test(href) && !href.includes("getabarrel.com")) {
      const parts = new Set([...parseRel(), "noopener"]);
      let clean = stripAttr(attrs, "rel");
      clean = stripAttr(clean, "target");
      return `<a${clean} rel="${Array.from(parts).join(" ")}" target="_blank">`;
    }

    return `<a${attrs}>`;
  });

  return { html, headings };
}

/**
 * Extracts the KeyPoints summary from the raw HTML and already-processed headings.
 * - Skips a leading <p class="barrel-pr"> if present.
 * - Takes the first remaining <p> text as the opening lead sentence.
 * - Collects up to 3 h2 texts and the id of the first h2.
 *
 * Call after processContent so that heading ids are already determined.
 */
export function extractKeyPoints(raw: string, headings: Heading[]): KeyPointsData {
  let body = raw;

  // Skip leading barrel-pr paragraph
  const prMatch = body.match(
    /^(\s*<p[^>]*class="[^"]*barrel-pr[^"]*"[^>]*>[\s\S]*?<\/p>)/i
  );
  if (prMatch) body = body.slice(prMatch[0].length);

  // First <p> as the opening lead
  const leadMatch = body.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const lead = leadMatch ? leadMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  const h2s = headings.filter((h) => h.level === 2);
  const items = h2s.slice(0, 3).map((h) => h.text);
  const firstHeadingId = h2s[0]?.id ?? "";

  return { lead, items, firstHeadingId };
}

/**
 * 比較記事の価格・レビューの取得日（"YYYY-MM-DD"）。無ければ null。2026-11-11 追加。
 * theme-engine の商品ブロックの注記（p.barrel-aff-note）が data-as-of に持つ。それ以前に作った記事は
 * 注記の文字「価格・レビューは2026年10月21日時点の情報です」から読む（記事の一括書き換えはしない）。
 * 複数あれば最も新しい日にする。
 */
export function dataAsOf(raw: string): string | null {
  // tsconfig の target が古く、matchAll の結果を直接展開できないので Array.from で受ける
  const dates = [
    ...Array.from(raw.matchAll(/data-as-of="(\d{4}-\d{2}-\d{2})"/g), (m) => m[1]!),
    ...Array.from(raw.matchAll(/価格・レビューは(\d{4})年(\d{1,2})月(\d{1,2})日時点/g),
      (m) => `${m[1]}-${m[2]!.padStart(2, "0")}-${m[3]!.padStart(2, "0")}`),
  ].sort();
  return dates.length ? dates[dates.length - 1]! : null;
}

/**
 * 「更新」を表示するか。公開日より1日以上「後」のときだけ出す。2026-11-11 修正。
 * 以前は差の絶対値で判定しており、記事を生成した日（modified）が公開日より前の記事で、
 * 公開日より前の「更新」日が表示されていた（例: 公開 2026.11.07／更新 2026.10.21）。
 */
export function shouldShowModified(date: string, modified: string | null | undefined): boolean {
  return modified != null && new Date(modified).getTime() - new Date(date).getTime() >= 86_400_000;
}

/** 構造化データ・OGP の更新日。公開日より前にはしない */
export function effectiveModified(date: string, modified: string | null | undefined): string {
  return modified && new Date(modified).getTime() > new Date(date).getTime() ? modified : date;
}
