import Link from "next/link";
import Image from "next/image";
import { WPPost, getFeaturedImage, getPostCategories, formatDate } from "@/lib/wordpress";

interface Props {
  post: WPPost;
}

export default function PostCard({ post }: Props) {
  const image = getFeaturedImage(post);
  const categories = getPostCategories(post);

  return (
    <article className="group bg-white rounded-[4px] overflow-hidden border border-[#E5E5E5] hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <Link href={`/blog/${post.slug}`}>
        <div className="aspect-video bg-[#E5E5E5] overflow-hidden">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              width={640}
              height={360}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0D3320]/10 to-[#E8D5B0]/20" />
          )}
        </div>
        <div className="p-5">
          {categories.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="text-xs text-white bg-[#0D3320] px-3 py-1.5 font-medium"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
          <h2
            className="font-serif text-base font-bold text-[#1A1A1A] line-clamp-2 group-hover:text-[#0D3320] transition-colors leading-tight"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <p
            className="mt-2 text-sm text-[#666666] line-clamp-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          />
          <time className="mt-3 block text-xs text-[#999999]">{formatDate(post.date)}</time>
        </div>
      </Link>
    </article>
  );
}
