import type { SystemRole } from "@/types";

/**
 * SGTI — RBAC Role Definitions
 *
 * Defines which roles can access which modules and operations.
 * Used by middleware, Server Components, and Server Actions.
 *
 * Source of truth: Docs/22_AUTHENTICATION.md (Roles & Permissions)
 */

/** Role display names (Portuguese — shown in UI) */
export const ROLE_LABELS: Record<SystemRole, string> = {
  SUPER_ADMIN: "Super Administrador",
  IT_MANAGER: "Gerente de TI",
  IT_ANALYST: "Analista de TI",
  IT_TECHNICIAN: "Técnico de TI",
  AUDITOR: "Auditor",
  END_USER: "Usuário Final",
};

/** Role priority — higher number = higher privilege */
export const ROLE_PRIORITY: Record<SystemRole, number> = {
  SUPER_ADMIN: 100,
  IT_MANAGER: 80,
  IT_ANALYST: 60,
  IT_TECHNICIAN: 40,
  AUDITOR: 30,
  END_USER: 10,
};

/** Roles that can access the IT Operations portal (full dashboard) */
export const IT_STAFF_ROLES: SystemRole[] = [
  "SUPER_ADMIN",
  "IT_MANAGER",
  "IT_ANALYST",
  "IT_TECHNICIAN",
];

/** Roles that can manage other users and system settings */
export const ADMIN_ROLES: SystemRole[] = ["SUPER_ADMIN", "IT_MANAGER"];

/** Returns the highest-priority role from a list of roles */
export function getHighestRole(roles: SystemRole[]): SystemRole | null {
  if (roles.length === 0) {
    return null;
  }
  return roles.reduce((highest, role) =>
    ROLE_PRIORITY[role] > ROLE_PRIORITY[highest] ? role : highest,
  );
}

/** Checks if a user with the given roles has at least one of the required roles */
export function hasRole(userRoles: SystemRole[], requiredRoles: SystemRole[]): boolean {
  return requiredRoles.some((required) => userRoles.includes(required));
}

/** Checks if a user can manage (create/edit/delete) other users' resources */
export function canManageUsers(roles: SystemRole[]): boolean {
  return hasRole(roles, ADMIN_ROLES);
}
