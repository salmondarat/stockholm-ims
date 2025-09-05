import SolutionDetail from "@/components/SolutionDetail";

export default function Page() {
  return (
    <SolutionDetail
      spec={{
        title: "Field Teams",
        desc: "Track kits and tools on the go with mobile scanning.",
        image: "/mock-generic.svg",
        bullets: ["Issue and return tracking", "Locations and labels", "Offline-friendly workflows"],
      }}
    />
  );
}
