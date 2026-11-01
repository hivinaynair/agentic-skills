# Coin display tasks

Source: [journeys](../journeys/coin-display.md), approved by D4 0c466edc · Target: local

| ID | Outcome | Needs | Parallel | Status |
|---|---|---|---|---|
| T1 | Coin amounts read naturally | — | Start now | Todo |

## T1 Format coin amounts
Covers: J1.
Change: `src/format.ts` exports `formatCoins(amount: number): string`.
Verify: `bun test src` (0 skipped).
Tests:
- src/format.test.ts (new)
  - J1.S1.c1: large amounts get thousands separators
  - J1.S1.c2: one coin is singular, any other amount plural
