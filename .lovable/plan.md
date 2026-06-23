## Phase 6.8 — ERP Hardening & Polish

Goal: make the existing ERP feel production-ready without adding new business modules. The strategy is **build reusable primitives once, then roll them out** to the highest-traffic admin tables. A full app-wide sweep of every single page is out of scope for one phase — I'll cover the modules the brief explicitly calls out and leave the rest on the same primitives so a follow-up pass is mechanical.

### 1. Shared primitives (new files under `src/components/shared/`)

- `DataToolbar.tsx` — debounced search input + slot for filters + slot for export button. Sticky variant.
- `Pagination.tsx` — page controls, page-size selector (10/25/50/100), "Showing X–Y of N".
- `DataTable.tsx` — thin wrapper around shadcn `Table` that takes `columns`, `rows`, `loading`, `empty`, `sort`, integrates toolbar + pagination.
- `EmptyState.tsx` — promote the existing portal EmptyState to a shared one with optional action button.
- `TableSkeleton.tsx` — row skeletons matching column count.
- `ErrorState.tsx` — friendly error card with retry.
- `useDebouncedValue.ts` — 250 ms debounce hook.
- `usePagedQuery.ts` — small helper around React Query that returns `{rows,total,page,setPage,pageSize,setPageSize,loading,error}`.
- `lib/export.ts` — `exportCSV(filename, rows, columns)` and `exportPDF(filename, title, rows, columns)` using the existing `jspdf` already installed. One entry point used everywhere.
- `lib/permissions.ts` — `can(role, action)` matrix covering admin / principal / accountant / teacher / parent / student. Wire `RequireRole` to accept multiple roles and add a `<Can action="...">` component. No UI removal yet — just the foundation, since the brief says "no major UI changes required yet".
- `lib/errors.ts` — `toFriendlyError(e)` mapping Supabase/Postgrest codes to human strings, used by a shared `handleError(e)` that toasts.

### 2. Rollout (apply primitives to these admin pages)

Each gets: search + filter bar + pagination + export + empty state + skeleton + friendly errors.

- `AdminStudents.tsx`
- `AdminStaff.tsx`
- `AdminAttendance.tsx` (keep existing analytics; replace ad-hoc list with `DataTable`)
- `AdminFinance.tsx` (collections tab + expenses tab)
- `AdminResults.tsx`
- `AdminInquiries.tsx`
- `AdminVisitors.tsx`
- `AdminCertificates.tsx` (history table)
- `AdminNotifications.tsx`

Other admin pages (Notices, Homework, Calendar, Leaves, Reminders, Transport, ID Cards, Members, Faculty, Departments, Events, Gallery, Messages, Programs, Announcements, Settings, etc.) are **not refactored this phase** — they keep working as-is. They can adopt the primitives later by swapping in `<DataTable>`.

### 3. Executive dashboard

Replace `src/pages/admin/Dashboard.tsx` cards with a denser exec view:
- KPIs: Total Students, Total Staff, Today's Attendance %, Fees Collected (this month), Pending Fees, Active Transport Users.
- Existing `DashboardWidgets` (events / pending leaves / follow-ups / reminders) stays below.
- Single parallel `Promise.all` fetch; React Query with `staleTime: 60s` to avoid refetch storms.

### 4. Notification engine cleanup

Add `src/lib/notify.ts` with one `notify({type, title, body, audience, link})` helper that writes to the existing `notifications` table. Existing modules keep their own tables (notices/homework/announcements) — this is just one outbound channel so future alerts (fee due, result published, attendance absent) go through one function. No mass rewrite; document the pattern and use it in 1–2 spots (fee creation, result publish) as a reference.

### 5. Mobile + form polish (scoped)

- Audit only the refactored pages above on a 375 px viewport via Playwright screenshots. Fix overflow with `overflow-x-auto` on table wrappers and stack toolbar items on `sm:`.
- Add a tiny `FormField` wrapper that standardizes label + input + error spacing; apply in the inquiry/visitor/leave create dialogs as the reference. No global form rewrite.

### 6. Out of scope (explicit)

- New tables or migrations (none needed).
- Hiding/removing features for non-admin roles — permission *matrix* only, no UI gating yet.
- Refactoring every page in the app — only the modules listed in §2.
- i18n, theming, accessibility audit beyond keyboard focus.
- Push / email / SMS delivery for notifications.

### 7. Order of execution

1. Add shared primitives + lib helpers.
2. Refactor `AdminStudents` end-to-end as the reference implementation.
3. Apply same pattern to the other 8 pages in §2.
4. Replace exec dashboard.
5. Playwright pass at 375 px + 1280 px on refactored pages; fix overflow.
6. Smoke check: build clean, key pages load, exports download, pagination works.

### Technical notes

- Pagination uses Supabase `.range(from, to)` + `{count: 'exact'}` head request once per query change, reusing the existing `supabase` client. Reads stay client-side (no edge functions).
- Debounce is local state, not URL; keeps things simple. No router changes.
- Exports run client-side from the currently loaded page + an "Export all" that re-queries without `range`.
- Permission matrix is data only this phase: `lib/permissions.ts` exports `PERMISSIONS: Record<Role, Action[]>`. No routes change.

Once approved I'll execute steps 1–6 in order and report back with a short verification summary.