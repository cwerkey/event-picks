
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT
);

CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id),
  name TEXT
);

CREATE TABLE picks (
  id SERIAL PRIMARY KEY,
  user_id INT,
  category_id INT,
  option_id INT
);

CREATE TABLE results (
  category_id INT PRIMARY KEY,
  correct_option_id INT
);

CREATE TABLE settings (
  id INT PRIMARY KEY DEFAULT 1,
  event_start TIMESTAMP,
  locked BOOLEAN DEFAULT FALSE,
  submissions_open BOOLEAN DEFAULT TRUE
);

INSERT INTO settings (id) VALUES (1);
