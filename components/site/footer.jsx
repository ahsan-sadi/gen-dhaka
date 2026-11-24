import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

import { Logo } from "@/components/site/logo"
import { NAV_LINKS, SCHOOL_INFO, SESSIONS } from "@/lib/constants"

const portalLinks = [
  { href: "/sign-in", label: "Portal Login" },
  { href: "/dashboard/principal", label: "Principal Dashboard" },
  { href: "/dashboard/admin", label: "Admin Dashboard" },
  { href: "/dashboard/teacher", label: "Teacher Dashboard" },
  { href: "/dashboard/student", label: "Student Dashboard" },
]

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="font-heading text-sm font-semibold tracking-wide text-foreground uppercase">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
        {children}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {SCHOOL_INFO.name} — {SCHOOL_INFO.tagline}. A morning session in
            English Medium (July–June) and an afternoon session in English
            Version (January–December).
          </p>
          <p className="mt-4 text-sm font-medium text-foreground">
            “{SCHOOL_INFO.motto}”
          </p>
        </div>

        <FooterColumn title="Explore">
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn title="Sessions">
          <ul className="space-y-3 text-sm text-muted-foreground">
            {SESSIONS.map((session) => (
              <li key={session.id}>
                <span className="block font-medium text-foreground">
                  {session.name}
                </span>
                <span className="block text-xs">
                  {session.medium} · {session.period}
                </span>
                <span className="block text-xs">
                  {session.classes.join(" · ")}
                </span>
              </li>
            ))}
          </ul>
          <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
            {portalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn title="Contact">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <a
                href={`mailto:${SCHOOL_INFO.email}`}
                className="transition-colors hover:text-primary"
              >
                {SCHOOL_INFO.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <a
                href={`tel:${SCHOOL_INFO.phone.replace(/[^+\d]/g, "")}`}
                className="transition-colors hover:text-primary"
              >
                {SCHOOL_INFO.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{SCHOOL_INFO.address}</span>
            </li>
          </ul>
        </FooterColumn>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SCHOOL_INFO.name}. All rights
            reserved.
          </p>
          <p>{SCHOOL_INFO.motto}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
