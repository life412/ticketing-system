import { Role } from "@prisma/client";

/**
 * Returns the dedicated dashboard route for a given user role.
 */
export function getRoleDashboardRoute(role?: Role | string | null): string {
  switch (role) {
    case Role.MANAGER:
    case "MANAGER":
      return "/dashboard/manager";
    case Role.TECH:
    case "TECH":
      return "/dashboard/tech";
    case Role.EMPLOYEE:
    case "EMPLOYEE":
    default:
      return "/dashboard/employee";
  }
}
