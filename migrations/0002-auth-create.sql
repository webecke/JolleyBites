CREATE TABLE auth (
      token_value TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      issued_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_auth_user_id ON auth(user_id);
CREATE INDEX idx_auth_last_used ON auth(last_used);