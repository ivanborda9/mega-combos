"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Banner = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
};

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const count = banners.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [count, index]);

  if (count === 0) return null;

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-blush-100">
      {banners.map((banner, i) => {
        const content = (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.imageUrl} alt={banner.title ?? ""} className="h-full w-full object-cover" />
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-6 text-white sm:p-10">
                {banner.title && <h2 className="max-w-2xl text-3xl font-extrabold sm:text-5xl">{banner.title}</h2>}
                {banner.subtitle && <p className="mt-2 max-w-xl text-white/90 sm:text-lg">{banner.subtitle}</p>}
              </div>
            )}
          </>
        );
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={i !== index}
          >
            {banner.linkUrl ? (
              <Link href={banner.linkUrl} className="block h-full w-full">
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-xl font-bold text-gray-900 hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-xl font-bold text-gray-900 hover:bg-white"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/60"}`}
                aria-label={`Imagen ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
