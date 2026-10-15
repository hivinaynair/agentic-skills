# Synthetic non-payment trial input

This is a constructed owner scenario, not actual user-approved product policy or an
existing production application's verified behavior. An independent agent received
the two skills and this brief without parent conclusions or expected output.

Existing behavior supplied: any signed-in member can issue invitations to a document
workspace. New accepted requirements in this scenario, dated 2026-10-15:

- Only current workspace admins may create or revoke invites.
- Invited addresses must match the authenticated verified email at acceptance.
- Invites expire 48 hours after creation; revoked/expired invites cannot grant membership.
- Existing members accepting a valid invite receive already-member without a duplicate.
- Repeat acceptance by the same recipient returns already-member.
- Creation returns a shareable link. Email delivery is excluded.
- Acceptance atomically creates at most one membership per workspace/account.
- Check admin permission at creation/revocation time. Later creator demotion does not
  revoke previously created invites.

Task: plan this feature using decide and journeys. No application code. Preserve
unknown policies as questions and report usability findings. The brief intentionally
does not provide a complete application design.
