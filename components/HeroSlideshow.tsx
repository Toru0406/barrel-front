"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const IMAGES = [
  "/images/hero/namito-yokota-DQ9-Vg08kPo-unsplash.jpg",
  "/images/hero/abigail-keenan-8-s5QuUBtyM-unsplash.jpg",
  "/images/hero/adrien-olichon-oyZ7kOTGaOw-unsplash.jpg",
  "/images/hero/juan-pablo-W9peykNqyJo-unsplash.jpg",
];

const INTERVAL = 6000;

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % IMAGES.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Fallback */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-barrel-green via-[#1a4a2e] to-[#0a1f14]" />

      {/* Slideshow: crossfade + Ken Burns */}
      <AnimatePresence>
        <motion.div
          key={current}
          className="absolute inset-0 z-[1]"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.03 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.5, ease: "easeInOut" },
            scale: { duration: 7, ease: "easeOut" },
          }}
        >
          <Image
            src={IMAGES[current]}
            alt=""
            fill
            className="object-cover object-center"
            priority={current === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(13,51,32,0.7) 60%, rgba(13,51,32,0.95) 100%)",
        }}
      />

      {/* Content：左寄せ・下部 */}
      <div className="absolute inset-0 z-[3] flex flex-col items-start justify-end px-6 md:px-12 lg:px-24 pb-16">
        <div className="max-w-2xl">
          <p className="font-display italic text-barrel-beige text-sm tracking-[0.2em] mb-4">
            Sport × Science
          </p>
          <h1 className="font-serif text-hero text-white font-bold mb-6">
            スポーツの『なぜ』を、科学で解く。
          </h1>
          <p className="font-sans text-barrel-gray-400 text-lg mb-8">
            すべての競技者へ。論文が明かす、競技力向上の最前線。
          </p>
          <div className="flex gap-4 flex-wrap mb-10">
            <Link href="/blog" className="btn-primary">
              最新記事を読む
            </Link>
            <Link href="/about" className="btn-outline">
              BARRELとは
            </Link>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center gap-2">
            {IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`スライド ${i + 1}`}
                className={`h-[2px] rounded-full transition-all duration-500 ${
                  i === current
                    ? "w-8 bg-barrel-beige"
                    : "w-4 bg-barrel-beige/40 hover:bg-barrel-beige/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
