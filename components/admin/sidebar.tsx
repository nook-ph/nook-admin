"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SquaresFourIcon,
  PencilSimpleIcon,
  ImagesIcon,
  TagIcon,
  ForkKnifeIcon,
  StarIcon,
  StorefrontIcon,
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
      { title: "Dashboard", url: "/admin/dashboard", icon: SquaresFourIcon },
    ],
  },
  {
    label: "My Cafe",
    items: [
      { title: "Profile Editor", url: "/admin/profile", icon: PencilSimpleIcon },
      { title: "Photo Manager", url: "/admin/photos", icon: ImagesIcon },
      { title: "Tag Manager", url: "/admin/tags", icon: TagIcon },
      { title: "Menu Highlights", url: "/admin/menu", icon: ForkKnifeIcon },
    ],
  },
  {
    label: "Reviews",
    items: [
      { title: "My Reviews", url: "/admin/reviews", icon: StarIcon },
    ],
  },
]

const user = {
  name: "Cafe Owner",
  email: "owner@nook.app",
  avatar: "",
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <StorefrontIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Nook</span>
                  <span className="truncate text-xs text-muted-foreground">Cafe Portal</span>
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
