"use client"

// The shared Switch with a 44px-tall hit area (32×18 drawn, ~56×44 to tap),
// for this page's rows. The shared component's own hit area is 56×34 and is
// left alone, since dense table rows on other pages rely on it.

import * as React from "react"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function HomeSwitch({ className, ...props }: React.ComponentProps<typeof Switch>) {
  return <Switch className={cn("after:-inset-y-[13px]", className)} {...props} />
}
