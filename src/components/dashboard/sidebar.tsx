"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import {
  Ticket,
  LayoutDashboard,
  Users,
  Wrench,
  CheckCircle2,
  PlusCircle,
  FileText,
  Menu,
  X,
  Shield,
  Clock,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role: Role | string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getNavItems = () => {
    switch (role) {
      case Role.MANAGER:
      case "MANAGER":
        return [
          { label: "Dashboard", href: "/", icon: LayoutDashboard },
          { label: "All Tickets", href: "/dashboard/manager", icon: Ticket },
          { label: "Team Workload", href: "/dashboard/manager#workload", icon: Users },
        ];
      case Role.TECH:
      case "TECH":
        return [
          { label: "Dashboard", href: "/", icon: LayoutDashboard },
          { label: "My Workspace", href: "/dashboard/tech", icon: Wrench },
          { label: "Open Queue", href: "/dashboard/tech#queue", icon: Clock },
        ];
      case Role.EMPLOYEE:
      case "EMPLOYEE":
      default:
        return [
          { label: "Dashboard", href: "/", icon: LayoutDashboard },
          { label: "My Tickets", href: "/dashboard/employee", icon: FileText },
          { label: "New Request", href: "/dashboard/employee#new", icon: PlusCircle },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    switch (role) {
      case "MANAGER":
        return { label: "Manager", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" };
      case "TECH":
        return { label: "Technician", color: "bg-amber-500/10 border-amber-500/20 text-amber-400" };
      default:
        return { label: "Employee", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" };
    }
  };

  const badge = getRoleBadge();

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-slate-900 border-slate-800 text-slate-100"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out backdrop-blur-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="space-y-6 p-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-100 block">LinearDesk</span>
              <span className="text-xs text-slate-500 font-mono">Enterprise v1.0</span>
            </div>
          </div>

          {/* User Role Badge */}
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace</span>
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", badge.color)}>
              {badge.label}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Credit / Status */}
        <div className="p-4 border-t border-slate-800/60 text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> System Online
          </span>
        </div>
      </aside>
    </>
  );
}
