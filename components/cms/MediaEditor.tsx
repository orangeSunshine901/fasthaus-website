"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDown, ArrowUp, Check, ImagePlus, LogOut, Search, Upload, X } from "lucide-react";
import type { Product } from "@/lib/data/products";
import {
  IMAGE_SLOTS,
  MAX_UPLOAD_BYTES,
  resolutionError,
  variantMedia,
  type ImageSlot,
  type MediaRow,
  type VariantMedia,
} from "@/lib/cms/media";

type Draft = { media: VariantMedia; saved: VariantMedia; version: number };
const changed = (draft: Draft) => JSON.stringify(draft.media) !== JSON.stringify(draft.saved);
const button =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40";

function Photo({ src, label }: { src: string; label: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="block h-full w-full cursor-zoom-in"
          aria-label={`Preview ${label}`}
        >
          <img src={src} alt={label} className="h-full w-full object-contain" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80" />
        <Dialog.Content className="cms-studio fixed inset-4 z-[101] flex flex-col rounded-2xl bg-[#f5f3ef] p-4 md:inset-10">
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="font-semibold">{label}</Dialog.Title>
            <Dialog.Close className={button} aria-label="Close preview">
              <X size={18} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-1 text-sm text-neutral-500">
            Inspect sharpness, lighting and composition before publishing.
          </Dialog.Description>
          <img src={src} alt={label} className="mt-4 min-h-0 flex-1 object-contain" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function UploadImage({
  label,
  disabled,
  onUpload,
}: {
  label: string;
  disabled: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <label
      className={`${button} cursor-pointer focus-within:ring-2 focus-within:ring-orange-500 ${disabled ? "pointer-events-none opacity-40" : ""}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled && event.dataTransfer.files[0]) onUpload(event.dataTransfer.files[0]);
      }}
    >
      <Upload size={15} />
      {label}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files?.[0]) onUpload(event.target.files[0]);
          event.target.value = "";
        }}
      />
    </label>
  );
}

export default function MediaEditor({ products, rows }: { products: Product[]; rows: MediaRow[] }) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      products.flatMap((product) =>
        product.variants.map((variant) => {
          const row = rows.find((item) => item.variant_id === variant.id);
          const media = row?.media ?? variantMedia(variant);
          return [variant.id, { media, saved: media, version: row?.version ?? 0 }];
        })
      )
    )
  );
  const [productId, setProductId] = useState(products[0].id);
  const [variantId, setVariantId] = useState(products[0].variants[0].id);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [publishOpen, setPublishOpen] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const router = useRouter();
  const product = products.find((item) => item.id === productId)!;
  const variant = product.variants.find((item) => item.id === variantId)!;
  const draft = drafts[variantId];
  const media = draft.media;
  const dirty = changed(draft);
  const anyDirty = Object.values(drafts).some(changed);

  useEffect(() => {
    if (!anyDirty) return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [anyDirty]);

  function update(next: VariantMedia) {
    setDrafts((current) => ({ ...current, [variantId]: { ...current[variantId], media: next } }));
    setNotice("");
    setError("");
  }
  function move(from: number, to: number) {
    if (busy || to < 0 || to >= media.images.length || from === to) return;
    const images = [...media.images];
    images.splice(to, 0, images.splice(from, 1)[0]);
    update({ ...media, images });
  }
  async function upload(
    file: File,
    target: ImageSlot | "gallery" | { index: number; mobile: boolean }
  ) {
    setError("");
    setNotice("");
    setBusy("Checking and uploading image…");
    try {
      if (!file.size || file.size > MAX_UPLOAD_BYTES)
        throw new Error("Choose an image smaller than 4 MB.");
      if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type))
        throw new Error("Choose a JPEG, PNG, WebP or AVIF image.");
      const bitmap = await createImageBitmap(file);
      const issue = resolutionError(bitmap.width, bitmap.height);
      bitmap.close();
      if (issue) throw new Error(issue);
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/cms/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (target === "gallery")
        update({ ...media, images: [...media.images, { src: result.url, uiTheme: "dark" }] });
      else if (typeof target === "string") update({ ...media, [target]: result.url });
      else
        update({
          ...media,
          images: media.images.map((image, index) =>
            index === target.index
              ? { ...image, [target.mobile ? "mobileSrc" : "src"]: result.url }
              : image
          ),
        });
      setNotice(
        `Checked · ${result.width} × ${result.height}px · ${Math.round(result.bytes / 1024)} KB. ${result.warning ?? "Ready for your visual review."}`
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not upload this image. Try again.");
    } finally {
      setBusy("");
    }
  }
  async function publish() {
    setBusy("Publishing changes…");
    setError("");
    try {
      const response = await fetch("/api/cms/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, version: draft.version, media }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDrafts((current) => ({
        ...current,
        [variantId]: { media, saved: media, version: result.version },
      }));
      setPublishOpen(false);
      setNotice(`${product.name} · ${variant.color} images are published.`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not publish. Try again.");
      setPublishOpen(false);
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="min-h-svh bg-[#f5f3ef] text-[#20251e]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 bg-white px-5 py-5 md:px-8">
        <div>
          <Image
            src="/short-logo.svg"
            alt="Fasthaus"
            width={148}
            height={172}
            className="h-8 w-auto"
          />
          {/* <p className="mt-1 text-xs text-neutral-500">Product media</p> */}
        </div>
        <div className="flex gap-2">
          <a className={button} href="/" target="_blank" rel="noreferrer">
            View website ↗
          </a>
          <button
            disabled={!!busy}
            className={button}
            onClick={async () => {
              if (anyDirty && !window.confirm("Sign out and discard your unpublished changes?"))
                return;
              setBusy("Signing out…");
              try {
                const response = await fetch("/api/cms/session", { method: "DELETE" });
                if (!response.ok) throw new Error("Could not sign out. Try again.");
                router.refresh();
              } catch (error) {
                setError(error instanceof Error ? error.message : "Could not sign out.");
                setBusy("");
              }
            }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1600px] gap-6 p-5 md:grid-cols-[240px_1fr] md:p-8">
        <aside className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Your collection
          </p>
          <label className="relative mt-4 block">
            <Search size={17} className="absolute left-3 top-3.5 text-neutral-400" />
            <span className="sr-only">Search products</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a product…"
              className="w-full rounded-xl border border-neutral-200 bg-white p-3 pl-10 text-sm"
            />
          </label>
          <nav aria-label="Products" className="mt-3 flex gap-2 overflow-x-auto md:flex-col">
            {products
              .filter((item) =>
                `${item.name} ${item.slug}`.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <button
                  key={item.id}
                  disabled={!!busy}
                  aria-pressed={productId === item.id}
                  onClick={() => {
                    setProductId(item.id);
                    setVariantId(item.variants[0].id);
                    setError("");
                    setNotice("");
                  }}
                  className={`flex min-w-[170px] items-center gap-3 rounded-xl p-3 text-left transition-colors ${productId === item.id ? "bg-[#20251e] text-white" : "hover:bg-white"}`}
                >
                  <img
                    alt=""
                    src={drafts[item.variants[0].id].media.collection}
                    className="h-12 w-12 rounded-lg bg-white object-contain"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{item.name}</span>
                    <span className="text-xs opacity-60">{item.variants.length} colours</span>
                  </span>
                  {item.variants.some((colour) => changed(drafts[colour.id])) && (
                    <span
                      className="h-2 w-2 rounded-full bg-orange-500"
                      aria-label="Unpublished changes"
                    />
                  )}
                </button>
              ))}
          </nav>
          {!products.some((item) =>
            `${item.name} ${item.slug}`.toLowerCase().includes(search.toLowerCase())
          ) && <p className="mt-4 text-sm text-neutral-500">No matching products.</p>}
          <div className="mt-8 hidden rounded-xl border border-black/5 p-4 text-xs leading-5 text-neutral-500 md:block">
            Select a product, choose a colour, then update its images. Changes go live only when you
            publish.
          </div>
        </aside>
        <div className="min-w-0 pb-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-500">Media workspace</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">{product.name}</h1>
            </div>
            <a
              href={`/product/${product.slug}?variant=${variantId}`}
              target="_blank"
              rel="noreferrer"
              className={button}
            >
              View live product ↗
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Product colours">
            {product.variants.map((colour) => (
              <button
                key={colour.id}
                disabled={!!busy}
                aria-pressed={variantId === colour.id}
                onClick={() => {
                  setVariantId(colour.id);
                  setError("");
                  setNotice("");
                }}
                className={`${button} ${variantId === colour.id ? "!border-[#20251e] ring-1 ring-[#20251e]" : ""}`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-black/10"
                  style={{ backgroundColor: colour.colorHex }}
                />
                {colour.color}
                {changed(drafts[colour.id]) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-[#deded0] bg-[#ebeee5] p-4 text-sm leading-6">
            <strong>Good images, lighter pages.</strong> JPEG, PNG, WebP or AVIF · up to 4 MB · at
            least 1200px on the long side and 800px on the short side. Aim for 1600 × 1200px or
            larger. We check, resize and optimise every upload. Click any photo to inspect it.
          </div>
          <div aria-live="polite" className="mt-4">
            {busy && <p className="text-sm text-neutral-500">{busy}</p>}
            {notice && (
              <p className="flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-800">
                <Check size={18} className="shrink-0" />
                {notice}
              </p>
            )}
          </div>
          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}
          <section className="mt-8">
            <h2 className="text-xl font-bold">Where images appear</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Choose the right image for each placement.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {IMAGE_SLOTS.filter((slot) => slot.key !== "hero" || variant.collectionHeroImage).map(
                (slot) => (
                  <article
                    key={slot.key}
                    className="overflow-hidden rounded-2xl border border-black/5 bg-white"
                  >
                    <div className="h-44 bg-[#f0efec] p-3">
                      {media[slot.key] ? (
                        <Photo src={media[slot.key]} label={slot.label} />
                      ) : (
                        <div className="flex h-full items-center justify-center gap-2 text-sm text-neutral-400">
                          <ImagePlus size={22} />
                          {slot.key === "hero" ? "Original spotlight image" : "Default / not set"}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold">{slot.label}</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <UploadImage
                          label={media[slot.key] ? "Replace" : "Upload"}
                          disabled={!!busy}
                          onUpload={(file) => void upload(file, slot.key)}
                        />
                        {!slot.required && media[slot.key] && (
                          <button
                            className={button}
                            disabled={!!busy}
                            onClick={() => update({ ...media, [slot.key]: "" })}
                          >
                            {slot.key === "hero" ? "Use original" : "Remove"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  Product gallery{" "}
                  <span className="ml-1 text-sm font-normal text-neutral-400">
                    {media.images.length} photos
                  </span>
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Drag to reorder or use the arrows. The first photo opens the gallery.
                </p>
              </div>
              <UploadImage
                label="Add photo"
                disabled={!!busy || media.images.length >= 30}
                onUpload={(file) => void upload(file, "gallery")}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {media.images.map((image, index) => (
                <article
                  key={image.src}
                  draggable={!busy}
                  onDragStart={() => {
                    dragIndex.current = index;
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragEnd={() => {
                    dragIndex.current = null;
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (dragIndex.current !== null) move(dragIndex.current, index);
                    dragIndex.current = null;
                  }}
                  className="overflow-hidden rounded-2xl border border-black/5 bg-white"
                >
                  <div className="relative h-56 bg-[#f0efec] p-3">
                    <Photo
                      src={image.src}
                      label={`${variant.color} · gallery photo ${index + 1}`}
                    />
                    <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold">
                      {index === 0 ? "01 · Opening photo" : String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <UploadImage
                        label="Replace"
                        disabled={!!busy}
                        onUpload={(file) => void upload(file, { index, mobile: false })}
                      />
                      <button
                        className={button}
                        disabled={!!busy || index === 0}
                        aria-label={`Move photo ${index + 1} earlier`}
                        onClick={() => move(index, index - 1)}
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        className={button}
                        disabled={!!busy || index === media.images.length - 1}
                        aria-label={`Move photo ${index + 1} later`}
                        onClick={() => move(index, index + 1)}
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        className={button}
                        disabled={!!busy || media.images.length === 1}
                        onClick={() =>
                          update({
                            ...media,
                            images: media.images.filter((_, item) => index !== item),
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                    <label className="mt-4 flex items-center justify-between gap-3 text-xs text-neutral-500">
                      Overlay text
                      <select
                        disabled={!!busy}
                        value={image.uiTheme}
                        className="rounded-lg border border-neutral-200 p-2 text-[#20251e]"
                        onChange={(event) =>
                          update({
                            ...media,
                            images: media.images.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, uiTheme: event.target.value as "light" | "dark" }
                                : item
                            ),
                          })
                        }
                      >
                        <option value="dark">Dark text</option>
                        <option value="light">Light text</option>
                      </select>
                    </label>
                    <div className="mt-4 border-t border-neutral-100 pt-3">
                      <p className="mb-2 text-xs text-neutral-500">
                        Mobile image{" "}
                        {image.mobileSrc ? "· separate version" : "· uses desktop photo"}
                      </p>
                      {image.mobileSrc && (
                        <div className="mb-2 h-24">
                          <Photo
                            src={image.mobileSrc}
                            label={`Mobile gallery photo ${index + 1}`}
                          />
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <UploadImage
                          label={image.mobileSrc ? "Replace mobile" : "Add mobile"}
                          disabled={!!busy}
                          onUpload={(file) => void upload(file, { index, mobile: true })}
                        />
                        {image.mobileSrc && (
                          <button
                            className={button}
                            disabled={!!busy}
                            onClick={() =>
                              update({
                                ...media,
                                images: media.images.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, mobileSrc: undefined } : item
                                ),
                              })
                            }
                          >
                            Use desktop
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <p className="mt-5 text-xs text-neutral-500">
            Removing a photo removes its placement. Uploaded files stay in storage for recovery.
          </p>
        </div>
      </div>
      <footer className="fixed inset-x-0 bottom-0 z-40 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 bg-white/95 px-5 py-4 backdrop-blur md:px-8">
        <div>
          <p className="text-sm font-semibold">
            {product.name} <span className="font-normal text-neutral-400">/ {variant.color}</span>
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {dirty ? "Unpublished changes" : "All changes published"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={button}
            disabled={!!busy || !dirty}
            onClick={() => {
              if (window.confirm("Discard unpublished changes for this colour?"))
                update(draft.saved);
            }}
          >
            Discard
          </button>
          <Dialog.Root open={publishOpen} onOpenChange={setPublishOpen}>
            <Dialog.Trigger asChild>
              <button
                disabled={!!busy || !dirty}
                className="rounded-lg bg-[#20251e] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Review & publish
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50" />
              <Dialog.Content className="cms-studio fixed left-1/2 top-1/2 z-[101] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6">
                <Dialog.Title className="text-xl font-bold">
                  Publish {product.name} · {variant.color}?
                </Dialog.Title>
                <Dialog.Description className="mt-3 text-sm leading-6 text-neutral-500">
                  These changes will update the website. Check the photos above for sharpness and
                  composition before continuing.
                </Dialog.Description>
                <ul className="mt-4 space-y-2 text-sm">
                  {IMAGE_SLOTS.filter(({ key }) => media[key] !== draft.saved[key]).map(
                    ({ key, label }) => (
                      <li key={key}>
                        {label} · {media[key] ? "updated" : "removed"}
                      </li>
                    )
                  )}
                  {JSON.stringify(media.images) !== JSON.stringify(draft.saved.images) && (
                    <li>Gallery updated · {media.images.length} photos</li>
                  )}
                </ul>
                <div className="mt-6 flex justify-end gap-2">
                  <Dialog.Close disabled={!!busy} className={button}>
                    Keep editing
                  </Dialog.Close>
                  <button
                    disabled={!!busy}
                    onClick={() => void publish()}
                    className="rounded-lg bg-[#20251e] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {busy ? "Publishing…" : "Publish changes"}
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </footer>
    </main>
  );
}
