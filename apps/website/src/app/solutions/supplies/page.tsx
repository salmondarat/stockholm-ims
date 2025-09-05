import SolutionDetail from "@/components/SolutionDetail";

export default function Page() {
  return (
    <SolutionDetail
      spec={{
        title: "Supplies Tracking",
        desc: "Track consumables and materials across teams, with clear reorder signals.",
        image: "/mock-media.svg",
        bullets: ["Per‑location counts", "Simple PDF exports", "History you can trust"],
      }}
    />
  );
}
