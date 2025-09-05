import FeatureDetail from "@/components/FeatureDetail";

export default function Page() {
  return (
    <FeatureDetail
      spec={{
        title: "QR Coding",
        desc: "Use compact QR codes to encode SKUs, locations, or URLs for quick actions.",
        image: "/mock-generic.svg",
        bullets: [
          "Generate QR labels for items and locations",
          "Open item detail instantly when scanned",
          "Works with any modern camera",
        ],
      }}
    />
  );
}
