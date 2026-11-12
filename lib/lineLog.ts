import { createServiceClient } from "@/lib/supabase";

/**
 * LINEに届いた相談を Supabase の line_queries に1行記録する（2026-11-11 追加。表の定義は supabase/migrations/003_line_queries.sql）。
 * 何を聞かれ、記事を返せたかを週次で見て、見つからなかった相談を記事テーマの候補にするため。
 *
 * ・LINEのユーザーIDは渡さない・保存しない
 * ・本文はメールアドレスと6桁以上の数字（電話番号・会員番号など）を伏せ字にし、200字で切る
 * ・記録の失敗で返信を止めない（例外は投げず、ログに残すだけ）
 */
export type LineQueryKind = "search" | "hub" | "help" | "smalltalk";

const TEXT_MAX = 200;

/** 個人を特定しうる部分を伏せ字にする（通信しない） */
export function maskText(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "＊メール＊")
    .replace(/[0-9０-９][0-9０-９\-－ ]{4,}[0-9０-９]/g, (m) => (m.replace(/[^0-9０-９]/g, "").length >= 6 ? "＊番号＊" : m))
    .slice(0, TEXT_MAX);
}

export async function recordLineQuery(row: { kind: LineQueryKind; text: string; pain: boolean; slugs: string[] }): Promise<void> {
  try {
    const { error } = await createServiceClient().from("line_queries").insert({
      kind: row.kind,
      text: maskText(row.text),
      pain: row.pain,
      matched: row.slugs.length,
      slugs: row.slugs,
    });
    if (error) console.error(`[lineLog] 記録に失敗: ${error.message}`);
  } catch (e) {
    console.error(`[lineLog] 記録に失敗: ${(e as Error).message}`);
  }
}
