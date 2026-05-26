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
    <article className="group bg-[#111111] overflow-hidden border border-[#222222] hover:border-[#E8D5B0] transition-colors duration-300">
      <Link href={`/blog/${post.slug}`}>
        <div className="aspect-video bg-[#222222] overflow-hidden">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              width={640}
              height={360}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0D3320] to-[#111111]" />
          )}
        </div>
        <div className="p-5">
          {categories.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="text-xs text-[#E8D5B0] bg-[#0D3320] px-2.5 py-1 font-medium tracking-wide"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
          <h2
            className="font-serif text-base font-bold text-white line-clamp-2 group-hover:text-[#E8D5B0] transition-colors leading-snug"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <time className="mt-3 block text-xs text-[#999999]">{formatDate(post.date)}</time>
        </div>
      </Link>
    </article>
  );
}
