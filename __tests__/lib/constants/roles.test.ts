import { hasRole, getHighestRole, canManageUsers, ROLE_PRIORITY } from "@/lib/constants/roles";
import type { SystemRole } from "@/types";

describe("hasRole", () => {
  it("returns true when user has a required role", () => {
    const roles: SystemRole[] = ["IT_ANALYST", "END_USER"];
    expect(hasRole(roles, ["IT_ANALYST"])).toBe(true);
  });
  it("returns false when user lacks all required roles", () => {
    expect(hasRole(["END_USER"], ["SUPER_ADMIN", "IT_MANAGER"])).toBe(false);
  });
});

describe("getHighestRole", () => {
  it("returns the role with highest priority", () => {
    expect(getHighestRole(["END_USER", "IT_ANALYST", "IT_MANAGER"])).toBe("IT_MANAGER");
  });
  it("returns null for empty array", () => {
    expect(getHighestRole([])).toBeNull();
  });
});

describe("ROLE_PRIORITY", () => {
  it("SUPER_ADMIN > IT_MANAGER", () => {
    expect(ROLE_PRIORITY.SUPER_ADMIN).toBeGreaterThan(ROLE_PRIORITY.IT_MANAGER);
  });
  it("END_USER has lowest priority", () => {
    const all = Object.values(ROLE_PRIORITY);
    expect(ROLE_PRIORITY.END_USER).toBe(Math.min(...all));
  });
});

describe("canManageUsers", () => {
  it("allows SUPER_ADMIN", () => expect(canManageUsers(["SUPER_ADMIN"])).toBe(true));
  it("allows IT_MANAGER", () => expect(canManageUsers(["IT_MANAGER"])).toBe(true));
  it("denies IT_ANALYST", () => expect(canManageUsers(["IT_ANALYST"])).toBe(false));
});
