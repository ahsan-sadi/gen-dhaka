/* Public landing image gallery — static local SVGs (no network needed).
   Placed between the Sessions and Notices sections to break up the page
   with a look at everyday school life. */
const GALLERY = [
  {
    src: "/gallery/campus.svg",
    alt: "School campus building with flag",
    caption: "Our Campus",
  },
  {
    src: "/gallery/classroom.svg",
    alt: "Classroom with blackboard and desks",
    caption: "Classroom Sessions",
  },
  {
    src: "/gallery/playground.svg",
    alt: "Playground with a slide and ball",
    caption: "Playground Fun",
  },
  {
    src: "/gallery/art.svg",
    alt: "Art palette and paintbrush",
    caption: "Art & Craft",
  },
  {
    src: "/gallery/sports.svg",
    alt: "Football on a running track",
    caption: "Sports Day",
  },
  {
    src: "/gallery/reading.svg",
    alt: "Stack of story books with a star",
    caption: "Reading Corner",
  },
]

export function Gallery() {
  return (
    <section
      id="gallery"
      className="section scroll-mt-20 border-b border-border"
    >
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">School Life</p>
          <h2 className="section-title mt-3">
            Moments from <span className="text-gradient">our campus</span>
          </h2>
          <p className="section-lead mt-4">
            A glimpse of everyday life across both sessions — learning, play
            and everything in between.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((item) => (
            <figure
              key={item.src}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-10 text-sm font-semibold text-white">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Gallery
