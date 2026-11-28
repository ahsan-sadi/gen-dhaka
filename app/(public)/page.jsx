import Hero from "@/components/home/hero"
import Principal from "@/components/home/principal"
import Sessions from "@/components/home/sessions"
import Gallery from "@/components/home/gallery"
import Notices from "@/components/home/notices"
import Portal from "@/components/home/portal"

/* Live principal record + notices from the school API — rendered per
   request so the Admin dashboard stays the source of truth (same
   pattern as /staff). */
export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <>
      <Hero />
      <Principal />
      <Sessions />
      <Gallery />
      <Notices />
      <Portal />
    </>
  )
}
