import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { processContent } from "@/lib/article";

// 下書きの確認画面（旧 wp-admin の代わり）。エンジンが Slack に出すリンクの先。
// 下書きは RLS で anon から見えないので service_role で読み、PREVIEW_KEY を知っている人だけに見せる
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Props {
  params: { id: string };
  searchParams: { key?: string };
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const expected = process.env.PREVIEW_KEY;
  if (!expected || searchParams.key !== expected) notFound();
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const { data: post } = await createServiceClient()
    .from("posts")
    .select("id,status,title,excerpt,content,featured_image_url,date,modified")
    .eq("id", id)
    .maybeSingle();
  if (!post) notFound();

  const { html } = processContent(post.content as string);
  return (
    <div className="px-s-4 py-s-7">
      <div className="mx-auto max-w-[760px]">
        <p style={{ fontFamily: "var(--f-mono)", fontSize: "var(--t-xs)", color: "var(--c-ink-muted)" }}>
          プレビュー（id {post.id} / {post.status} / 更新 {String(post.modified).slice(0, 16).replace("T", " ")}）
        </p>
        <h1 className="title-hero mt-2 mb-4">{post.title as string}</h1>
        <p className="mb-6" style={{ color: "var(--c-ink-muted)" }}>{post.excerpt as string}</p>
        {post.featured_image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- 確認用。最適化は不要
          <img src={post.featured_image_url as string} alt="" className="mb-8 w-full" />
        )}
        <div className="prose-barrel mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
