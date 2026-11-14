---
name: Brightline
colors:
  background: "#fbfaf7"
  foreground: "#1c1c1a"
  primary: "#1f5596"
  primary-foreground: "#ffffff"
  muted-foreground: "#66675f"
  border: "#e6e4dd"
  destructive: "#8c1d2f"
  warning: "#87510c"
  success: "#24613b"
rounded:
  lg: 8px
  tag: 6px
spacing:
  control: 32px
  control-phone: 44px
---

## Overview

Brightline is a staff app for a tutoring centre. Centre managers approve
expenses and tutors submit them, often on a phone at the front desk between
sessions. Plain words, one job per screen.

Demo data: `bun run seed:demo` loads the "Brightline Demo" centre with business
date 2026-03-14. Sign in as manager@brightline.test (manager) or
tutor@brightline.test (tutor).

## Colors

| Token | Utility | Use for | Never use for |
|---|---|---|---|
| `primary` | `bg-primary` | The one primary action per screen | Links, status |
| `warning` | `bg-warning` | Pending expenses only, until a manager acts (D2) | Errors |
| `success` | `bg-success` | Approved expenses | Saved confirmations |
| `destructive` | `bg-destructive` | Rejected expenses and amounts over ₹50,000 (D3) | Cancel buttons |

Status is always shown as text; colour only supports it.

## Typography

| Token | Utility | Use for |
|---|---|---|
| `text-base` | `text-base` | Body and form fields, 16px |
| `text-sm` | `text-sm` | Table cells and helper text, 14px |

## Layout

- Controls are 32px high on desktop and 44px on phone.
- Pages use a 1200px container on desktop and 16px gutters on phone.
- The Expenses list shows pending expenses newest first, in 56px rows, with the
  bulk-approve bar pinned to the bottom on phone (J2.S1).

## Shapes

Controls and cards use `rounded-lg` (8px). Status tags use 6px.

## Components

| Component | Code path | Use |
|---|---|---|
| Button | `src/components/ui/button.tsx` | One `default` per screen; `outline` for secondary |
| Checkbox | `src/components/ui/checkbox.tsx` | Bulk approve only; managers only (D5) |
| Badge | `src/components/ui/badge.tsx` | Status tags with text |
| Dialog | `src/components/ui/dialog.tsx` | Approve confirmation shows the selected count and total (J2.S2) |
| Input | `src/components/ui/input.tsx` | Text and amount fields with visible labels |
| Table | `src/components/ui/table.tsx` | Lists on desktop |
| Skeleton | `src/components/ui/skeleton.tsx` | Loading states in the loaded layout |

## Do's and Don'ts

- No literal values or palette classes; use tokens by name.
- One primary action per screen.
- Managers never approve their own expenses: hide the checkbox on their own rows.
- A rejection needs a reason; the Reject dialog's Confirm stays disabled until one is typed (D2).
