CREATE TABLE ingredients (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id TEXT NOT NULL,
     name TEXT NOT NULL,
     quantity REAL NOT NULL,
     unit TEXT NOT NULL,
     purchase_price REAL NOT NULL,
     price_per_unit REAL NOT NULL,
     notes TEXT NOT NULL
);