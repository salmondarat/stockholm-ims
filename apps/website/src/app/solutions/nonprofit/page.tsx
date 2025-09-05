import SolutionDetail from "@/components/SolutionDetail";

export default function Page() {
  return (
    <SolutionDetail
      spec={{
        title: "Nonprofit",
        desc: "Manage donations, loanable items, and event kits.",
        image: "/mock-media.svg",
        bullets: ["Loan tracking", "Tags and categories", "Exportable reports"],
      }}
    />
  );
}
