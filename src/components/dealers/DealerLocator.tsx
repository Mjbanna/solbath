"use client";

import { useMemo, useState } from "react";
import { MapPin, Phone, Star, Navigation } from "lucide-react";
import { Dealer } from "@/lib/types";
import { VerticalMeta } from "@/lib/data/categories";

export function DealerLocator({
  dealers,
  cities,
  verticalMeta,
}: {
  dealers: Dealer[];
  cities: string[];
  verticalMeta: VerticalMeta;
}) {
  const [city, setCity] = useState("all");

  const filtered = useMemo(() => {
    if (city === "all") return dealers;
    return dealers.filter((d) => d.city === city);
  }, [dealers, city]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-ink">City</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-none border border-border bg-cream px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
        >
          <option value="all">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-sm text-ink-soft">
          {filtered.length} {filtered.length === 1 ? "showroom" : "showrooms"} found
        </span>
      </div>

      <h2 className="sr-only">Dealers and showrooms</h2>

      <div className="mt-8 grid gap-6">
        {filtered.map((dealer) => (
          <div
            key={dealer.id}
            className="flex flex-col justify-between gap-4 rounded-none border border-border p-6 sm:flex-row sm:items-center"
          >
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-heading text-lg text-ink">{dealer.name}</h3>
                <span className="flex items-center gap-1 text-xs font-medium text-ink-soft">
                  <Star size={13} className="text-accent" fill="currentColor" />
                  {dealer.rating}
                </span>
              </div>
              <p className="mt-1.5 flex items-start gap-1.5 text-sm text-ink-soft">
                <MapPin size={15} className="mt-0.5 shrink-0" /> {dealer.address}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-soft">
                <Phone size={15} className="shrink-0" /> {dealer.phone}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {dealer.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-none bg-stone px-3 py-1 text-[11px] font-medium text-ink-soft"
                  >
                    {verticalMeta[c].name}
                  </span>
                ))}
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                dealer.name + " " + dealer.address,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-2 self-start rounded-none border border-accent bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            >
              <Navigation size={15} /> Get Directions
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
