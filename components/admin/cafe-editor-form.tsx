"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Plus,
  X,
  Trash,
  DotsSixVertical,
  InstagramLogo,
  FacebookLogo,
  TiktokLogo,
  Globe,
  Eye,
  PencilSimple,
  ImageSquare,
  Info,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CafeEditorFormProps {
  mode: "new" | "edit"
  id?: string
  disabled?: boolean
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

const TAG_GROUPS = [
  {
    label: "Best For",
    tags: [
      "Date Spot",
      "Solo Work",
      "Group Hangout",
      "Book Cafe",
      "Co-working Space",
      "Late Night",
      "Quick Coffee",
      "Family Friendly",
      "Nature Cafe",
      "Special Occasion",
    ],
    vibe: false,
  },
  {
    label: "Amenities",
    tags: [
      "Free WiFi",
      "High-Speed WiFi",
      "Power Outlets",
      "Air Conditioned",
      "Outdoor Seating",
      "Pet Friendly",
      "Parking Available",
      "Wheelchair Accessible",
    ],
    vibe: false,
  },
  {
    label: "Payment",
    tags: ["Cash", "GCash", "Maya", "Credit & Debit Card"],
    vibe: false,
  },
  {
    label: "Vibe",
    tags: [
      "Aesthetic",
      "Cozy & Warm",
      "Minimalist",
      "Industrial",
      "Garden",
      "Dark Academia",
    ],
    vibe: true,
  },
] as const

const ALL_TAGS = TAG_GROUPS.flatMap((g) => g.tags)

// ---------------------------------------------------------------------------
// Menu types & seed data
// ---------------------------------------------------------------------------

interface MenuCategory {
  id: number
  name: string
  isGlobal: boolean
}

interface FullMenuItem {
  id: number
  name: string
  category: string
  price: number
  isHighlight: boolean
  hasImage: boolean
}

const SEED_CATEGORIES: MenuCategory[] = [
  { id: 1, name: "Coffee", isGlobal: true },
  { id: 2, name: "Non-Coffee", isGlobal: true },
  { id: 3, name: "Food", isGlobal: true },
  { id: 4, name: "Pastries", isGlobal: true },
  { id: 5, name: "Seasonal", isGlobal: false },
]

const SEED_ITEMS: FullMenuItem[] = [
  { id: 1, name: "Iced Oat Latte", category: "Coffee", price: 180, isHighlight: true, hasImage: true },
  { id: 2, name: "Pour Over Ethiopia", category: "Coffee", price: 220, isHighlight: true, hasImage: true },
  { id: 3, name: "Americano", category: "Coffee", price: 130, isHighlight: false, hasImage: false },
  { id: 4, name: "Matcha Latte", category: "Non-Coffee", price: 160, isHighlight: true, hasImage: false },
  { id: 5, name: "Croissant", category: "Pastries", price: 95, isHighlight: false, hasImage: false },
  { id: 6, name: "Club Sandwich", category: "Food", price: 250, isHighlight: false, hasImage: false },
]

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function formatPrice(price: number) {
  return `₱${price.toFixed(2)}`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium leading-none">{children}</label>
  )
}

function FieldGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Menu sub-components
// ---------------------------------------------------------------------------

