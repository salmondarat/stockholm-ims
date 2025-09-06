import React from "react";

type Cell = string | boolean;

type Row = {
  label: string;
  note?: string;
  values: Cell[]; // must align with plans length
};

type Section = {
  title: string;
  rows: Row[];
};

export default function ComparePlansTable({
  plans,
  sections,
}: {
  plans: string[];
  sections: Section[];
}) {
  return (
    <div className="mt-14">
      <h2 className="text-2xl font-semibold text-center">Compare Plans</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border border-subtle rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50/60">
              <th className="text-left px-3 py-3 text-sm font-medium w-[280px] min-w-[220px]">
                Feature
              </th>
              {plans.map((p) => (
                <th
                  key={p}
                  className="px-3 py-3 text-sm font-medium text-center whitespace-nowrap"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((section, si) => (
              <React.Fragment key={section.title}>
                <tr>
                  <td
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide bg-gray-900 text-white"
                    colSpan={plans.length + 1}
                  >
                    {section.title}
                  </td>
                </tr>
                {section.rows.map((row, ri) => (
                  <tr
                    key={`${si}-${ri}`}
                    className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
                  >
                    <td className="px-3 py-3 align-top">
                      <div className="text-sm">
                        <span>{row.label}</span>
                        {row.note ? (
                          <span className="ml-1 text-xs text-muted">
                            {row.note}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-3 py-3 text-center">
                        {typeof v === "boolean" ? (
                          v ? (
                            <span aria-label="Included" title="Included">
                              ✓
                            </span>
                          ) : (
                            <span
                              aria-label="Not included"
                              className="text-gray-300"
                            >
                              •
                            </span>
                          )
                        ) : (
                          <span className="text-sm">{v}</span>
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
