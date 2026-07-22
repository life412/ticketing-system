"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { TicketStatus, TicketPriority, TicketCategory } from "@prisma/client";
import { Search, RotateCcw, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterToolbarProps {
  technicians: { id: string; name: string | null; email: string }[];
}

export default function TicketFilterToolbar({ technicians }: FilterToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [priority, setPriority] = useState(searchParams.get("priority") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [assignedTo, setAssignedTo] = useState(searchParams.get("assignedTo") || "");

  const updateFilters = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`/tickets?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query, status, priority, category, assignedTo });
  };

  const handleReset = () => {
    setQuery("");
    setStatus("");
    setPriority("");
    setCategory("");
    setAssignedTo("");
    router.push("/tickets");
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md space-y-4 backdrop-blur-md"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-2">
        <Filter className="h-3.5 w-3.5 text-blue-400" /> Filter & Search Parameters
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 text-xs bg-slate-950/80"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            updateFilters({ query, status: e.target.value, priority, category, assignedTo });
          }}
          className="h-10 rounded-md border border-slate-800 bg-slate-950/80 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value={TicketStatus.OPEN}>OPEN</option>
          <option value={TicketStatus.ASSIGNED}>ASSIGNED</option>
          <option value={TicketStatus.IN_PROGRESS}>IN_PROGRESS</option>
          <option value={TicketStatus.RESOLVED}>RESOLVED</option>
          <option value={TicketStatus.CLOSED}>CLOSED</option>
        </select>

        {/* Priority Dropdown */}
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            updateFilters({ query, status, priority: e.target.value, category, assignedTo });
          }}
          className="h-10 rounded-md border border-slate-800 bg-slate-950/80 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Priorities</option>
          <option value={TicketPriority.LOW}>LOW</option>
          <option value={TicketPriority.MEDIUM}>MEDIUM</option>
          <option value={TicketPriority.HIGH}>HIGH</option>
          <option value={TicketPriority.CRITICAL}>CRITICAL</option>
        </select>

        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            updateFilters({ query, status, priority, category: e.target.value, assignedTo });
          }}
          className="h-10 rounded-md border border-slate-800 bg-slate-950/80 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          <option value={TicketCategory.IT_SUPPORT}>IT Support</option>
          <option value={TicketCategory.FACILITIES}>Facilities</option>
          <option value={TicketCategory.HR}>HR</option>
          <option value={TicketCategory.OTHER}>Other</option>
        </select>

        {/* AssignedTo Dropdown */}
        <select
          value={assignedTo}
          onChange={(e) => {
            setAssignedTo(e.target.value);
            updateFilters({ query, status, priority, category, assignedTo: e.target.value });
          }}
          className="h-10 rounded-md border border-slate-800 bg-slate-950/80 px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Assignees</option>
          <option value="unassigned">Unassigned Only</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name || tech.email}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="border-slate-800 hover:bg-slate-800 text-slate-400 text-xs gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
        </Button>
      </div>
    </form>
  );
}
