import SolutionDetail from "@/components/SolutionDetail";

export default function Page() {
  return (
    <SolutionDetail
      spec={{
        title: "Manufacturing",
        desc: "Track components and finished goods across lines and warehouses.",
        image: "/mock-generic.svg",
        bullets: [
          "BOM-level attributes",
          "Per-line locations",
          "Barcode/QR labels",
        ],
      }}
    />
  );
}
