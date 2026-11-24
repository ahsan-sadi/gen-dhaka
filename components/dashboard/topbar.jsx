"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from "lucide-react"
import { useTheme } from "next-themes"

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
import { RoleBadge } from "@/components/shared/role-badge"
import { getNavItems } from "@/components/dashboard/nav-config"
import { dashboardHome, useAuth } from "@/lib/auth-context"

export function Topbar({ user, menu }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  /* Gate the icon on mount so SSR HTML and the first client render match. */
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"

  const items = getNavItems(user.role)
  const current = items.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
  const title = current?.label || "Dashboard"

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out successfully")
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {menu}
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">Dashboard</p>
          <h1 className="truncate font-heading text-base font-bold sm:text-lg">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Profile menu"
          >
            <img
              src={user.image}
              alt={user.name}
              className="size-9 rounded-full border border-border bg-muted object-cover"
            />
            <span className="hidden text-left sm:block">
              <span className="block max-w-40 truncate text-sm leading-tight font-semibold">
                {user.name}
              </span>
              <span className="block text-[11px] leading-tight text-muted-foreground capitalize">
                {user.role}
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-2">
                <span className="flex items-center gap-2">
                  <img
                    src={user.image}
                    alt=""
                    className="size-9 rounded-full border border-border bg-muted"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                </span>
                <RoleBadge role={user.role} />
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(dashboardHome(user.role))}
            >
              <LayoutDashboard /> Overview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <UserRound /> Update Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/")}>
              <ExternalLink /> View site
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Topbar
