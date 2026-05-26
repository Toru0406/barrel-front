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
    <article className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <Link href={`/blog/${post.slug}`}>
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              width={640}
              height={360}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
        </div>
        <div className="p-4">
          {categories.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
          <h2
            className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <p
            className="mt-2 text-sm text-gray-500 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          />
          <time className="mt-3 block text-xs text-gray-400">{formatDate(post.date)}</time>
        </div>
      </Link>
    </article>
  );
}