function ImageUploadCell({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <div
      className={`size-10 rounded-md border-2 border-dashed border-border flex items-center justify-center shrink-0 ${
        disabled
          ? "pointer-events-none opacity-60"
          : "cursor-pointer hover:bg-muted"
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <ImageSquare className="size-4 text-muted-foreground" />
    </div>
  )
}

interface MenuItemRowProps {
  item: FullMenuItem
  showCategory?: boolean
  highlightCount: number
  onToggleHighlight: (id: number, val: boolean) => void
  onDelete: (id: number) => void
  disabled?: boolean
}

function MenuItemRow({
  item,
  showCategory = true,
  highlightCount,
  onToggleHighlight,
  onDelete,
  disabled = false,
}: MenuItemRowProps) {
  const atHighlightCap = highlightCount >= 5 && !item.isHighlight

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      {/* Col 1 — drag handle */}
      <DotsSixVertical
        className={`text-muted-foreground size-4 shrink-0 ${
          disabled ? "pointer-events-none opacity-60" : "cursor-grab"
        }`}
      />

      {/* Col 2 — image cell */}
      {item.isHighlight ? (
        item.hasImage ? (
          <div className="size-10 rounded-md bg-muted shrink-0" />
        ) : (
          <ImageUploadCell disabled={disabled} />
        )
      ) : (
        <div className="size-10 shrink-0" />
      )}

      {/* Col 3 — info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{item.name}</span>
          {item.isHighlight && (
            <Badge
              variant="outline"
              className="text-xs text-green-700 border-green-300 bg-green-50 dark:bg-green-950 dark:text-green-400 dark:border-green-800 shrink-0"
            >
              Highlight
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {showCategory && (
            <span className="text-xs text-muted-foreground">{item.category}</span>
          )}
          {showCategory && (
            <span className="text-xs text-muted-foreground">·</span>
          )}
          <span className="text-xs text-muted-foreground">{formatPrice(item.price)}</span>
        </div>
      </div>

      {/* Col 4 — highlight toggle */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        {atHighlightCap ? (
          <>
            <Switch checked={false} disabled />
            <span className="text-xs text-destructive whitespace-nowrap">Max reached</span>
          </>
        ) : (
          <>
            <Switch
              checked={item.isHighlight}
              onCheckedChange={(val) => onToggleHighlight(item.id, val)}
              disabled={disabled}
            />
            <span className="text-xs text-muted-foreground">Highlight</span>
          </>
        )}
      </div>

      {/* Col 5 — actions */}
      <div className="flex shrink-0">
        <Button variant="ghost" size="icon" disabled={disabled}>
          <PencilSimple />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(item.id)}
          disabled={disabled}
        >
          <Trash />
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add Category Dialog
// ---------------------------------------------------------------------------

function AddCategoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [name, setName] = React.useState("")
  const [isGlobal, setIsGlobal] = React.useState(false)

  function handleAdd() {
    console.log("Category added")
    setName("")
    setIsGlobal(false)
    onOpenChange(false)
  }

  function handleCancel() {
    setName("")
    setIsGlobal(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <FieldGroup label="Category name">
            <Input
              placeholder="e.g. Specialty Drinks"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FieldGroup>
          <div className="flex items-center gap-2">
            <Checkbox
              id="global-category"
              checked={isGlobal}
              onCheckedChange={(v) => setIsGlobal(v === true)}
            />
            <label
              htmlFor="global-category"
              className="text-xs cursor-pointer select-none"
            >
              Make this global (available to all cafes)
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Category</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Add Item Dialog
// ---------------------------------------------------------------------------

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  highlightCount: number
  categories: MenuCategory[]
}

function AddItemDialog({
  open,
  onOpenChange,
  highlightCount,
  categories,
}: AddItemDialogProps) {
  const [itemName, setItemName] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [isHighlight, setIsHighlight] = React.useState(false)
  const atCap = highlightCount >= 5

  function handleAdd() {
    console.log("Item added")
    setItemName("")
    setCategory("")
    setPrice("")
    setIsHighlight(false)
    onOpenChange(false)
  }

  function handleCancel() {
    setItemName("")
    setCategory("")
    setPrice("")
    setIsHighlight(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FieldGroup label="Item name">
            <Input
              placeholder="e.g. Iced Oat Latte"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </FieldGroup>
          <FieldGroup label="Category">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Price (₱)">
            <Input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </FieldGroup>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Feature as highlight</span>
              <span className="text-xs text-muted-foreground">
                Shows on the cafe detail page with a photo
              </span>
            </div>
            {atCap ? (
              <div className="flex flex-col items-end gap-1">
                <Switch checked={false} disabled />
                <span className="text-xs text-destructive">
                  Maximum 5 highlights reached
                </span>
              </div>
            ) : (
              <Switch
                checked={isHighlight}
                onCheckedChange={setIsHighlight}
              />
            )}
          </div>
          {isHighlight && !atCap && (
            <div className="mt-1 h-32 w-full rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted text-muted-foreground transition-colors">
              <ImageSquare className="size-6" />
              <span className="text-sm">Click to upload</span>
              <span className="text-xs">JPG, PNG or WEBP · Max 5MB</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Menu Cards
// ---------------------------------------------------------------------------

function MenuCategoriesCard({
  categories,
  onDeleteCategory,
  disabled = false,
}: {
  categories: MenuCategory[]
  onDeleteCategory: (id: number) => void
  disabled?: boolean
}) {
  const [addCategoryOpen, setAddCategoryOpen] = React.useState(false)
  const [deleteCategoryId, setDeleteCategoryId] = React.useState<number | null>(null)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Menu Categories</CardTitle>
          <CardDescription>
            Organize menu items into categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 py-3 border-b last:border-0"
            >
              <DotsSixVertical
                className={`text-muted-foreground size-4 shrink-0 ${
                  disabled ? "pointer-events-none opacity-60" : "cursor-grab"
                }`}
              />
              <div className="flex-1 flex items-center">
                <span className="text-sm font-medium">{cat.name}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {cat.isGlobal ? "Global" : "Custom"}
                </Badge>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" disabled={disabled}>
                  <PencilSimple />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteCategoryId(cat.id)}
                  disabled={disabled}
                >
                  <Trash />
                </Button>
              </div>
            </div>
          ))}
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddCategoryOpen(true)}
              disabled={disabled}
            >
              <Plus />
              Add Category
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddCategoryDialog
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
      />

      <AlertDialog
        open={deleteCategoryId !== null}
        onOpenChange={(open) => { if (!open) setDeleteCategoryId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the category. Items in this category will become
              uncategorized. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteCategoryId !== null) onDeleteCategory(deleteCategoryId)
                setDeleteCategoryId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function MenuItemsCard({
  items,
  categories,
  onToggleHighlight,
  onDeleteItem,
  disabled = false,
}: {
  items: FullMenuItem[]
  categories: MenuCategory[]
  onToggleHighlight: (id: number, val: boolean) => void
  onDeleteItem: (id: number) => void
  disabled?: boolean
}) {
  const [addItemOpen, setAddItemOpen] = React.useState(false)
  const [deleteItemId, setDeleteItemId] = React.useState<number | null>(null)

  const highlights = items.filter((i) => i.isHighlight)
  const highlightCount = highlights.length
  const allHighlightsHaveNoImage = highlights.length > 0 && highlights.every((i) => !i.hasImage)

  // Group items by category
  const byCategory = categories
    .map((cat) => ({
      category: cat,
      items: items.filter((i) => i.category === cat.name),
    }))
    .filter((g) => g.items.length > 0)

  function handleDelete(id: number) {
    setDeleteItemId(id)
  }

  function confirmDelete() {
    if (deleteItemId !== null) onDeleteItem(deleteItemId)
    setDeleteItemId(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>
            Add all items. Toggle highlights to feature them on the cafe detail
            page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="highlights">Highlights</TabsTrigger>
              <TabsTrigger value="by-category">By Category</TabsTrigger>
            </TabsList>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {items.length} items · {highlightCount} highlights
              </p>
              <Button
                size="sm"
                onClick={() => setAddItemOpen(true)}
                disabled={disabled}
              >
                <Plus />
                Add Item
              </Button>
            </div>

            {/* All Items */}
            <TabsContent value="all">
              {items.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  showCategory
                  highlightCount={highlightCount}
                  onToggleHighlight={onToggleHighlight}
                  onDelete={handleDelete}
                  disabled={disabled}
                />
              ))}
            </TabsContent>

            {/* Highlights */}
            <TabsContent value="highlights">
              {allHighlightsHaveNoImage ? (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-muted-foreground mb-3 dark:border-amber-800 dark:bg-amber-950">
                  <Info className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-amber-700 dark:text-amber-300">
                    Highlights without photos won&apos;t show an image on the cafe
                    detail page.
                  </span>
                </div>
              ) : highlightCount < 5 ? (
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground mb-3">
                  <Info className="size-3.5 shrink-0" />
                  {highlightCount} of 5 highlight slots used. Highlights appear
                  on the cafe detail page with photos.
                </div>
              ) : null}
              {highlights.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  showCategory
                  highlightCount={highlightCount}
                  onToggleHighlight={onToggleHighlight}
                  onDelete={handleDelete}
                  disabled={disabled}
                />
              ))}
            </TabsContent>

            {/* By Category */}
            <TabsContent value="by-category">
              {byCategory.map(({ category, items: catItems }) => (
                <div key={category.id}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide py-2 border-b">
                    {category.name}
                  </p>
                  {catItems.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      showCategory={false}
                      highlightCount={highlightCount}
                      onToggleHighlight={onToggleHighlight}
                      onDelete={handleDelete}
                      disabled={disabled}
                    />
                  ))}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddItemDialog
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        highlightCount={highlightCount}
        categories={categories}
      />

      <AlertDialog
        open={deleteItemId !== null}
        onOpenChange={(open) => { if (!open) setDeleteItemId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the item. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CafeEditorForm({ mode, id, disabled = false }: CafeEditorFormProps) {
  // --- Basic Info ---
  const [description, setDescription] = React.useState("")

  // --- Operating Hours ---
  const [closedDays, setClosedDays] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(DAYS.map((d) => [d, false]))
  )

  // --- Tags ---
  const [selectedTags, setSelectedTags] = React.useState<Set<string>>(
    new Set()
  )
  const [featuredTag, setFeaturedTag] = React.useState("")

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  // --- Menu ---
  const [menuCategories, setMenuCategories] = React.useState<MenuCategory[]>(SEED_CATEGORIES)
  const [menuItems, setMenuItems] = React.useState<FullMenuItem[]>(SEED_ITEMS)

  function handleToggleHighlight(itemId: number, val: boolean) {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isHighlight: val } : item
      )
    )
  }

  function handleDeleteItem(itemId: number) {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  function handleDeleteCategory(catId: number) {
    setMenuCategories((prev) => prev.filter((cat) => cat.id !== catId))
  }

  // --- Sidebar ---
  const [listingStatus, setListingStatus] = React.useState(
    mode === "new" ? "draft" : "active"
  )
  const [flagNew, setFlagNew] = React.useState(false)
  const [flagFeatured, setFlagFeatured] = React.useState(false)
  const [flagActive, setFlagActive] = React.useState(true)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Page header — hidden in disabled/view mode (the page provides its own) */}
        {!disabled && (
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/cafes">
                <ArrowLeft />
              </Link>
            </Button>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold">
                {mode === "new" ? "Add Cafe" : "Edit Cafe"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {mode === "new"
                  ? "Fill in the details below"
                  : "Update the cafe details"}
              </p>
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ----------------------------------------------------------------
              Left column — form
          ---------------------------------------------------------------- */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* CARD 1 — Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FieldGroup label="Cafe name">
                  <Input placeholder="e.g. Slowpoke Coffee" disabled={disabled} />
                </FieldGroup>
                <FieldGroup label="Neighborhood">
                  <Input placeholder="e.g. IT Park" disabled={disabled} />
                </FieldGroup>
                <FieldGroup label="City">
                  <Input defaultValue="Cebu City" disabled={disabled} />
                </FieldGroup>
                <FieldGroup label="Description">
                  <Textarea
                    placeholder="A short description of the cafe..."
                    maxLength={300}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none"
                    rows={4}
                    disabled={disabled}
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {description.length} / 300
                    </span>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* CARD 2 — Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Drop a pin to set the exact location
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FieldGroup label="Address">
                  <Input placeholder="e.g. Ground Floor, IT Park" disabled={disabled} />
                </FieldGroup>

                <div className="mt-3 h-64 w-full rounded-lg border border-dashed border-border bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="size-8" />
                  <p className="text-sm">Map picker</p>
                  <p className="text-xs">Mapbox GL JS loads here</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-2 gap-3">
                    <FieldGroup label="Latitude">
                      <Input value="10.3157" disabled />
                    </FieldGroup>
                    <FieldGroup label="Longitude">
                      <Input value="123.8854" disabled />
                    </FieldGroup>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Coordinates update automatically when you move the pin
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CARD 3 — Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
              </CardHeader>
              <CardContent>
                {DAYS.map((day) => {
                  const isClosed = closedDays[day]
                  return (
                    <div
                      key={day}
                      className="flex items-center gap-4 py-2 border-b last:border-0"
                    >
                      <span className="w-24 text-sm font-medium shrink-0">
                        {day}
                      </span>
                      <Input
                        className="w-32"
                        placeholder="08:00"
                        disabled={isClosed || disabled}
                      />
                      <Input
                        className="w-32"
                        placeholder="22:00"
                        disabled={isClosed || disabled}
                      />
                      <div className="flex items-center gap-2 ml-auto">
                        <label
                          htmlFor={`closed-${day}`}
                          className="text-xs text-muted-foreground cursor-pointer select-none"
                        >
                          Closed
                        </label>
                        <Switch
                          id={`closed-${day}`}
                          checked={isClosed}
                          onCheckedChange={(val) =>
                            setClosedDays((prev) => ({
                              ...prev,
                              [day]: val,
                            }))
                          }
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* CARD 4 — Photos */}
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>
                  Upload up to 10 photos. First photo is the hero.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {/* Upload button */}
                  <div
                    className={`aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 transition-colors text-muted-foreground ${
                      disabled
                        ? "pointer-events-none opacity-60"
                        : "cursor-pointer hover:bg-muted"
                    }`}
                  >
                    <Plus className="size-6" />
                    <span className="text-xs">Add photo</span>
                  </div>

                  {/* Placeholder 1 — Hero */}
                  <div className="relative aspect-square rounded-lg bg-muted overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 size-6 bg-background/80 hover:bg-background"
                      disabled={disabled}
                    >
                      <X className="size-3" />
                    </Button>
                    <Badge className="absolute bottom-1 left-1 text-xs">
                      Hero
                    </Badge>
                  </div>

                  {/* Placeholder 2 */}
                  <div className="relative aspect-square rounded-lg bg-muted overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 size-6 bg-background/80 hover:bg-background"
                      disabled={disabled}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>

                  {/* Placeholder 3 */}
                  <div className="relative aspect-square rounded-lg bg-muted overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 size-6 bg-background/80 hover:bg-background"
                      disabled={disabled}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 5 — Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Select all tags that apply to this cafe
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {TAG_GROUPS.map((group) => (
                  <div key={group.label}>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-4 first:mt-0">
                        {group.label}
                      </p>
                      {group.vibe && (
                        <p className="text-xs text-muted-foreground mb-2 mt-4">
                          (hidden in app)
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map((tag) => {
                        const selected = selectedTags.has(tag)
                        return (
                          <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTag(tag)}
                            disabled={disabled}
                            className={
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : ""
                            }
                          >
                            {tag}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-1.5 mt-6">
                  <FieldLabel>Featured tag (shown on cafe cards)</FieldLabel>
                  <Select value={featuredTag} onValueChange={setFeaturedTag} disabled={disabled}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select one tag..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_TAGS.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* CARDS 6A + 6B — Menu Categories + Menu Items */}
            <MenuCategoriesCard
              categories={menuCategories}
              onDeleteCategory={handleDeleteCategory}
              disabled={disabled}
            />
            <MenuItemsCard
              items={menuItems}
              categories={menuCategories}
              onToggleHighlight={handleToggleHighlight}
              onDeleteItem={handleDeleteItem}
              disabled={disabled}
            />

            {/* CARD 7 — Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FieldGroup label="Instagram">
                  <div className="relative">
                    <InstagramLogo className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      className="pl-8"
                      placeholder="https://instagram.com/..."
                      disabled={disabled}
                    />
                  </div>
                </FieldGroup>
                <FieldGroup label="Facebook">
                  <div className="relative">
                    <FacebookLogo className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      className="pl-8"
                      placeholder="https://facebook.com/..."
                      disabled={disabled}
                    />
                  </div>
                </FieldGroup>
                <FieldGroup label="TikTok">
                  <div className="relative">
                    <TiktokLogo className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      className="pl-8"
                      placeholder="https://tiktok.com/..."
                      disabled={disabled}
                    />
                  </div>
                </FieldGroup>
                <FieldGroup label="Website">
                  <div className="relative">
                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input className="pl-8" placeholder="https://..." disabled={disabled} />
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* CARD 8 — Metadata (edit only) */}
            {mode === "edit" && (
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="flex flex-col gap-3">
                    <div className="flex items-center gap-6">
                      <dt className="text-sm text-muted-foreground w-32 shrink-0">
                        Created
                      </dt>
                      <dd className="text-sm">Jan 12, 2025</dd>
                    </div>
                    <div className="flex items-center gap-6">
                      <dt className="text-sm text-muted-foreground w-32 shrink-0">
                        Last updated
                      </dt>
                      <dd className="text-sm">Mar 14, 2025</dd>
                    </div>
                    <div className="flex items-center gap-6">
                      <dt className="text-sm text-muted-foreground w-32 shrink-0">
                        Owner
                      </dt>
                      <dd className="text-sm">
                        owner@slowpokecoffee.com
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ----------------------------------------------------------------
              Right column — sticky sidebar
          ---------------------------------------------------------------- */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="space-y-4 sticky top-6">

              {/* SIDEBAR CARD 1 — Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={listingStatus}
                    onValueChange={setListingStatus}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* SIDEBAR CARD 2 — Flags */}
              <Card>
                <CardHeader>
                  <CardTitle>Flags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">New listing</span>
                      <span className="text-xs text-muted-foreground">
                        Shows a &apos;New&apos; badge
                      </span>
                    </div>
                    <Switch
                      checked={flagNew}
                      onCheckedChange={setFlagNew}
                      disabled={disabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">Featured</span>
                      <span className="text-xs text-muted-foreground">
                        Shown as home hero card
                      </span>
                    </div>
                    <Switch
                      checked={flagFeatured}
                      onCheckedChange={setFlagFeatured}
                      disabled={disabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">Active</span>
                      <span className="text-xs text-muted-foreground">
                        Visible in the app
                      </span>
                    </div>
                    <Switch
                      checked={flagActive}
                      onCheckedChange={setFlagActive}
                      disabled={disabled}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SIDEBAR CARD 3 — Actions */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  {disabled ? (
                    <Button className="w-full" asChild>
                      <Link href={`/admin/cafes/${id}/edit`}>
                        <PencilSimple />
                        Edit to make changes
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button className="w-full">
                        {mode === "new" ? "Create Listing" : "Save & Publish"}
                      </Button>
                      <Button variant="outline" className="w-full">
                        Save as Draft
                      </Button>
                      <Separator className="my-1" />
                      {mode === "edit" && id ? (
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/admin/cafes/${id}/preview`}>
                            <Eye />
                            Preview Listing
                          </Link>
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block w-full">
                              <Button
                                variant="outline"
                                className="w-full pointer-events-none"
                                disabled
                              >
                                <Eye />
                                Preview Listing
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Save the listing first to preview it
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
