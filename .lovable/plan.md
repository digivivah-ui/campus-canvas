# Phase 5 — Staff & Teacher Management System

Goal: introduce real staff/teacher entities, a dedicated **Teacher Portal**, scoped permissions, staff attendance, and salary linkage — without breaking Admin / Parent / Student apps.

---

## 1. Database (single migration)

New enum + tables (all in `public`, with `GRANT` + RLS + policies):

- `staff_type` enum: `teaching`, `non_teaching`
- `staff_role` enum: `teacher`, `principal`, `coordinator`, `accountant`, `clerk`, `receptionist`, `librarian`, `other`

Tables:

- **staff**
  - `full_name, staff_code (unique), staff_type, role, qualification, experience_years, email, phone, address, joining_date, status (active/inactive), photo_url`
  - `auth_user_id uuid` (nullable) — links to `auth.users` when staff has a login
- **teacher_assignments**
  - `staff_id, class_id, section_id (nullable), subject_id (nullable), is_class_teacher bool`
  - unique `(staff_id, class_id, section_id, subject_id)`
- **staff_attendance**
  - `staff_id, date, status (present/absent/leave/half_day), remarks, marked_by`
  - unique `(staff_id, date)`
- **salary_structures**
  - `staff_id, basic, hra, allowances, deductions, effective_from`
- Extend existing `salaries`:
  - add `staff_id uuid references staff(id)` (nullable for back-compat)

New role:
- `app_role` enum: add `'teacher'`
- `has_teacher_access(_uid)` security-definer helper
- `current_teacher_id()` returns staff.id for the logged-in teacher
- `current_teacher_class_ids() / section_ids() / subject_ids()` from assignments

RLS:
- Admin full CRUD on all new tables.
- Teachers: read own assignments, own staff record, read students in assigned class/section, write attendance/marks/homework/notices scoped to their assignments.
- Students/parents: no access to staff tables.
- Extend `attendance`, `marks`, `homework`, `notices` policies so teachers can write rows scoped to their assigned class/section.

Seed:
- 6 demo staff (mix of teachers + non-teaching).
- A few teacher_assignments across existing classes.
- One demo teacher login: `teacher@mgcm.ac.in` / `teacher` (created via existing admin login pattern, or noted for manual creation through admin UI).

---

## 2. Admin ERP — new pages

Add to `AdminLayout` sidebar under a "Staff" group:

- `/admin/staff` — Staff directory (table: filter by type/role/status, add/edit/delete, link to auth user).
- `/admin/staff/:id` — Staff detail (profile, assignments, attendance, salary history).
- `/admin/teacher-assignments` — Assign teacher → class/section/subject (matrix-style).
- `/admin/staff-attendance` — Date picker, mark all staff, summary cards, monthly grid, CSV export.
- Update `/admin/finance` Salaries tab → select **Staff Member** dropdown (replaces free-text employee name); keep legacy rows readable.

---

## 3. Teacher Portal (new isolated app)

Mirrors Parent/Student portal architecture — clean, focused, no ERP density.

Routes (all behind `RequireRole role="teacher"`):

- `/teacher/login` — dedicated login.
- `/teacher/dashboard` — today's classes, quick stats (my classes, students, pending tasks), shortcuts.
- `/teacher/classes` — list of assigned class/section/subject cards.
- `/teacher/attendance` — pick class/section → mark today's student attendance.
- `/teacher/marks` — pick exam + subject → bulk enter marks (only for assigned subjects).
- `/teacher/homework` — create/list homework for assigned class/section/subject.
- `/teacher/notices` — create class/section notices.
- `/teacher/profile` — own staff profile + own attendance history.

Layout: new `TeacherShell.tsx` (top bar + bottom nav, distinct accent color from parent/student to feel separate). No finance, no analytics, no student PII beyond assigned classes.

Update `useRole`, `roleRoutes.ts`, `RequireRole` to support `'teacher'`.

---

## 4. Components (reused/new)

Reuse: `AttendanceCalendar`, `EmptyState`, `PortalSkeleton`.
New:
- `TeacherShell.tsx`
- `components/teacher/AssignmentCard.tsx`
- `components/teacher/MarkAttendanceTable.tsx` (student roster checkbox grid)
- `components/teacher/MarksEntryTable.tsx`
- `components/staff/StaffForm.tsx`, `StaffTable.tsx`, `AssignmentMatrix.tsx`

---

## 5. Out of scope (explicit)

- Teacher self-signup (admin creates teacher accounts).
- WhatsApp / push notifications.
- Substitute teacher / timetable / period scheduling.
- Leave application workflow (only manual mark on staff attendance).

---

## 6. Order of execution

1. Migration (schema + RLS + seed).
2. `useRole` / `RequireRole` / `roleRoutes` updates for `teacher`.
3. Admin Staff + Assignments + Staff Attendance pages.
4. Finance salary → staff linkage.
5. TeacherShell + Teacher portal pages.
6. App.tsx route wiring + AdminLayout sidebar entries.
7. Smoke check (login flow, RLS, no regressions in Parent/Student).

Ready to start with the migration on approval.
