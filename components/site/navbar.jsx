"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Logo } from "@/components/site/logo"
import { RoleBadge } from "@/components/shared/role-badge"
import { useAuth, dashboardHome } from "@/lib/auth-context"
import { NAV_LINKS, ROLE_LABELS } from "@/lib/constants"
import { avatarUrl, cn } from "@/lib/utils"

function NavLink({ href, label, pathname, onClick, className }) {
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, signOut } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  /* Server HTML always renders the moon; the real theme only resolves
     after mount, so gate the icon to avoid a hydration mismatch. */
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"

  const currentUser = user

  const toggleTheme = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark")

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out successfully")
    router.push("/sign-in") // redirect to login page
    router.refresh()
  }

  const go = (href) => {
    setOpen(false)
    router.push(href)
  }

  const actions = currentUser ? (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:inline-flex"
        render={<Link href={dashboardHome(currentUser.role)} />}
      >
        <LayoutDashboard className="size-4" />
        Dashboard
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Account menu"
        >
          <img
            src={avatarUrl(currentUser)}
            alt={currentUser.name}
            className="size-8 rounded-full border border-border bg-muted object-cover"
          />
          <span className="hidden text-left md:block">
            <span className="block max-w-32 truncate text-sm leading-tight font-semibold">
              {currentUser.name}
            </span>
            <span className="block max-w-32 truncate text-[11px] leading-tight text-muted-foreground">
              {ROLE_LABELS[currentUser.role] || currentUser.role}
            </span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col gap-2">
              <span className="flex items-center gap-2">
                <img
                  src={avatarUrl(currentUser)}
                  alt=""
                  className="size-9 rounded-full border border-border bg-muted"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {currentUser.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {currentUser.email}
                  </span>
                </span>
              </span>
              <RoleBadge role={currentUser.role} />
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(dashboardHome(currentUser.role))}
          >
            <LayoutDashboard /> Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            <UserRound /> Update Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <LogOut /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" render={<Link href="/sign-in" />}>
        Sign In
      </Button>
      <Button size="sm" render={<Link href="/sign-in" />}>
        Portal Login
      </Button>
    </div>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} pathname={pathname} />
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle theme"
            className="hidden sm:inline-flex"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <div className="hidden sm:block">{actions}</div>

          {/* mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.href}
                    {...link}
                    pathname={pathname}
                    onClick={() => setOpen(false)}
                    className="px-3 py-2.5"
                  />
                ))}
              </nav>
              <div className="mt-2 flex flex-col gap-2 border-t border-border px-4 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={toggleTheme}
                >
                  {isDark ? (
                    <>
                      <Sun className="size-4" /> Light mode
                    </>
                  ) : (
                    <>
                      <Moon className="size-4" /> Dark mode
                    </>
                  )}
                </Button>
                {currentUser ? (
                  <>
                    <div className="flex items-center gap-2 px-1 py-2">
                      <img
                        src={
                          avatarUrl(currentUser)
                        }
                        alt=""
                        className="size-9 rounded-full border border-border"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {currentUser.name}
                        </p>
                        <RoleBadge role={currentUser.role} className="mt-1" />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => go(dashboardHome(currentUser.role))}
                    >
                      <LayoutDashboard className="size-4" /> Dashboard
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => go("/dashboard/profile")}
                    >
                      <UserRound className="size-4" /> Update Profile
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleSignOut}>
                      <LogOut className="size-4" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => go("/sign-in")}
                    >
                      Sign In
                    </Button>
                    <Button size="sm" onClick={() => go("/sign-in")}>
                      Portal Login
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Navbar
