import { SpecRow } from "@/lib/types";

export function SpecTable({ specs, caption }: { specs: SpecRow[]; caption?: string }) {
  return (
    <div className="overflow-hidden rounded-none border border-border">
      <table className="w-full text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <tbody>
          {specs.map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? "bg-stone/60" : "bg-cream"}>
              {/* Header cell for the row: machines (and screen readers) can
                  tell which value belongs to which property. */}
              <th scope="row" className="w-1/3 px-5 py-3.5 text-left font-medium text-ink">
                {row.label}
              </th>
              <td className="px-5 py-3.5 text-ink-soft">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
