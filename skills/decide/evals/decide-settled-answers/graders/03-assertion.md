---
type: llm
focus:
  source: file
  path: docs/decisions.md
weight: 1
---

Each Q line asks for one choice. Fail only when a question needs two separate answers, such as "how is a card refund issued, and what happens while it is unconfirmed?". A question naming several actions that share one answer, such as which studios staff can book, see and cancel at, is one choice.
