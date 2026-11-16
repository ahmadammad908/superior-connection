"use client";

import { useState, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface MediaGalleryProps {
  images?: string[];
  video?: string;
}

export function MediaGallery({ images = [], video }: MediaGalleryProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Touch/swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const hasImages = images && images.length > 0;
  const hasVideo = Boolean(video);
  const isSlider = hasImages && images.length > 1;

  const goNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setSlideIndex((prev) => (prev + 1) % images.length);
    },
    [images.length]
  );

  const goPrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setSlideIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length]
  );

  const goToSlide = useCallback((i: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSlideIndex(i);
  }, []);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Lightbox navigation
  const lightboxNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLightboxIndex((prev) =>
        prev !== null ? (prev + 1) % images.length : 0
      );
    },
    [images.length]
  );

  const lightboxPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLightboxIndex((prev) =>
        prev !== null ? (prev - 1 + images.length) % images.length : 0
      );
    },
    [images.length]
  );

  const openLightbox = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex(index);
  };

  if (!hasImages && !hasVideo) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* ─── Slider (2+ images) ─── */}
      {isSlider && (
        <div
          className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-950 select-none"
          style={{ aspectRatio: "4/3", maxHeight: 480 }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides */}
          <div
            className="flex h-full transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          >
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative shrink-0 w-full h-full cursor-pointer"
                style={{ width: "100%" }}
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={imgUrl}
                  alt={`Image ${idx + 1}`}
                  className="h-full w-full object-contain bg-gray-950"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
                {/* Expand icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-black/10">
                  <Maximize2 className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* ── Counter Badge (Instagram-style top-right) ── */}
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm shadow">
            {slideIndex + 1}
            <span className="opacity-60">/</span>
            {images.length}
          </div>

          {/* ── Prev / Next Arrow Buttons ── */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/75 active:scale-90 shadow"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/75 active:scale-90 shadow"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* ── Dot Indicators ── */}
          <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => goToSlide(idx, e)}
                aria-label={`Go to image ${idx + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  idx === slideIndex
                    ? "h-2 w-5 bg-white shadow"
                    : "h-1.5 w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Single Image ─── */}
      {hasImages && images.length === 1 && (
        <div
          className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={images[0]}
            alt="Post image"
            className="max-h-[500px] w-full object-cover transition duration-200 group-hover:scale-[1.02]"
            loading="eager"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/10">
            <Maximize2 className="h-6 w-6 text-white drop-shadow" />
          </div>
        </div>
      )}

      {/* ─── Video Player ─── */}
      {hasVideo && (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-black">
          <video
            src={video}
            controls
            playsInline
            preload="metadata"
            className="max-h-[480px] w-full object-contain"
          />
        </div>
      )}

      {/* ─── Lightbox Modal ─── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          )}

          {/* Image */}
          <div
            className="relative max-h-[90vh] max-w-4xl w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]}
              alt={`Image ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain rounded-xl"
            />
          </div>

          {/* Lightbox Prev/Next */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={lightboxPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={lightboxNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Lightbox dots */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(idx);
                  }}
                  className={`rounded-full transition-all duration-200 ${
                    idx === lightboxIndex
                      ? "h-2 w-6 bg-white"
                      : "h-2 w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
