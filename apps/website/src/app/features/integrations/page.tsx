import FeatureDetail from "@/components/FeatureDetail";

export default function Page() {
  return (
    <FeatureDetail
      spec={{
        title: "Integrations",
        desc: "Flexible storage and exports. Store media locally or S3/MinIO and export clean PDFs.",
        image: "/mock-generic.svg",
        bullets: [
          "S3/MinIO compatible media storage",
          "CSV/PDF exports",
          "Stable APIs for future extensions",
        ],
      }}
    />
  );
}
