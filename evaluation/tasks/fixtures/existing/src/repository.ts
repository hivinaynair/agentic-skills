// Existing durable SQL adapter; the database connection is supplied at startup.
export type Sql = { query<T>(sql: string, args: unknown[]): Promise<T[]> };
export type Note = { id: string; ownerId: string; text: string };
export function noteRepository(sql: Sql) {
  return {
    list: (ownerId: string) => sql.query<Note>('SELECT id, owner_id AS "ownerId", text FROM notes WHERE owner_id = $1', [ownerId]),
    create: (ownerId: string, text: string) => sql.query<Note>('INSERT INTO notes (owner_id, text) VALUES ($1, $2) RETURNING id, owner_id AS "ownerId", text', [ownerId, text]),
  };
}
