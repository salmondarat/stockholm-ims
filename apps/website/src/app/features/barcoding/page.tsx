import FeatureDetail from "@/components/FeatureDetail";

export default function Page() {
  return (
    <FeatureDetail
      spec={{
        title: "Barcoding",
        desc: "Scan and generate barcodes to keep SKUs accurate across your catalog.",
        image: "/mock-scan.svg",
        bullets: [
          "Fast camera-based scanning",
          "Auto-suggest SKU matches",
          "Label generation for shelves and bins",
        ],
      }}
    />
  );
}
