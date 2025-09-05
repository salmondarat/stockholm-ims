import FeatureDetail from "@/components/FeatureDetail";

export default function Page() {
  return (
    <FeatureDetail
      spec={{
        title: "Reporting",
        desc: "Generate clean, data‑driven PDF exports to share with your team.",
        image: "/mock-media.svg",
        bullets: [
          "Summarize by category or location",
          "Variant-level counts included",
          "Ready to print or email",
        ],
      }}
    />
  );
}
