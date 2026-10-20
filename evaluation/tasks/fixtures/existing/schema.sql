CREATE TABLE notes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id text NOT NULL, text text NOT NULL);
