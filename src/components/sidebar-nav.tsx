"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Database, LayoutDashboard, LogOut, Users } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/context/auth-context"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Account Control", icon: Users },
  { href: "/firestore", label: "Firestore", icon: Database },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const { logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
            </div>
            <span className={cn("text-xl font-semibold", state === "collapsed" && "hidden")}>FirebaseZen</span>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href === "/" && pathname.startsWith("/dashboard"))}
              tooltip={{ children: item.label }}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
         <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip={{ children: "Logout" }}>
                <LogOut />
                <span>Logout</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
