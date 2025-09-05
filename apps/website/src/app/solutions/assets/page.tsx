import SolutionDetail from "@/components/SolutionDetail";

export default function Page() {
  return (
    <SolutionDetail
      spec={{
        title: "Asset Tracking",
        desc: "Manage tools and equipment with labels, photos, and statuses.",
        image: "/mock-generic.svg",
        bullets: ["Serials and conditions", "Locations and categories", "Fast lookups with QR/Barcode"],
      }}
    />
  );
}
