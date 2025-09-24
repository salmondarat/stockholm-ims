"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface FilterMenuProps {
  searchQuery?: string;
  categoryFilter?: string;
  conditionFilter?: string;
  locationFilter?: string;
  filter?: string;
  categories: Array<{ id: string; name: string }>;
  uniqueConditions: string[];
  uniqueLocations: string[];
}

export default function FilterMenu({
  searchQuery = "",
  categoryFilter = "",
  conditionFilter = "",
  locationFilter = "",
  filter = "",
  categories,
  uniqueConditions,
  uniqueLocations,
}: FilterMenuProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localCategory, setLocalCategory] = useState(categoryFilter);
  const [localCondition, setLocalCondition] = useState(conditionFilter);
  const [localLocation, setLocalLocation] = useState(locationFilter);
  const [localLowStock, setLocalLowStock] = useState(filter === "low");

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", localSearch);
    if (localCategory) params.set("category", localCategory);
    else params.delete("category");
    if (localCondition) params.set("condition", localCondition);
    else params.delete("condition");
    if (localLocation) params.set("location", localLocation);
    else params.delete("location");
    if (localLowStock) params.set("filter", "low");
    else params.delete("filter");

    router.push(`/app/items?${params.toString()}`);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalSearch("");
    setLocalCategory("");
    setLocalCondition("");
    setLocalLocation("");
    setLocalLowStock(false);
    const params = new URLSearchParams();
    router.push("/app/items");
    setOpen(false);
  };

  const buttonRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={buttonRef}>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setOpen(!open)}
      >
        <Filter className="h-4 w-4" />
        Filters
        {open && <X className="h-4 w-4" />}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filter Items</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Adjust filters to narrow down your item list.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search
                </label>
                <input
                  id="search"
                  type="search"
                  placeholder="Search by name, SKU, or tags..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <select
                  id="category"
                  value={localCategory}
                  onChange={(e) => setLocalCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="condition" className="text-sm font-medium">
                  Condition
                </label>
                <select
                  id="condition"
                  value={localCondition}
                  onChange={(e) => setLocalCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                >
                  <option value="">All Conditions</option>
                  {uniqueConditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <select
                  id="location"
                  value={localLocation}
                  onChange={(e) => setLocalLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="low-stock"
                  checked={localLowStock}
                  onChange={(e) => setLocalLowStock(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="low-stock" className="text-sm font-medium">
                  Low Stock Only
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="px-4 py-2"
                size="sm"
              >
                Clear All
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                size="sm"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
