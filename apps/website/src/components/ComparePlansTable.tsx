import React from "react";
import { Check, Minus } from "lucide-react";

type Cell = string | boolean;

type Row = {
  label: string;
  note?: string;
  values: Cell[]; // length must equal plans length
};

type Section = {
  title: string;
  rows: Row[];
};

type PlanHeader = { name: string; icon?: React.ReactNode };

export default function ComparePlansTable({
  plans,
  sections,
}: {
  plans: Array<string | PlanHeader>;
  sections: Section[];
}) {
  const normalized: PlanHeader[] = plans.map((p) =>
    typeof p === "string" ? { name: p } : p,
  );
  return (
    <div className="mt-14">
      <h2 className="text-2xl font-semibold text-center">Compare Plans</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full table-fixed border border-subtle rounded-lg overflow-hidden text-sm">
          <colgroup>
            <col className="w-[280px] min-w-[240px]" />
            {normalized.map((_, i) => (
              <col key={i} className="min-w-[160px]" />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-gray-50/70">
              <th className="text-left px-4 py-3 font-medium">Feature</th>
              {normalized.map((p) => (
                <th
                  key={p.name}
                  className="px-4 py-3 text-center font-medium whitespace-nowrap"
                >
                  <div className="inline-flex flex-col items-center gap-2">
                    {p.icon ? (
                      <span className="inline-grid place-items-center h-8 w-8 rounded-full bg-gray-100 text-gray-700">
                        {p.icon}
                      </span>
                    ) : null}
                    <span className="text-[13px] sm:text-sm">{p.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((section, si) => (
              <React.Fragment key={section.title}>
                <tr>
                  <td
                    className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide bg-gray-900 text-white"
                    colSpan={normalized.length + 1}
                  >
                    {section.title}
                  </td>
                </tr>
                {section.rows.map((row, ri) => (
                  <tr key={`${si}-${ri}`} className="even:bg-gray-50/40">
                    <td className="px-4 py-3 align-top">
                      <div>
                        <span className="leading-5">{row.label}</span>
                        {row.note ? (
                          <span className="ml-1 text-xs text-muted">
                            {row.note}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {typeof v === "boolean" ? (
                          v ? (
                            <Check
                              aria-label="Included"
                              className="h-4 w-4 inline text-emerald-600"
                            />
                          ) : (
                            <Minus
                              aria-label="Not included"
                              className="h-4 w-4 inline text-gray-300"
                            />
                          )
                        ) : (
                          <span className="text-[13px] sm:text-sm">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
