# Multi-Role School ERP Extension

Extend the existing admin-only ERP into a 3-role platform (admin / parent / student) with Supabase Auth, notifications, and attendance-ready schema. Admin functionality stays untouched.

## 1. Database Migration

**`students` table — add columns:**
- `parent_name`, `parent_phone`, `parent_email`, `student_login_email` (text, nullable)
- `auth_user_id`, `parent_auth_user_id` (uuid, nullable)
- `profile_image_url` (text, nullable)

**New `notifications` table:**
- `id`, `title`, `message`, `target_type` (enum: all/class/section/student)
- `class_id`, `section_id`, `student_id` (nullable uuids)
- `created_at`, `created_by`

**New `notification_reads` table** (track unread state per user):
- `id`, `notification_id`, `user_id`, `read_at`

**New `attendance` table:**
- `id`, `student_id`, `date`, `status` (present/absent/late), `remarks`, `created_at`

**`app_role` enum:** add `parent`, `student` values.

**RLS policies:**
- Students: admins manage; parents can SELECT their linked child (`parent_auth_user_id = auth.uid()`); students can SELECT own row (`auth_user_id = auth.uid()`).
- Fees/discounts/attendance: same parent/student visibility scoped by `student_id`.
- Notifications: SELECT for authenticated users where target matches their role/class/section/student id (via security-definer helper). Admins manage.
- `notification_reads`: users manage own rows.

## 2. Auth & Routing

- Reuse existing `useAuth` hook; add role detection (admin/parent/student) via `user_roles`.
- New route guards: `<RequireRole role="parent|student">`.
- New routes:
  - `/parent/login`, `/parent/dashboard`
  - `/student/login`, `/student/dashboard`
- Unauthorized → redirect to the appropriate login page.

## 3. Parent Portal (`/parent/dashboard`)

Mobile-first cards:
- Student profile (photo, name, admission no, class/section)
- Fee summary (total/paid/pending)
- Payment history (paginated)
- Receipt actions (download / print / WhatsApp) — reuse existing receipt logic
- Attendance summary (present/absent counts, % from `attendance`)
- Recent notifications with unread badges

If parent linked to multiple children → child selector tab.

## 4. Student Portal (`/student/dashboard`)

Simpler version: profile, fees, attendance, notifications.

## 5. Notifications Admin

- New page `/admin/notifications` under sidebar "Communication" group.
- Create form: title, message, target type (all/class/section/student) with dependent dropdowns.
- List with delete.
- Parent/Student dashboards show latest 10 + unread badge; clicking marks read.

## 6. Demo Data

- Create 2 demo parent auth users + link to existing students.
- Create 2 demo student auth users + link to own student rows.
- Seed 3 demo notifications (all / class / specific student).
- Provide credentials in the final message.

## 7. UI & Files

**New files:**
- `src/hooks/useRole.tsx` — resolves current user role
- `src/components/RequireRole.tsx`
- `src/pages/parent/ParentLogin.tsx`, `ParentDashboard.tsx`
- `src/pages/student/StudentLogin.tsx`, `StudentDashboard.tsx`
- `src/pages/admin/AdminNotifications.tsx`
- `src/components/portal/NotificationsList.tsx`
- `src/layouts/PortalLayout.tsx` (shared mobile-first shell for parent/student)

**Edits:**
- `src/App.tsx` — add new routes
- `src/layouts/AdminLayout.tsx` — add Notifications nav item under Communication
- `src/integrations/supabase/types.ts` — auto-regenerated after migration

## Implementation Order

1. Run DB migration (schema + RLS + enum)
2. Insert demo auth users + link rows + demo notifications
3. Build role hook, route guards
4. Build admin notifications page + sidebar entry
5. Build parent login + dashboard
6. Build student login + dashboard
7. Verify build, share demo credentials

Ready to proceed?