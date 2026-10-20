export type Session = { userId: string } | null;
export function requireUser(session: Session) {
  if (!session) throw new Error('Unauthorized');
  return session.userId;
}
