import SolutionDetail from "@/components/SolutionDetail";

export default function Page() {
  return (
    <SolutionDetail
      spec={{
        title: "Inventory Management",
        desc: "Organize items, variants, and counts with categories, tags, and locations.",
        image: "/mock-generic.svg",
        bullets: ["Variant attributes and SKUs", "Low‑stock thresholds", "Flexible media uploads"],
      }}
    />
  );
}
