import { summarizeOptions } from "@/lib/options";

export default function VariationSummary({ options, max = 80, className = "text-[11px] text-gray-500" }: { options: any; max?: number; className?: string }) {
  const text = summarizeOptions(options, max);
  if (!text) return null;
  return <div className={className}>{text}</div>;
}

