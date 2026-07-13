/**
 * SGTI — Application Route Constants
 *
 * All routes are defined here to avoid hardcoded strings scattered
 * throughout the codebase. Import from here — never hardcode routes.
 */

export const ROUTES = {
  // ─── Public routes ────────────────────────────────────────────────────────
  LOGIN: "/login",
  AUTH_CALLBACK: "/auth/callback",

  // ─── API routes ────────────────────────────────────────────────────────────
  API: {
    HEALTH: "/api/health",
    VERSION: "/api/version",
  },

  // ─── Dashboard modules ─────────────────────────────────────────────────────
  INCIDENTS: {
    LIST: "/incidents",
    NEW: "/incidents/new",
    DETAIL: (id: string) => `/incidents/${id}`,
    EDIT: (id: string) => `/incidents/${id}/edit`,
  },

  REQUESTS: {
    LIST: "/requests",
    NEW: "/requests/new",
    DETAIL: (id: string) => `/requests/${id}`,
  },

  PROBLEMS: {
    LIST: "/problems",
    DETAIL: (id: string) => `/problems/${id}`,
  },

  ASSETS: {
    LIST: "/assets",
    NEW: "/assets/new",
    DETAIL: (id: string) => `/assets/${id}`,
  },

  IDENTITIES: {
    LIST: "/identities",
    DETAIL: (id: string) => `/identities/${id}`,
  },

  COMPLIANCE: {
    LIST: "/compliance",
    DETAIL: (id: string) => `/compliance/${id}`,
  },

  FINANCE: {
    LIST: "/finance",
    BUDGET: "/finance/budget",
    CONTRACTS: "/finance/contracts",
  },

  PROJECTS: {
    LIST: "/projects",
    DETAIL: (id: string) => `/projects/${id}`,
  },

  KNOWLEDGE: {
    LIST: "/knowledge",
    ARTICLE: (id: string) => `/knowledge/${id}`,
    NEW: "/knowledge/new",
  },

  ADMIN: {
    ROOT: "/admin",
    USERS: "/admin/users",
    ROLES: "/admin/roles",
    CATALOG: "/admin/catalog",
    SLA: "/admin/sla",
    SETTINGS: "/admin/settings",
  },
} as const;

/** Routes that do not require authentication */
export const PUBLIC_ROUTES: string[] = [
  ROUTES.LOGIN,
  ROUTES.AUTH_CALLBACK,
  ROUTES.API.HEALTH,
  ROUTES.API.VERSION,
];
