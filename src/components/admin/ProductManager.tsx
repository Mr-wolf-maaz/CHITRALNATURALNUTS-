"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Check,
  ImagePlus,
  Loader2,
  PackageX,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { CATEGORIES, ProductDTO, cn, formatRs, readApiJson } from "@/lib/utils";
import { AuthError, adminFetch } from "@/lib/admin-client";
import { TableSkeleton } from "./bits";
import { useUi } from "@/store/ui";

const ALL_WEIGHTS = ["250g", "500g", "1kg"];
const field =
  "h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm outline-none transition focus:border-pine-500 focus:bg-white focus:ring-4 focus:ring-pine-500/10";

/* ---------------- Image upload ---------------- */
function ImageUpload({
  value,
  onChange,
  onUnauthorized,
}: {
  value: string;
  onChange: (url: string) => void;
  onUnauthorized: () => void;
}) {
  const toast = useUi((s) => s.toast);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await adminFetch("/api/upload", { method: "POST", body: fd });
      const data = await readApiJson<{ url?: string }>(res);
      if (!data.url) throw new Error("Upload failed.");
      onChange(data.url);
      toast("Image uploaded");
    } catch (e) {
      if (e instanceof AuthError) {
        onUnauthorized();
        return;
      }
      toast(e instanceof Error ? e.message : "Upload failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : busy ? (
          <Loader2 className="h-5 w-5 animate-spin text-pine-500" />
        ) : (
          <ImagePlus className="h-6 w-6 text-stone-300" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-800 px-3 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-pine-700">
          <ImagePlus className="h-4 w-4" />
          {busy ? "Uploading..." : "Upload Photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="...or paste image URL"
          className={cn(field, "h-9 text-xs")}
        />
      </div>
    </div>
  );
}

/* ---------------- Product form modal ---------------- */
type FormState = {
  title: string;
  category: string;
  description: string;
  originalPrice: string;
  salePrice: string;
  stock: string;
  imageUrl: string;
  isFeatured: boolean;
  weightOptions: string[];
};

const emptyForm: FormState = {
  title: "",
  category: CATEGORIES[0].name,
  description: "",
  originalPrice: "",
  salePrice: "",
  stock: "20",
  imageUrl: "",
  isFeatured: false,
  weightOptions: [...ALL_WEIGHTS],
};

function ProductForm({
  initial,
  onClose,
  onSaved,
  onUnauthorized,
}: {
  initial: ProductDTO | null;
  onClose: () => void;
  onSaved: (p: ProductDTO) => void;
  onUnauthorized: () => void;
}) {
  const toast = useUi((s) => s.toast);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          title: initial.title,
          category: initial.category,
          description: initial.description,
          originalPrice: String(initial.originalPrice),
          salePrice: initial.salePrice === null ? "" : String(initial.salePrice),
          stock: String(initial.stock),
          imageUrl: initial.imageUrl,
          isFeatured: initial.isFeatured,
          weightOptions: initial.weightOptions,
        }
      : emptyForm
  );

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const payload = {
        ...form,
        originalPrice: Number(form.originalPrice),
        salePrice: form.salePrice === "" ? null : Number(form.salePrice),
        stock: Number(form.stock),
      };
      const res = await adminFetch(
        initial ? `/api/admin/products/${initial.id}` : "/api/admin/products",
        {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await readApiJson<{ product?: ProductDTO }>(res);
      if (!data.product) throw new Error("Save failed.");
      onSaved(data.product);
      toast(initial ? "Product updated" : "Product added");
      onClose();
    } catch (err) {
      if (err instanceof AuthError) {
        onUnauthorized();
        return;
      }
      toast(err instanceof Error ? err.message : "Save failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="animate-fade-in absolute inset-0 bg-pine-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-modal-in relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white/95 px-6 py-4 backdrop-blur">
          <h3 className="font-display text-lg font-black text-pine-950">
            {initial ? "Edit Product" : "Add New Product"}
          </h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-pine-800">Title *</label>
            <input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Premium Chalghoza (Pine Nuts in Shell)" className={field} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-pine-800">Category *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={field}>
                {[...CATEGORIES.map((c) => c.name), ...(CATEGORIES.some((c) => c.name === form.category) ? [] : [form.category])].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-pine-800">Stock *</label>
              <input required type="number" min={0} value={form.stock} onChange={(e) => set("stock", e.target.value)} className={field} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-pine-800">Price / kg (Rs) *</label>
              <input required type="number" min={1} value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} placeholder="2400" className={field} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-pine-800">Sale Price / kg</label>
              <input type="number" min={1} value={form.salePrice} onChange={(e) => set("salePrice", e.target.value)} placeholder="Optional" className={field} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-pine-800">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Short, appetising description..."
              className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none transition focus:border-pine-500 focus:bg-white focus:ring-4 focus:ring-pine-500/10"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-pine-800">Weight Options</label>
            <div className="flex gap-2">
              {ALL_WEIGHTS.map((w) => {
                const on = form.weightOptions.includes(w);
                return (
                  <button
                    type="button"
                    key={w}
                    onClick={() =>
                      set(
                        "weightOptions",
                        on ? form.weightOptions.filter((x) => x !== w) : [...form.weightOptions, w]
                      )
                    }
                    className={cn(
                      "rounded-xl border-2 px-4 py-2 text-xs font-extrabold transition",
                      on ? "border-pine-600 bg-pine-50 text-pine-800" : "border-stone-200 text-stone-400"
                    )}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-pine-800">Product Photo</label>
            <ImageUpload value={form.imageUrl} onChange={(u) => set("imageUrl", u)} onUnauthorized={onUnauthorized} />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 px-3 py-2.5">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => set("isFeatured", e.target.checked)}
              className="h-4 w-4 accent-pine-700"
            />
            <span className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
              <Sparkles className="h-4 w-4 text-amber-500" /> Mark as Featured product
            </span>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-pine-800 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-pine-700 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {initial ? "Save Changes" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Manager ---------------- */
export default function ProductManager({ onUnauthorized }: { onUnauthorized: () => void }) {
  const toast = useUi((s) => s.toast);
  const [products, setProducts] = useState<ProductDTO[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { originalPrice: string; salePrice: string; stock: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [formFor, setFormFor] = useState<ProductDTO | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const load = () => {
    setLoadFailed(false);
    fetch("/api/products")
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => {
        const list: ProductDTO[] = Array.isArray(d?.products) ? d.products : [];
        setProducts(list);
        setDrafts(
          Object.fromEntries(
            list.map((p) => [
              p.id,
              {
                originalPrice: String(p.originalPrice),
                salePrice: p.salePrice === null ? "" : String(p.salePrice),
                stock: String(p.stock),
              },
            ])
          )
        );
      })
      .catch(() => {
        setProducts(null);
        setLoadFailed(true);
      });
  };
  useEffect(load, []);

  const dirty = useMemo(() => {
    if (!products) return new Set<string>();
    const s = new Set<string>();
    for (const p of products) {
      const d = drafts[p.id];
      if (!d) continue;
      if (
        Number(d.originalPrice) !== p.originalPrice ||
        (d.salePrice === "" ? null : Number(d.salePrice)) !== p.salePrice ||
        Number(d.stock) !== p.stock
      )
        s.add(p.id);
    }
    return s;
  }, [products, drafts]);

  async function saveRow(p: ProductDTO) {
    const d = drafts[p.id];
    if (!d || savingId) return;
    setSavingId(p.id);
    try {
      const res = await adminFetch(`/api/admin/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrice: Number(d.originalPrice),
          salePrice: d.salePrice === "" ? null : Number(d.salePrice),
          stock: Number(d.stock),
        }),
      });
      const data = await readApiJson<{ product?: ProductDTO }>(res);
      if (!data.product) throw new Error("Update failed.");
      setProducts((ps) => ps!.map((x) => (x.id === p.id ? data.product! : x)));
      toast("Saved");
    } catch (e) {
      if (e instanceof AuthError) {
        onUnauthorized();
        return;
      }
      toast(e instanceof Error ? e.message : "Update failed.", "error");
    } finally {
      setSavingId(null);
    }
  }

  async function toggleFeatured(p: ProductDTO) {
    try {
      const res = await adminFetch(`/api/admin/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !p.isFeatured }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((ps) => ps!.map((x) => (x.id === p.id ? data.product : x)));
      }
    } catch (e) {
      if (e instanceof AuthError) onUnauthorized();
    }
  }

  async function remove(p: ProductDTO) {
    if (!confirm(`Delete “${p.title}”? This cannot be undone.`)) return;
    setDeletingId(p.id);
    try {
      const res = await adminFetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      setProducts((ps) => ps!.filter((x) => x.id !== p.id));
      toast("Product deleted", "info");
    } catch (e) {
      if (e instanceof AuthError) {
        onUnauthorized();
        return;
      }
      toast(e instanceof Error ? e.message : "Delete failed.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  const numInput =
    "h-8 w-full rounded-lg border border-stone-200 bg-stone-50 px-2 text-xs font-bold outline-none focus:border-pine-500 focus:bg-white";

  return (
    <div className="rounded-2xl border border-stone-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
        <h3 className="text-sm font-extrabold text-pine-950">Catalogue</h3>
        <span className="rounded-full bg-pine-50 px-2 py-0.5 text-[10px] font-extrabold text-pine-700">
          {products?.length ?? "…"} items
        </span>
        <button
          onClick={() => {
            setFormFor(null);
            setFormOpen(true);
          }}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-pine-950 shadow transition hover:brightness-105"
        >
          <Plus className="h-4 w-4" strokeWidth={3} /> Add Product
        </button>
      </div>

      {!products ? (
        loadFailed ? (
          <div className="flex flex-col items-center py-14 text-center">
            <PackageX className="h-8 w-8 text-amber-500" />
            <p className="mt-3 text-sm font-extrabold text-stone-700">Couldn&apos;t load products</p>
            <p className="mt-1 text-xs text-stone-400">Check your connection and try again.</p>
            <button
              onClick={load}
              className="mt-4 rounded-full bg-pine-800 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-pine-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <TableSkeleton rows={6} cols={5} />
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                <th className="px-5 py-3">Product</th>
                <th className="w-28 px-3 py-3">Price / kg</th>
                <th className="w-28 px-3 py-3">Sale / kg</th>
                <th className="w-24 px-3 py-3">Stock</th>
                <th className="px-3 py-3">Featured</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {products.map((p) => {
                const d = drafts[p.id] ?? { originalPrice: "", salePrice: "", stock: "0" };
                const isDirty = dirty.has(p.id);
                return (
                  <tr key={p.id} className="align-middle transition hover:bg-stone-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt="" className="h-11 w-11 rounded-xl object-cover" />
                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate font-bold text-stone-800">{p.title}</p>
                          <p className="text-[10px] font-semibold text-stone-400">
                            {p.category} · {p.weightOptions.join(" / ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={1}
                        value={d.originalPrice}
                        onChange={(e) =>
                          setDrafts((s) => ({ ...s, [p.id]: { ...d, originalPrice: e.target.value } }))
                        }
                        className={numInput}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={1}
                        placeholder="—"
                        value={d.salePrice}
                        onChange={(e) =>
                          setDrafts((s) => ({ ...s, [p.id]: { ...d, salePrice: e.target.value } }))
                        }
                        className={numInput}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={0}
                        value={d.stock}
                        onChange={(e) =>
                          setDrafts((s) => ({ ...s, [p.id]: { ...d, stock: e.target.value } }))
                        }
                        className={cn(
                          numInput,
                          p.stock === 0
                            ? "border-red-300 bg-red-50 text-red-600"
                            : p.stock < 5
                              ? "border-amber-300 bg-amber-50 text-amber-700"
                              : ""
                        )}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => toggleFeatured(p)}
                        className={cn(
                          "rounded-lg p-2 transition",
                          p.isFeatured ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-300 hover:text-amber-500"
                        )}
                        aria-label="Toggle featured"
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {isDirty && (
                          <button
                            onClick={() => saveRow(p)}
                            disabled={savingId === p.id}
                            className="flex items-center gap-1 rounded-lg bg-pine-800 px-2.5 py-1.5 text-[10px] font-extrabold uppercase text-white transition hover:bg-pine-700"
                          >
                            {savingId === p.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Save
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setFormFor(p);
                            setFormOpen(true);
                          }}
                          className="rounded-lg bg-stone-100 p-2 text-stone-500 transition hover:bg-pine-100 hover:text-pine-700"
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => remove(p)}
                          disabled={deletingId === p.id}
                          className="rounded-lg bg-stone-100 p-2 text-stone-500 transition hover:bg-red-50 hover:text-red-500"
                          aria-label="Delete"
                        >
                          {deletingId === p.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="px-5 py-10 text-center text-xs text-stone-400">
              No products yet — click “Add Product” to create your first listing.
            </p>
          )}
        </div>
      )}

      {formOpen && (
        <ProductForm
          initial={formFor}
          onClose={() => setFormOpen(false)}
          onUnauthorized={onUnauthorized}
          onSaved={(saved) =>
            setProducts((ps) =>
              ps && formFor ? ps.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...(ps ?? [])]
            )
          }
        />
      )}
    </div>
  );
}
