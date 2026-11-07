# Expenses

## J1 Submit an expense (tutor)
1. **J1.S1 Fill the expense** — Expenses › New; sees amount, category, receipt
   - J1.S1.c1 When amount is outside ₹1–₹50,000: the form shows "Enter between ₹1 and ₹50,000".
   - J1.S1.c2 When the receipt upload fails: the form keeps amount and category and offers retry.
2. **J1.S2 Submitted** — Expenses; sees the expense as Pending

## J2 Approve expenses (manager)
1. **J2.S1 Review pending** — Expenses; sees pending expenses, newest first
   - J2.S1.c1 When there are no pending expenses: the list says "Nothing to approve".
   - J2.S1.c2 While the list loads: a skeleton with the list's layout shows.
2. **J2.S2 Approve selected** — Expenses › Approve; confirms the selected count and total
   - J2.S2.c1 When approved: each expense shows Approved, the approver and the time.
3. **J2.S3 Reject** — Expenses › Reject; must give a reason
