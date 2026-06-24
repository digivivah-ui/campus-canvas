# Phase 6.9 — Standardization, Permissions & Automation

Scope: no new business modules. Apply shared primitives everywhere, harden permissions, upgrade dashboard, wire automated notifications.

## 1. Module Standardization

Refactor each admin page to use shared `DataTable`, `DataToolbar`, `Pagination`, `EmptyState`, `TableSkeleton`, `ErrorState`, and `exportCSV`/`exportPDF`. Add debounced search, filters, sort, page-size (10/25/50/100).

Targets (in this order):
- `AdminStudents.tsx` — search by name/admission, filter class/section/status
- `AdminStaff.tsx` — search name/email, filter role/department/status
- `AdminAttendance.tsx` — date + class filter, status filter, export day register
- `AdminFinance.tsx` — date range, payment-mode filter, CSV/PDF of collection log
- `AdminResults.tsx` — exam + class filter, search student
- `AdminCertificates.tsx` — type + date filter, search recipient
- `AdminNotifications.tsx` — audience + type filter, search title

Each becomes a thin page: `DataToolbar` on top, `DataTable` in middle, `Pagination` at bottom. Module-specific dialogs (add/edit) stay untouched.

## 2. Executive Dashboard V2

Extend `ExecutiveKPIs.tsx` with 3 more tiles (run inside the same `Promise.all`):
- New Admission Leads (this month, `admission_inquiries`)
- Upcoming Events (next 7 days, `calendar_events`)
- Pending Leave Requests (`student_leaves` + `staff_leaves` where status='pending')

Reorganize `Dashboard.tsx` into:
1. `ExecutiveKPIs` (9 tiles, responsive grid 2/3/3)
2. `DashboardWidgets` (existing)
3. Quick-links row (unchanged)

## 3. Permission Enforcement

Backend RLS stays the source of truth. UI gating layer:

- New `src/components/RequirePermission.tsx` — wraps a route, calls `can(role, action)`, redirects to role home if denied.
- New `src/hooks/useCan.ts` — `useCan(action)` returns boolean using current `useRole`.
- Extend `src/lib/permissions.ts` with the new actions used by routes (`dashboard.read`, `calendar.read`, `transport.read`, `leaves.read/write`, `inquiries.read/write`, `visitors.read/write`, `reminders.read/write`, `homework.write`, `events.write`, `gallery.write`, `homepage.write`).
- Update `App.tsx` admin routes: wrap each admin route in `RequirePermission` with the right action. Admin already has `*`.
- Update `AdminLayout.tsx` sidebar: filter menu items by `can(role, action)`. Hide groups that have zero visible items.

Role allowances (matches user spec):
- Principal: dashboard, students, staff (read), attendance (rw), results (rw), reports, certificates, notifications, calendar, leaves, inquiries, visitors. No settings/site/homepage/about/gallery.
- Accountant: dashboard, finance, defaulters, students (read), reports. No academic, no settings.
- Teacher: dashboard, teacher portal (existing).
- Parent/Student: unchanged (own portal only).

Currently only `admin` role exists in DB; principal/accountant are matrix-ready but never assigned — they remain inert until Phase 7. Document this in plan.md.

## 4. Notification Automation

Use existing `src/lib/notify.ts`. Add thin call sites at action boundaries (NOT triggers — keep client-side for now, edge functions in Phase 7):

| Event | Hook location | Audience |
|---|---|---|
| Attendance marked (per class) | `AdminAttendance` save handler | parents of section |
| Student absent | same, conditional on status='absent' | parent of student |
| Fee paid | `AdminFinance` add-payment handler | parent of student |
| Fee due (manual trigger button) | `AdminDefaulters` "Send reminders" | parents of defaulters |
| Result published | `AdminResults` publish handler | parents of class |
| Homework added | `AdminHomework` create | parents of section |
| Leave approved/rejected | `AdminLeaves` status change | requester |
| New inquiry | `AdminInquiries` create | admins |
| Transport route assigned | `AdminTransport` assignment save | parent of student |

Add helpers in `src/lib/notify.ts`: `notifyParentsOfSection(sectionId, payload)`, `notifyParentOfStudent(studentId, payload)`, `notifyAdmins(payload)` — each resolves user_ids via `students.parent_auth_user_id` / `user_roles`.

## 5. Audit & Cleanup

- Re-check refactored pages at 375px via Playwright, 1 screenshot each.
- Remove now-dead local Skeleton/Empty helpers inside refactored pages.
- Keep `src/components/portal/EmptyState.tsx` (used by parent/student portals — different API).

## Out of scope (Phase 7)
- Server-side cron notifications (fee-due reminders, calendar reminders).
- Granting principal/accountant roles in DB; UI matrix is ready but no users carry these roles yet.
- Push/email/SMS delivery.
- New tables.

## Execution order
1. Extend `permissions.ts` + add `useCan` + `RequirePermission`.
2. Wrap `App.tsx` admin routes; filter `AdminLayout` sidebar.
3. Refactor `AdminStudents` as reference; replicate to remaining 6 pages.
4. Extend `ExecutiveKPIs` + reflow `Dashboard.tsx`.
5. Add notification helpers + wire call sites.
6. Playwright pass on 375px for refactored pages.
7. Smoke-test admin/parent/student flows.

Estimated touch: ~20 files edited, ~3 created, 0 migrations.
