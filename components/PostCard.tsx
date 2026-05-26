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
    <article className="group card-base overflow-hidden">
      <Link href={`/blog/${post.slug}`}>
        <div className="aspect-video bg-barrel-gray-200 overflow-hidden">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              width={640}
              height={360}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-barrel-green/10 to-barrel-beige/20" />
          )}
        </div>
        <div className="p-5">
          {categories.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {categories.map((cat) => (
                <span key={cat.id} className="badge">
                  {cat.name}
                </span>
              ))}
            </div>
          )}
          <h2
            className="font-serif text-base font-bold text-barrel-black line-clamp-2 group-hover:text-barrel-green transition-colors leading-tight"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <p
            className="mt-2 font-sans text-sm text-barrel-gray-600 line-clamp-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          />
          <time className="mt-3 block font-sans text-xs text-barrel-gray-400">
            {formatDate(post.date)}
          </time>
        </div>
      </Link>
    </article>
  );
}
