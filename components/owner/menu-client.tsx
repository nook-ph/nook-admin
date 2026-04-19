"use client"

import * as React from "react"
import {
  DotsSixVertical,
  ForkKnife,
  ImageSquare,
  PencilSimple,
  Plus,
  Star,
  Trash,
  UploadSimple,
  Warning,
} from "@phosphor-icons/react"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { upsertMenuItemAction, deleteMenuItemAction } from "@/app/owner/actions"
import {
  uploadMenuItemImageAction,
  deleteMenuItemImageAction,
} from "@/app/actions/upload"
import imageCompression from "browser-image-compression"

type Category = {
  id: string
  name: string
  is_global: boolean
  created_by: string | null
}

type MenuItem = {
  id: string
  name: string
  price: number
  is_highlight: boolean
  image_url: string | null
  category_id: string
  menu_categories: { id: string; name: string; is_global: boolean } | null
}

type NewItem = {
  name: string
  price: string
  categoryId: string
  is_highlight: boolean
}

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
  })
}

function ItemRow({
  item,
  highlightCount,
  onToggleHighlight,
  onEdit,
  onDelete,
  onImageUpload,
  onImageDelete,
  isUploadingImage,
  showMissingImageWarning,
}: {
  item: MenuItem
  highlightCount: number
  onToggleHighlight: (id: string, value: boolean) => void
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
  onImageUpload: (id: string, file: File) => void
  onImageDelete: (id: string, imageUrl: string) => void
  isUploadingImage?: boolean
  showMissingImageWarning?: boolean
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const highlightCapReached = !item.is_highlight && highlightCount >= 5
  const categoryName = item.menu_categories?.name ?? "Uncategorized"

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onImageUpload(item.id, file)
    e.target.value = ""
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <DotsSixVertical size={16} className="text-muted-foreground cursor-grab shrink-0" />

      {item.is_highlight ? (
        item.image_url ? (
          <div className="relative size-10 rounded-md bg-muted shrink-0 flex items-center justify-center border overflow-hidden group/img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            <button
              type="button"
              className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
              onClick={() => onImageDelete(item.id, item.image_url!)}
              disabled={isUploadingImage}
              title="Remove image"
            >
              <Trash size={12} className="text-white" />
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="icon"
              className="size-10 shrink-0 border-dashed"
              disabled={isUploadingImage}
              onClick={() => inputRef.current?.click()}
              title="Upload image"
            >
              {isUploadingImage
                ? <ImageSquare size={16} className="text-muted-foreground animate-pulse" />
                : <Plus size={16} className="text-muted-foreground" />
              }
            </Button>
          </>
        )
      ) : (
        <div className="size-10 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex flex-row items-center gap-2">
          <span className="text-sm font-medium truncate">{item.name}</span>
          {item.is_highlight && (
            <Badge
              variant="outline"
              className="text-xs text-green-700 border-green-300 bg-green-50 dark:bg-green-950 shrink-0"
            >
              Highlight
            </Badge>
          )}
        </div>
        <div className="flex flex-row items-center gap-2 mt-0.5">
          <Badge variant="secondary" className="text-xs">{categoryName}</Badge>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            ₱{item.price.toFixed(2)}
          </span>
        </div>
        {showMissingImageWarning && item.is_highlight && !item.image_url && (
          <div className="flex flex-row items-center gap-1 mt-0.5">
            <Warning size={12} className="text-amber-500 shrink-0" />
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Add a photo to show this highlight in the app
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <Switch
          checked={item.is_highlight}
          disabled={highlightCapReached}
          onCheckedChange={(v) => onToggleHighlight(item.id, v)}
          className={highlightCapReached ? "opacity-50" : ""}
        />
        <span className="text-xs text-muted-foreground">Highlight</span>
      </div>

      <div className="flex items-center shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => onEdit(item)}
        >
          <PencilSimple size={14} className="text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash size={14} className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}

export function OwnerMenuClient({
  items: initialItems,
  categories,
  cafeId,
}: {
  items: MenuItem[]
  categories: Category[]
  cafeId: string
}) {
  const [items, setItems] = React.useState<MenuItem[]>(initialItems)
  const [addItemOpen, setAddItemOpen] = React.useState(false)
  const [addCategoryOpen, setAddCategoryOpen] = React.useState(false)
  const [deleteItem, setDeleteItem] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [uploadingItemId, setUploadingItemId] = React.useState<string | null>(null)
  const [uploadError, setUploadError] = React.useState("")
  const [pendingImageFile, setPendingImageFile] = React.useState<File | null>(null)
  const dialogInputRef = React.useRef<HTMLInputElement>(null)
  const [newItem, setNewItem] = React.useState<NewItem>({
    name: "", price: "", categoryId: "", is_highlight: false,
  })

  const globalCategories = categories.filter((c) => c.is_global)
  const customCategories = categories.filter((c) => !c.is_global)

  const highlightCount = items.filter((i) => i.is_highlight).length

  async function toggleHighlight(id: string, value: boolean) {
    if (value && highlightCount >= 5) return
    const item = items.find((i) => i.id === id)
    if (!item) return

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_highlight: value } : i))
    )

    try {
      await upsertMenuItemAction({
        id: item.id,
        name: item.name,
        price: item.price,
        category_id: item.category_id,
        is_highlight: value,
        image_url: item.image_url,
      })
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_highlight: !value } : i))
      )
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteItem) return
    const id = deleteItem
    setDeleteItem(null)
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      await deleteMenuItemAction(id)
    } catch {
      // Revert on error — server will revalidate on next load
    }
  }

  async function handleAddItem() {
    if (!newItem.name.trim() || !newItem.categoryId) return
    setIsSaving(true)
    try {
      const isHighlight = newItem.is_highlight && highlightCount < 5
      const { id: newId } = await upsertMenuItemAction({
        name: newItem.name,
        price: parseFloat(newItem.price) || 0,
        category_id: newItem.categoryId,
        is_highlight: isHighlight,
        image_url: null,
      })

      let imageUrl: string | null = null
      if (isHighlight && pendingImageFile) {
        try {
          const compressed = await compressImage(pendingImageFile)
          const formData = new FormData()
          formData.append("file", compressed)
          const { url } = await uploadMenuItemImageAction(formData, newId, cafeId)
          imageUrl = url
        } catch {
          // Image upload failure is non-fatal — item is still saved
        }
      }

      const category = categories.find((c) => c.id === newItem.categoryId)
      const newEntry: MenuItem = {
        id: newId,
        name: newItem.name,
        price: parseFloat(newItem.price) || 0,
        is_highlight: isHighlight,
        image_url: imageUrl,
        category_id: newItem.categoryId,
        menu_categories: category
          ? { id: category.id, name: category.name, is_global: category.is_global }
          : null,
      }
      setItems((prev) => [...prev, newEntry])
      setNewItem({ name: "", price: "", categoryId: "", is_highlight: false })
      setPendingImageFile(null)
      setAddItemOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleItemImageUpload(id: string, file: File) {
    const compressed = await compressImage(file)
    const formData = new FormData()
    formData.append("file", compressed)
    setUploadingItemId(id)
    setUploadError("")
    try {
      const { url } = await uploadMenuItemImageAction(formData, id, cafeId)
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, image_url: url } : i))
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed"
      setUploadError(msg)
      setTimeout(() => setUploadError(""), 4000)
    } finally {
      setUploadingItemId(null)
    }
  }

  async function handleItemImageDelete(id: string, imageUrl: string) {
    setUploadingItemId(id)
    try {
      await deleteMenuItemImageAction(id, imageUrl, cafeId)
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, image_url: null } : i))
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed"
      setUploadError(msg)
      setTimeout(() => setUploadError(""), 4000)
    } finally {
      setUploadingItemId(null)
    }
  }

  const highlightItems = items.filter((i) => i.is_highlight)

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold">Menu</h1>
            <p className="text-sm text-muted-foreground">
              Manage your menu items and highlight up to 5 on your cafe detail
              page
            </p>
          </div>
          <Button variant="default" size="sm" className="w-full sm:w-auto" onClick={() => setAddItemOpen(true)}>
            <Plus className="size-4" />
            Add Item
          </Button>
        </div>

        {/* Highlight Summary Card */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">Menu highlights</p>
                <p className="text-xs text-muted-foreground">
                  Highlighted items appear on your cafe detail page with a photo
                </p>
              </div>
              <div className="flex flex-row items-center gap-3">
                <div className="flex flex-row items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) =>
                    i < highlightCount ? (
                      <div key={i} className="size-2 rounded-full bg-primary" />
                    ) : (
                      <div
                        key={i}
                        className="size-2 rounded-full border border-muted-foreground/30"
                      />
                    )
                  )}
                </div>
                <span className="text-sm font-medium">{highlightCount} / 5</span>
                <span className="text-xs text-muted-foreground">highlights</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">
              All Items
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {items.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="highlights">
              Highlights
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {highlightCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* All Items */}
          <TabsContent value="all">
            <Card>
              <CardContent className="pt-2 pb-0">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No menu items yet. Add your first item!
                  </p>
                ) : (
                  items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      highlightCount={highlightCount}
                      onToggleHighlight={toggleHighlight}
                      onEdit={() => {}}
                      onDelete={setDeleteItem}
                      onImageUpload={handleItemImageUpload}
                      onImageDelete={handleItemImageDelete}
                      isUploadingImage={uploadingItemId === item.id}
                    />
                  ))
                )}
                {highlightCount >= 5 && (
                  <p className="text-xs text-destructive py-2">
                    Maximum 5 highlights reached
                  </p>
                )}
                {uploadError && (
                  <p className="text-sm text-destructive py-2">{uploadError}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Highlights */}
          <TabsContent value="highlights">
            <Card>
              <CardContent className="pt-4 pb-0">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground mb-4">
                  <Star size={14} className="text-yellow-500 shrink-0" />
                  {highlightCount} of 5 highlight slots used — highlighted items
                  appear on your cafe detail page with photos
                </div>
                {highlightItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No highlights set yet. Toggle items in All Items.
                  </p>
                ) : (
                  highlightItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      highlightCount={highlightCount}
                      onToggleHighlight={toggleHighlight}
                      onEdit={() => {}}
                      onDelete={setDeleteItem}
                      onImageUpload={handleItemImageUpload}
                      onImageDelete={handleItemImageDelete}
                      isUploadingImage={uploadingItemId === item.id}
                      showMissingImageWarning
                    />
                  ))
                )}
                {highlightCount >= 5 && (
                  <p className="text-xs text-destructive py-2">
                    Maximum 5 highlights reached
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories */}
          <TabsContent value="categories">
            <Card>
              <CardContent className="pt-5 pb-4 space-y-6">

                {/* Global categories */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Global categories
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Shared across all cafes — managed by the Nook team
                  </p>
                  <div>
                    {globalCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-3 py-2.5 border-b last:border-0"
                      >
                        <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <ForkKnife size={14} className="text-muted-foreground" />
                        </div>
                        <span className="text-sm flex-1">{cat.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Global
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom categories */}
                <div>
                  <div className="flex flex-row items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Your categories
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setAddCategoryOpen(true)}
                    >
                      <Plus size={14} />
                      Add Category
                    </Button>
                  </div>

                  {customCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      No custom categories yet.
                    </p>
                  ) : (
                    customCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-3 py-2.5 border-b last:border-0"
                      >
                        <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <ForkKnife size={14} className="text-muted-foreground" />
                        </div>
                        <span className="text-sm flex-1">{cat.name}</span>
                        <Button variant="ghost" size="icon" className="size-8">
                          <PencilSimple size={14} className="text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:text-destructive"
                        >
                          <Trash size={14} className="text-muted-foreground" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Item Dialog */}
      <Dialog
        open={addItemOpen}
        onOpenChange={(open) => {
          setAddItemOpen(open)
          if (!open) {
            setNewItem({ name: "", price: "", categoryId: "", is_highlight: false })
            setPendingImageFile(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add menu item</DialogTitle>
            <DialogDescription>
              menu_items — price stored as numeric
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item name</Label>
              <Input
                id="item-name"
                placeholder="e.g. Iced Oat Latte"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-price">Price (₱)</Label>
                <Input
                  id="item-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Stored as numeric — e.g. 180.00
                </p>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newItem.categoryId}
                  onValueChange={(v) =>
                    setNewItem((prev) => ({ ...prev, categoryId: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Feature as highlight</span>
                <span className="text-xs text-muted-foreground">
                  Shows on your cafe detail page
                </span>
              </div>
              <Switch
                checked={newItem.is_highlight}
                disabled={!newItem.is_highlight && highlightCount >= 5}
                onCheckedChange={(v) =>
                  setNewItem((prev) => ({ ...prev, is_highlight: v }))
                }
              />
            </div>

            {newItem.is_highlight && highlightCount >= 5 && (
              <p className="text-xs text-destructive">
                Maximum 5 highlights reached — toggle off another item first
              </p>
            )}

            {newItem.is_highlight && highlightCount < 5 && (
              <div className="space-y-2">
                <Label>Photo</Label>
                <input
                  ref={dialogInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    setPendingImageFile(e.target.files?.[0] ?? null)
                  }}
                />
                <div
                  className="h-24 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted text-muted-foreground transition-colors"
                  onClick={() => dialogInputRef.current?.click()}
                >
                  {pendingImageFile ? (
                    <>
                      <ImageSquare size={20} className="text-primary" />
                      <span className="text-sm font-medium truncate max-w-[180px]">
                        {pendingImageFile.name}
                      </span>
                      <span className="text-xs">Click to change</span>
                    </>
                  ) : (
                    <>
                      <UploadSimple size={20} />
                      <span className="text-sm">Click to upload</span>
                      <span className="text-xs">JPG, PNG, WEBP · Max 10MB</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleAddItem}
              disabled={isSaving || !newItem.name.trim() || !newItem.categoryId}
            >
              {isSaving ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add custom category</DialogTitle>
            <DialogDescription>
              menu_categories — is_global = false, created_by = your cafe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Seasonal Specials"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setAddCategoryOpen(false)
              }}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Dialog */}
      <AlertDialog
        open={deleteItem !== null}
        onOpenChange={() => setDeleteItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This item will be permanently removed from your menu. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
