"use client"

import * as React from "react"
import {
  Plus,
  PencilSimple,
  EyeSlash,
  DotsSixVertical,
  Info,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  createTagAction,
  toggleTagActiveAction,
} from "@/app/admin/tags/actions"

type AdminTag = {
  id: string
  name: string
  category: string
  sort_order: number
  is_active: boolean
  icon_name?: string | null
  cafe_tags?: { count: number }[]
}

const CATEGORY_LABELS: Record<string, string> = {
  "best-for": "Best For",
  amenities: "Amenities",
  payment: "Payment",
  vibe: "Vibe",
}

const CATEGORY_ORDER = ["best-for", "amenities", "payment", "vibe"]

function TagRow({ tag }: { tag: AdminTag }) {
  const usage = tag.cafe_tags?.[0]?.count ?? 0
  const hidden = !tag.is_active

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <DotsSixVertical className="text-muted-foreground size-4 cursor-grab shrink-0" />
      <div className="flex-1 flex items-center gap-3">
        <span className="text-sm font-medium">{tag.name}</span>
        <Badge variant="secondary">
          {usage} {usage === 1 ? "cafe" : "cafes"}
        </Badge>
        {hidden && (
          <Badge
            variant="outline"
            className="text-amber-700 border-amber-300 text-xs"
          >
            Hidden
          </Badge>
        )}
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => console.log(`Edit ${tag.name}`)}
        >
          <PencilSimple />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleTagActiveAction(tag.id, !tag.is_active)}
        >
          <EyeSlash />
        </Button>
      </div>
    </div>
  )
}

function AddTagDialog() {
  const [open, setOpen] = React.useState(false)
  const [tagName, setTagName] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [iconName, setIconName] = React.useState("")

  async function handleAdd() {
    await createTagAction({
      name: tagName,
      category,
      icon_name: iconName || undefined,
    })
    setTagName("")
    setCategory("")
    setIconName("")
    setOpen(false)
  }

  function handleCancel() {
    setTagName("")
    setCategory("")
    setIconName("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus />
          Add Tag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tag</DialogTitle>
          <DialogDescription>Add a new tag to the master list</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium">Tag name</label>
            <Input
              placeholder="e.g. Dog Friendly"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best-for">Best For</SelectItem>
                <SelectItem value="amenities">Amenities</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="vibe">Vibe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium">Icon name</label>
            <Input
              placeholder="e.g. PawPrint"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use a Phosphor icon name
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Tag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TagsClient({ tags }: { tags: AdminTag[] }) {
  const grouped = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = []
    acc[tag.category].push(tag)
    return acc
  }, {} as Record<string, AdminTag[]>)

  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ]

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Section 1 — Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tags</h1>
          <p className="text-muted-foreground text-sm">
            Master tag list — all tags used across the app
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <AddTagDialog />
        </div>
      </div>

      {/* Section 2 — Tag categories */}
      <div className="flex flex-col gap-4">
        {orderedCategories.map((categoryKey) => {
          const categoryTags = grouped[categoryKey]
          const title = CATEGORY_LABELS[categoryKey] ?? categoryKey
          const isVibe = categoryKey === "vibe"

          return (
            <React.Fragment key={categoryKey}>
              {isVibe && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950">
                  <Info className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-amber-800 dark:text-amber-200">
                    Vibe tags are hidden from the app and owner admin until Phase
                    2. You can tag cafes with these now — they will appear
                    automatically when Phase 2 launches.
                  </span>
                </div>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{categoryTags.length} tags</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryTags.map((tag) => (
                    <TagRow key={tag.id} tag={tag} />
                  ))}
                </CardContent>
              </Card>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
