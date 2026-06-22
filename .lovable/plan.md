# Phase 6.5 — School Operations Automation + Attendance Enhancements

## Scope
Five new operational modules + a full upgrade of the Attendance experience across admin, parent, and student portals. Built on top of existing classes/sections/students/staff with RLS. No existing module is broken.

## 1. Database (single migration)

New tables, all with admin full-CRUD; portal-scoped reads where relevant:

- `student_leaves` — student_id, from_date, to_date, reason, status (pending/approved/rejected), reviewed_by, reviewed_at
- `staff_leaves` — staff_id, leave_type (casual/sick/earned/unpaid), from_date, to_date, reason, status, reviewed_by, reviewed_at
- `calendar_events` — title, description, event_type (holiday/exam/event/meeting/vacation), start_date, end_date, class_id (nullable = school-wide), is_public
- `admission_inquiries` — student_name, parent_name, phone, email, interested_class, source, notes, status (new/contacted/follow_up/interested/admitted/closed), next_follow_up_date
- `visitors` — visitor_name, phone, purpose, student_id (nullable), entry_time, exit_time, remarks
- `reminders` — title, description, category (fee/admission/staff_doc/transport/exam/general), due_date, priority (low/med/high), status (pending/completed), created_by

RLS: admin full access, parents/students read public `calendar_events` and own `student_leaves`. Seed: a few holidays, sample inquiries, reminders, visitor logs.

## 2. Admin Pages (under "School ERP" group in sidebar)

- `/admin/leaves` — tabs: Student | Staff. Approve / Reject actions, filter by status, history table.
- `/admin/calendar` — monthly grid + event list. Create/edit/delete events with type color-coding.
- `/admin/inquiries` — searchable, paginated table with status pipeline view; quick status change; follow-up dates.
- `/admin/visitors` — daily log with check-out action, search, date range filter, pagination.
- `/admin/reminders` — list grouped by Overdue / Today / Upcoming / Completed.

## 3. Attendance Enhancements

Refactor `AdminAttendance.tsx` to add a sticky filter bar (Month / Year / Class / Section) and 5 summary cards (Present, Absent, Leave, Half Day, %), plus an analytics block (Working Days, Days Present/Absent/Leave, %) that recomputes from the filtered range. Previous/Next month chevrons keep the React Query cache; no reload.

`AttendanceCalendar` already supports month navigation — extend to accept controlled `cursor` so the filter bar drives it.

Parent (`ParentAttendance.tsx`) and Student (`StudentAttendance.tsx`) gain the same Month / Year selector and summary cards (reusing `AttendanceSummary`).

## 4. Dashboard Widgets

Add to `AdminDashboard`:
- Upcoming Events (next 5 from `calendar_events`)
- Pending Leave Requests (count + link)
- Pending Admission Follow-ups (due today/overdue from `admission_inquiries.next_follow_up_date`)
- Upcoming Reminders (next 5 pending)

Add to Parent/Student dashboards: Upcoming Events strip pulled from public `calendar_events`.

## 5. Routing & Sidebar

`App.tsx` — add 5 admin routes. `AdminLayout` — add "Leave Management", "Calendar", "Admissions", "Visitors", "Reminders" inside the existing School ERP group, each with a Lucide icon.

## 6. Components / Utilities

- `src/components/admin/calendar/MonthGrid.tsx` — reusable monthly calendar with event chips
- `src/components/portal/AttendanceFilterBar.tsx` — Month / Year (/ Class / Section) selectors
- `src/components/portal/AttendanceAnalytics.tsx` — Working Days / Present / Absent / Leave / %
- `src/components/dashboard/UpcomingEventsWidget.tsx`, `PendingRemindersWidget.tsx`, `PendingLeavesWidget.tsx`, `FollowUpsWidget.tsx`

## Out of scope
Email/SMS dispatch, ICS export, recurring events, leave balance accounting, visitor QR/photo, push notifications.

## Execution order
Migration → types regen → shared components → admin pages → sidebar/routes → attendance refactor → portal updates → dashboard widgets → smoke check.
