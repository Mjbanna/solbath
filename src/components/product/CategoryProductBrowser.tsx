"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { productMatchesOption } from "@/lib/utils";

export function CategoryProductBrowser({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleOption = (group: string, option: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      const current = new Set(next[group] ?? []);
      if (current.has(option)) current.delete(option);
      else current.add(option);
      next[group] = current;
      return next;
    });
  };

  const clearFilters = () => setSelected({});

  const activeCount = Object.values(selected).reduce((sum, set) => sum + set.size, 0);

  // A filter option (or whole group) only renders if at least one product in
  // this category actually matches it - otherwise editors would see dead
  // checkboxes for values (e.g. "Bidet") nothing in the catalog has yet.
  const visibleFilterGroups = useMemo(() => {
    return category.filters
      .map((group) => ({
        ...group,
        options: group.options.filter((option) =>
          products.some((product) =>
            productMatchesOption(
              [
                product.name,
                product.collection,
                ...product.finishes,
                ...(product.sizes ?? []),
                ...product.tags,
              ],
              option,
            ),
          ),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [category.filters, products]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const candidates = [
        product.name,
        product.collection,
        ...product.finishes,
        ...(product.sizes ?? []),
        ...product.tags,
      ];
      return Object.entries(selected).every(([, options]) => {
        if (options.size === 0) return true;
        return Array.from(options).some((option) => productMatchesOption(candidates, option));
      });
    });
  }, [products, selected]);

  const hasFilters = visibleFilterGroups.length > 0;

  return (
    <div className={hasFilters ? "grid gap-10 lg:grid-cols-[240px_1fr]" : ""}>
      {hasFilters ? (
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className="flex items-center justify-between rounded-none border border-border px-4 py-3 text-sm font-medium text-ink lg:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={16} /> Filters {activeCount > 0 ? `(${activeCount})` : ""}
          </span>
        </button>
      ) : null}

      {hasFilters ? (
        <aside className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block`}>
          <div className="sticky top-24 space-y-8">
            {/* Keeps the outline intact: the cards below are h3. */}
            <h2 className="sr-only">Products</h2>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Filter By
              </p>
              {activeCount > 0 ? (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-dark"
                >
                  Clear <X size={12} />
                </button>
              ) : null}
            </div>

            {visibleFilterGroups.map((group) => (
              <div key={group.label}>
                <p className="text-sm font-medium text-ink">{group.label}</p>
                <div className="mt-3 space-y-2.5">
                  {group.options.map((option) => {
                    const checked = selected[group.label]?.has(option) ?? false;
                    return (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOption(group.label, option)}
                          className="h-4 w-4 rounded-none border-border text-accent focus:ring-accent"
                        />
                        {option}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      ) : null}

      <div>
        <div className="mb-6 flex items-center justify-between text-sm text-ink-soft">
          <p>
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-none border border-dashed border-border py-20 text-center">
            <p className="text-sm text-ink-soft">
              No products match these filters yet. Try clearing a filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
