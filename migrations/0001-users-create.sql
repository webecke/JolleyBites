CREATE TABLE users (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     hashed_password TEXT NOT NULL,
     created_at TEXT NOT NULL,
     password_changed_at TEXT NOT NULL,
     last_login TEXT NOT NULL
);