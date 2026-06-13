/**
 * SGTI — Global Type Definitions
 *
 * Types used across the entire application.
 * Module-specific types live in their own service/component files.
 */

// ─── RBAC ─────────────────────────────────────────────────────────────────────
export type SystemRole =
  | "SUPER_ADMIN"
  | "IT_MANAGER"
  | "IT_ANALYST"
  | "IT_TECHNICIAN"
  | "AUDITOR"
  | "END_USER";

// ─── API Response wrapper ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// ─── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── ITIL Priority ────────────────────────────────────────────────────────────
export type TicketPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type TicketStatus =
  | "NEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING_USER"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

// ─── SLA ──────────────────────────────────────────────────────────────────────
export type SlaStatus = "OK" | "WARNING" | "BREACH";

// ─── User ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  displayName: string | null;
  avatarUrl: string | null;
  roles: SystemRole[];
}

// ─── Utility types ────────────────────────────────────────────────────────────
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<ApiResult<T>>;

/** Makes all nested properties optional — useful for partial updates */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** Extracts the resolved type from a Promise */
export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

/** String brand type — prevents mixing up IDs from different entities */
export type Brand<T, B extends string> = T & { readonly __brand: B };
export type TicketId = Brand<string, "TicketId">;
export type UserId = Brand<string, "UserId">;
export type AssetId = Brand<string, "AssetId">;
