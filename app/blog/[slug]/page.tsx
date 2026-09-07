import { permanentRedirect } from "next/navigation";

// 静的生成すると redirect が meta refresh の 200 ページになるため、動的に 308 を返す
export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

/** 旧URL /blog/[slug] → 正規URL /articles/[slug]（308） */
export default function BlogPostRedirectPage({ params }: Props) {
  permanentRedirect(`/articles/${params.slug}`);
}
