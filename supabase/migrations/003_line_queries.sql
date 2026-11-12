-- LINE公式アカウントに届いた相談の記録（2026-11-11 追加）。何を聞かれ、記事を返せたかを週次で見て、
-- 見つからなかった相談を記事テーマの候補にする（theme-engine の週次サイト監査が読む）。
--
-- 個人情報の扱い:
--   ・LINEのユーザーIDは保存しない（誰の相談かは追えない）
--   ・本文はメールアドレスと6桁以上の数字（電話番号など）を伏せ字にし、200字で切ってから保存する（barrel-front の lib/lineLog.ts）
--   ・90日を過ぎた行は theme-engine の週次サイト監査が削除する
--   ・RLS を有効にし、ポリシーは作らない。anon キーでは読み書きできず、service_role キーだけが扱える
--
-- 使い方: Supabase の SQL Editor で1回だけ実行する（何度実行しても同じ状態になる）。

create table if not exists public.line_queries (
  id         bigint      generated always as identity primary key,
  created_at timestamptz not null default now(),
  -- search = 相談文で検索 / hub = テーマ名で選択 / help = 使い方 / smalltalk = あいさつ・お礼
  kind       text        not null check (kind in ('search', 'hub', 'help', 'smalltalk')),
  text       text        not null,
  pain       boolean     not null default false,   -- 痛み・ケガの相談として扱ったか
  matched    integer     not null default 0,       -- 返した記事の本数（0 = 見つからなかった）
  slugs      text[]      not null default '{}'     -- 返した記事
);

create index if not exists line_queries_created_at_idx on public.line_queries (created_at desc);

alter table public.line_queries enable row level security;

-- 確認: 0行で返れば成功
-- select * from public.line_queries order by created_at desc limit 5;
