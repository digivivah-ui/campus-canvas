## Phase 6 — Transport + ID Cards + Certificates

Three new admin modules grouped under the existing **School ERP** sidebar, plus a Transport card in the Parent Portal. No changes to admin/auth/finance core behavior.

---

### 1. Database (single migration)

New tables in `public` (each with GRANT, RLS, admin-full + scoped reads):

- **transport_routes** — `route_name, route_number (unique), pickup_points (jsonb array of {name, time}), monthly_fee, is_active`
- **transport_vehicles** — `vehicle_number (unique), vehicle_type, capacity, route_id, is_active`
- **transport_drivers** — `name, phone, license_number, vehicle_id, is_active`
- **student_transport** — `student_id (unique), route_id, pickup_point, transport_fee, is_active`
- **certificates** — `certificate_type (enum: bonafide, leaving, character), student_id, certificate_number (auto), data (jsonb snapshot), issued_on, issued_by, remarks`

Enums: `certificate_type`.

RLS:
- Admin full CRUD on all five.
- Parents/students: SELECT own `student_transport` (via `current_student_ids()`) and own `certificates`.
- Read-only SELECT for `authenticated` on routes/vehicles/drivers (needed to render dropdowns and parent transport card).

Seed: 3 routes, 3 vehicles, 3 drivers, transport assignments for ~5 demo students, 2 sample certificates.

---

### 2. Admin pages (new, under School ERP group)

- `/admin/transport` — tabbed page (Routes / Vehicles / Drivers / Student Assignments). Search + filter + pagination on each tab. Mobile cards on small screens, table on desktop.
- `/admin/id-cards` — student/staff toggle, search & class filter, multi-select, "Generate PDF" (single or bulk) using `jspdf` + `html2canvas`. Pulls school name/logo/address from `site_settings`.
- `/admin/certificates` — left: pick certificate type + student + extra fields (reason, conduct, leaving date); right: live preview. Buttons: Save & Generate PDF, Print. History table below with re-download.

Sidebar additions in `AdminLayout` School ERP group: Transport, ID Cards, Certificates (lucide icons: `Bus`, `IdCard`, `FileCheck`).

---

### 3. Parent portal integration

- Add Transport card to `ParentDashboard` (route name, pickup point, monthly fee) when assignment exists.
- Add `/parent/transport` route (simple summary, fee, contact driver) — optional minimal page accessible from dashboard card.
- Add Certificates list in parent dashboard (download issued PDFs).

No changes to Student portal navigation (out of scope per spec).

---

### 4. Shared components

- `src/components/admin/transport/RoutesTab.tsx`, `VehiclesTab.tsx`, `DriversTab.tsx`, `AssignmentsTab.tsx`
- `src/components/admin/idcards/StudentIdCard.tsx`, `StaffIdCard.tsx` (printable A7-ish card UI using school branding)
- `src/components/admin/certificates/CertificateTemplate.tsx` (renders Bonafide/Leaving/Character with school header, body, signature line)
- `src/lib/pdf.ts` — wrapper around `jspdf` + `html2canvas` for "render DOM node → PDF" (used by both ID cards bulk-print and certificates).

Dependencies to add: `jspdf`, `html2canvas`, `qrcode.react`.

---

### 5. Routing & types

- `App.tsx`: 4 new admin routes + 1 parent route.
- `AdminLayout.tsx`: 3 new sidebar items.
- After migration runs, `integrations/supabase/types.ts` auto-regenerates.

---

### 6. Out of scope (explicit)

- Live GPS / vehicle tracking
- Real QR signing (placeholder QR only)
- Digital signature uploads (placeholder line)
- WhatsApp/SMS dispatch of certificates
- Editable certificate templates UI (templates are code-defined; only data is dynamic)

---

### Order of execution

1. Migration (schema + RLS + seed) — awaits approval.
2. Install `jspdf`, `html2canvas`, `qrcode.react`.
3. Build shared components + `pdf.ts`.
4. Admin pages (Transport → ID Cards → Certificates).
5. Sidebar + route wiring.
6. Parent dashboard transport/certificate cards.
7. Smoke check.
