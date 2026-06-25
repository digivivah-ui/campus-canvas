# Phase 6.95 — Final Standardization & Production Readiness

Scope is hardening only — no new modules, no schema changes. Work is grouped into 5 batches that ship sequentially so each can be verified before the next.

## Batch 1 — Table standardization (shared infra rollout)

Refactor these admin pages to use `DataTable`, `DataToolbar`, `Pagination`, `EmptyState`, `TableSkeleton`, `ErrorState`, plus `useDebouncedValue`, `exportCSV`, `exportPDF`:

- `AdminStudents.tsx`
- `AdminStaff.tsx`
- `AdminAttendance.tsx` (and `AdminStaffAttendance.tsx`)
- `AdminFinance.tsx`
- `AdminResults.tsx`
- `AdminCertificates.tsx`
- `AdminNotifications.tsx`

Each page keeps its existing dialogs/forms and business logic untouched. Only the list surface changes: debounced search, filter selects, sortable headers (client-side via small `useSort` helper), pagination with page-size 10/25/50/100, CSV + PDF export buttons in the toolbar, and the three non-data states routed through the shared components.

## Batch 2 — Notification automation

Wire remaining domain events through existing `src/lib/notify.ts` helpers. No new tables.

- Attendance marked / student absent → `TeacherAttendance.tsx`, `AdminAttendance.tsx` save handlers (notify parent + student of each absent record; summary notify to admins).
- Fee paid → `AdminFinance.tsx` collection insert (notify student + parent).
- Fee due → reuse `AdminReminders.tsx` send action (notify defaulters' parents).
- Result published → `AdminResults.tsx` publish action (notify section parents + students).
- Homework created → `AdminHomework.tsx` and `TeacherHomework.tsx` insert (notify section).
- Transport route assigned / updated → `AdminTransport.tsx` student assignment save (notify parent + student).

Each call site uses the existing `notifyParentOfStudent` / `notifySection` / `notifyAdmins` helpers; failures are swallowed so the primary write never breaks.

## Batch 3 — Permission & mobile audit

- Wrap remaining admin routes in `App.tsx` with `<RequirePermission action="…" />` matching the matrix in `src/lib/permissions.ts`.
- Hide create/edit/delete buttons via `useCan()` on pages that expose them (Students, Staff, Finance, Results, Certificates, Homework, Transport, Notifications, Inquiries, Visitors, Leaves, Calendar, Reminders).
- Mobile pass at 375px via Playwright on: Students, Attendance, Finance, Results, Staff, Transport, Certificates, parent + student portals. Fix any horizontal overflow by enforcing `overflow-x-auto` wrappers (already in `DataTable`) and stacking toolbar filters with `flex-wrap`.

## Batch 4 — Export, dashboard, data quality

- Confirm every refactored module exposes CSV + PDF through `src/lib/export.ts` with consistent column ordering and filename `<module>-YYYY-MM-DD`.
- `ExecutiveKPIs.tsx`: keep the `Promise.all` fan-out, switch each tile to `head:true, count:'exact'` queries (no row payloads), add a 60s in-memory cache keyed by metric to avoid refetch storms on re-render.
- Spot-check totals against raw queries (fees collected vs `fees_collection`, attendance % vs `attendance`, defaulters count) via `supabase--read_query` and patch any aggregation drift.

## Batch 5 — Cleanup

- Remove local skeleton/empty/error helpers superseded by shared components in the refactored pages.
- Delete unused imports surfaced by tsgo after refactors.
- Drop `src/components/portal/EmptyState.tsx` only if no portal page still imports it (keep otherwise — different API).
- Leave `src/services/api.ts` and other shared utilities alone unless a dead export is proven unused.

## Out of scope

- New tables, RLS changes, edge functions, cron, push/email/SMS — Phase 7.
- Granting `principal` / `accountant` DB roles — matrix stays inert until multi-tenant.
- Portal (parent/student/teacher) table refactors — those use card/list layouts, not `DataTable`.

## Technical details

- Sorting: tiny generic `useSort<T>(rows, key, dir)` hook inside `src/hooks/` to avoid per-page reimplementation; falls back to identity when no sort key is selected.
- Pagination: client-side slice for ≤500 rows (current dataset size); server-side range pagination is deferred to Phase 7 multi-tenant.
- Notifications: every wiring point is fire-and-forget (`void notifyX(...).catch(() => {})`) — never blocks the user action.
- No migrations. No edits to `src/integrations/supabase/client.ts` or `types.ts`.

## Estimated impact

~14 files edited, 1 hook created, 0 migrations, 0 new dependencies. Verified via tsgo + Playwright mobile screenshots on 4 representative routes.
