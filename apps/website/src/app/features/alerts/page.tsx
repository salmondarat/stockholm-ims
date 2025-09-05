import FeatureDetail from "@/components/FeatureDetail";

export default function Page() {
  return (
    <FeatureDetail
      spec={{
        title: "Alerts",
        desc: "Stay ahead with low‑stock thresholds and at‑a‑glance status.",
        image: "/mock-generic.svg",
        bullets: [
          "Configurable low-stock levels per item",
          "Status badges across the dashboard",
          "Email-friendly PDF exports for reporting",
        ],
      }}
    />
  );
}
