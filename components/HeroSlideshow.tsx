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
      <div
        className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(135deg, #0D3320 0%, #1a4a2e 50%, #0a1f14 100%)" }}
      />

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

      {/* Content */}
      <div className="absolute inset-0 z-[3] flex flex-col items-center justify-end pb-16 px-6 text-center">
        <p
          className="font-display italic text-[#E8D5B0] mb-4"
          style={{ fontSize: "14px", letterSpacing: "0.2em" }}
        >
          Sport × Science
        </p>
        <h1
          className="font-serif text-white font-bold mb-6"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          スポーツの『なぜ』を、科学で解く。
        </h1>
        <p className="font-sans text-[#CCCCCC] text-lg mb-8">
          すべての競技者へ。<br />
          論文が明かす、競技力向上の最前線。
        </p>
        <div className="flex gap-4 justify-center flex-wrap mb-10">
          <Link
            href="/blog"
            className="bg-[#E8D5B0] text-[#0D3320] font-bold hover:bg-white transition-colors duration-200"
            style={{ padding: "16px 32px" }}
          >
            最新記事を読む
          </Link>
          <Link
            href="/about"
            className="text-white hover:bg-white/10 transition-colors duration-200"
            style={{ padding: "16px 32px", border: "1px solid rgba(255,255,255,0.6)" }}
          >
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
                i === current ? "w-8 bg-white" : "w-4 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
