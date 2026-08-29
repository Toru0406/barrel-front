"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export interface HeroSlide {
  slug: string;
  title: string;
  dateLabel: string;
  readingMin: number;
  category: { name: string; href: string } | null;
  image: { src: string; alt: string } | null;
}

const INTERVAL = 5000; // 5秒で次の記事へ自動遷移

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  useEffect(() => {
    if (n <= 1 || paused) return;
    const timer = setInterval(() => setCurrent((p) => (p + 1) % n), INTERVAL);
    return () => clearInterval(timer);
  }, [n, paused]);

  if (n === 0) return null;

  return (
    <section
      className="hero"
      aria-roledescription="カルーセル"
      aria-label="注目記事"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={s.slug}
          className="hero__slide"
          style={{
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? "auto" : "none",
          }}
          aria-hidden={i !== current}
        >
          {s.image ? (
            <Image
              src={s.image.src}
              alt={s.image.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="hero__image"
            />
          ) : (
            <span className="hero__image" aria-hidden="true" />
          )}
          <div className="hero__overlay" />
          <div className="hero__content">
            <div className="container">
              {s.category && (
                <Link href={s.category.href} className="hero__category">
                  {s.category.name}
                </Link>
              )}
              <h2 className="hero__title">
                <Link
                  href={`/articles/${s.slug}`}
                  dangerouslySetInnerHTML={{ __html: s.title }}
                />
              </h2>
              <div className="hero__meta">
                <time>{s.dateLabel}</time>
                <span className="hero__meta-separator">—</span>
                <span>{s.readingMin}分で読める</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {n > 1 && (
        <div className="hero__dots" role="tablist" aria-label="スライド切り替え">
          {slides.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              className={`hero__dot${i === current ? " is-active" : ""}`}
              aria-label={`${i + 1}件目の記事を表示`}
              aria-selected={i === current}
              role="tab"
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
