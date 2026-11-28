"use client"

import { useEffect, useState } from "react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

/* Hero image carousel — local SVG slides (no network needed) with a
   looping autoplay, dot indicators and hover/focus pause. Uses the shared
   Base UI/embla carousel from the UI kit; slide padding is zeroed so the
   images sit full-bleed inside the rounded frame. */
const SLIDES = [
  {
    src: "/hero/morning.svg",
    alt: "Sunrise over the campus",
    title: "Morning Session",
    subtitle: "English Medium · July to June",
  },
  {
    src: "/hero/afternoon.svg",
    alt: "Warm afternoon sky above the school",
    title: "Afternoon Session",
    subtitle: "English Version · January to December",
  },
  {
    src: "/hero/learning.svg",
    alt: "An open book with sparkles",
    title: "Play Group to KG",
    subtitle: "A curriculum built for little learners",
  },
  {
    src: "/hero/play.svg",
    alt: "Colourful balloons",
    title: "Joyful learning",
    subtitle: "Kindness, curiosity and confidence, every day",
  },
]

const AUTOPLAY_MS = 4500

export function HeroCarousel() {
  const [api, setApi] = useState(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  /* Track the active slide for the dot indicators. */
  useEffect(() => {
    if (!api) return
    const onSelect = () => setIndex(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  /* Looping autoplay — pauses while hovered/focused and is disabled for
     visitors who prefer reduced motion. */
  useEffect(() => {
    if (!api || paused) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => api.scrollNext(), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [api, paused])

  const pause = () => setPaused(true)
  const resume = () => setPaused(false)

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true, align: "start" }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <CarouselContent className="ml-0!">
        {SLIDES.map((slide) => (
          <CarouselItem key={slide.src} className="pl-0!">
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={slide.src}
                alt={slide.alt}
                draggable={false}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-12">
                <p className="font-heading text-base font-extrabold tracking-tight text-white sm:text-lg">
                  {slide.title}
                </p>
                <p className="mt-0.5 text-xs text-white/80 sm:text-sm">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="left-2 border-white/30 bg-black/30 text-white backdrop-blur hover:bg-black/50 hover:text-white" />
      <CarouselNext className="right-2 border-white/30 bg-black/30 text-white backdrop-blur hover:bg-black/50 hover:text-white" />

      {/* dot indicators */}
      <div className="flex items-center justify-center gap-2 border-t border-border bg-card px-4 py-2.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}: ${slide.title}`}
            aria-current={i === index ? "true" : undefined}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === index
                ? "w-6 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60",
            )}
          />
        ))}
      </div>
    </Carousel>
  )
}

export default HeroCarousel
