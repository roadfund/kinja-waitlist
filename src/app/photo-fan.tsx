"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent, type ReactElement } from "react";

type Photo = {
  readonly src: string;
  readonly alt: string;
};

const photos = [
  { src: "/pexels-droneafrica-30534343.jpg", alt: "A farmer kneeling in a tea field" },
  { src: "/pexels-achor-david-926249768-34705723.jpg", alt: "A farmer holding peppers beside grazing cattle" },
  { src: "/ali-mkumbwa-XzgW_vYpm8M-unsplash.jpg", alt: "A market stall piled with mangoes and watermelon" },
  { src: "/omotayo-tajudeen-ME416b6sp2I-unsplash.jpg", alt: "A trader standing behind baskets of peppers" },
  { src: "/omotayo-tajudeen-zlZnNIS7eDk-unsplash.jpg", alt: "A trader sorting tomatoes at a stall" },
  { src: "/adhitya-sibikumar-LQAJFndgkdA-unsplash.jpg", alt: "A night fruit stall piled with produce" },
  { src: "/m-c-B-rnR2-vXW4-unsplash.jpg", alt: "A market stall piled with bananas and fruit" },
  { src: "/jacopo-maiarelli--gOUx23DNks-unsplash.jpg", alt: "A stall of fruit and vegetables" },
  { src: "/bernd-dittrich-mqCSTYyI4Zo-unsplash.jpg", alt: "A shopfront stacked with fruit" },
  { src: "/pexels-fatima-yusuf-323522203-30541304.jpg", alt: "A farmer gathering tea leaves into a basket" },
  { src: "/pexels-joseph-k-masonda-2562214-13042951.jpg", alt: "A farmer holding ears of maize" },
  { src: "/pexels-joel-ishimwe-40701021-39079996.jpg", alt: "A farmer holding a bundle of dried beans" },
  { src: "/pexels-achor-david-926249768-34705725.jpg", alt: "Farmers with baskets of tomatoes" },
  { src: "/pexels-achor-david-926249768-34705724.jpg", alt: "A farmer holding tomatoes in a field" },
  { src: "/pexels-stephanie-bujiriri-2160383150-36683210.jpg", alt: "A farmer planting seedlings" },
  { src: "/pexels-alialcantara-11798034.jpg", alt: "A farmer harvesting leafy vegetables" },
  { src: "/pexels-safari-consoler-3290243-11588032.jpg", alt: "A farmer tending rows of leafy crops" },
  { src: "/pexels-selman-urluca-328308611-20371811.jpg", alt: "A farmer with a hoe and a bunch of greens" },
  { src: "/pexels-safari-consoler-3290243-11350431.jpg", alt: "Farmers turning soil with hoes" },
  { src: "/pexels-zeusdcreator-14314173.jpg", alt: "Farmers holding a sheaf of rice" },
] as const satisfies readonly Photo[];

const autoplayMs = 3000;
const resumeAfterMs = 6000;

const fanStride = "[--fan-stride:7.5rem] sm:[--fan-stride:9.5rem]";

function offsetFromCenter(index: number, active: number, count: number): number {
  let diff = index - active;
  diff = ((diff % count) + count) % count;
  if (diff > count / 2) diff -= count;
  return diff;
}

function placement(shown: number): { readonly rotate: number; readonly lift: number; readonly opacity: number } {
  const distance = Math.abs(shown);
  const sign = Math.sign(shown);
  const rotates = [0, 3, 7, 11];
  const lifts = [0, 16, 32, 48];
  return {
    rotate: sign * (rotates[distance] ?? 11),
    lift: lifts[distance] ?? 48,
    opacity: distance <= 2 ? 1 : 0,
  };
}

export function PhotoFan(): ReactElement {
  const [active, setActive] = useState(0);
  // Autoplay pauses while a mouse rests on a photo, while the carousel has keyboard focus,
  // and for a few seconds after someone steps through it themselves.
  const [hovering, setHovering] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [resting, setResting] = useState(false);
  const restTimer = useRef<number | undefined>(undefined);
  const [reduced, setReduced] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (): void => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (hovering || keyboardFocus || resting || reduced) return;
    const id = window.setTimeout(() => {
      setActive((current) => (current + 1) % photos.length);
    }, autoplayMs);
    return () => window.clearTimeout(id);
  }, [hovering, keyboardFocus, resting, reduced, active]);

  useEffect(() => () => window.clearTimeout(restTimer.current), []);

  // Touch screens fire pointer enter on tap but not always leave, so only a real mouse pauses.
  function hover(event: PointerEvent, over: boolean): void {
    if (event.pointerType === "mouse") setHovering(over);
  }

  function step(direction: 1 | -1): void {
    setResting(true);
    window.clearTimeout(restTimer.current);
    restTimer.current = window.setTimeout(() => setResting(false), resumeAfterMs);
    setActive((current) => (current + direction + photos.length) % photos.length);
  }

  return (
    <section
      className="relative mt-16 pb-4"
      aria-roledescription="carousel"
      aria-label="Photos from the field to the market"
      onFocus={(event) => {
        // Only keyboard focus counts; a mouse click on an arrow also focuses it.
        if (event.target.matches(":focus-visible")) setKeyboardFocus(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocus(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          step(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          step(-1);
        }
      }}
    >
      <div
        className={`relative mx-auto h-[18rem] max-w-6xl overflow-hidden sm:h-[22rem] ${fanStride}`}
        onPointerDown={(event) => setDragStart(event.clientX)}
        onPointerUp={(event) => {
          if (dragStart === null) return;
          const delta = event.clientX - dragStart;
          if (delta > 48) step(-1);
          if (delta < -48) step(1);
          setDragStart(null);
        }}
        onPointerCancel={() => setDragStart(null)}
      >
        {photos.map((photo, index) => {
          const raw = offsetFromCenter(index, active, photos.length);
          if (Math.abs(raw) > 3) return null;
          const place = placement(raw);
          return (
            <div
              className="absolute top-4 left-1/2 w-36 -ml-[4.5rem] sm:w-48 sm:-ml-24"
              key={photo.src}
              style={{
                zIndex: 30 + raw,
                opacity: place.opacity,
                transform: `translateX(calc(${raw} * var(--fan-stride))) translateY(${place.lift}px) rotate(${place.rotate}deg)`,
                transition: reduced ? "none" : "transform 600ms ease, opacity 600ms ease",
              }}
              aria-hidden={raw !== 0}
              onPointerEnter={(event) => hover(event, true)}
              onPointerLeave={(event) => hover(event, false)}
            >
              <figure className="overflow-hidden rounded-[1.4rem] border-[5px] border-white bg-white shadow-[0_18px_40px_rgba(23,36,28,0.16)]">
                <div className="relative h-52 sm:h-72">
                  <Image
                    className="object-cover"
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 360px, 540px"
                    quality={90}
                    loading={Math.abs(raw) <= 2 ? "eager" : "lazy"}
                  />
                </div>
              </figure>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-center gap-3">
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-forest shadow-sm hover:bg-cream" type="button" aria-label="Previous photo" onClick={() => step(-1)}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-forest shadow-sm hover:bg-cream" type="button" aria-label="Next photo" onClick={() => step(1)}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </section>
  );
}
