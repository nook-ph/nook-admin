"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SquaresFourIcon,
  StorefrontIcon,
  TrayIcon,
  ChatCircleTextIcon,
  UsersIcon,
  IdentificationCardIcon,
  TagIcon,
  CommandIcon,
} from "@phosphor-icons/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"

type NavItem = {
  title: string
  url: string
  icon: React.ElementType
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/superadmin/dashboard", icon: SquaresFourIcon },
    ],
  },
  {
    label: "Cafes",
    items: [
      { title: "Cafe Management", url: "/superadmin/cafes", icon: StorefrontIcon },
    ],
  },
  {
    label: "Queues & Moderation",
    items: [
      { title: "Submission Queue", url: "/superadmin/submissions", icon: TrayIcon },
      { title: "Review Moderation", url: "/superadmin/reviews", icon: ChatCircleTextIcon },
    ],
  },
  {
    label: "Users & Owners",
    items: [
      { title: "User Management", url: "/superadmin/users", icon: UsersIcon },
      { title: "Cafe Owner Management", url: "/superadmin/owners", icon: IdentificationCardIcon },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Tag Manager", url: "/superadmin/tags", icon: TagIcon },
    ],
  },
]

const user = {
  name: "Super Admin",
  email: "admin@nook.app",
  avatar: "",
}

export function SuperadminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/superadmin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <CommandIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Nook</span>
                  <span className="truncate text-xs text-muted-foreground">Superadmin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(item.url + "/")
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
