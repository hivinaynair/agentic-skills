# Brightline Tutors design system

Staff app for a tutoring centre. Centre managers and tutors use it between
sessions, often on a phone at the front desk. Plain words, one job per screen.

- Tokens live in `src/app/globals.css`; use them by name, never literal values.
- Devices: Desktop 1440 wide, Phone 390 wide. Every screen ships on both.
- Controls: 32px high on desktop, 44px on phone, 8px radius. Status tags 6px radius.
- Components: `src/components/ui/` (Button, Checkbox, Badge, Dialog, Input, Table, Skeleton).
- Demo data: `bun run seed:demo` loads the "Brightline Demo" centre with business date 2026-03-14.
  Sign in as manager@brightline.test (manager) or tutor@brightline.test (tutor).
