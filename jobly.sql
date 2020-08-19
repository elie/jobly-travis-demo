\echo 'Delete and recreate jobly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly;
CREATE DATABASE jobly;
\connect jobly

CREATE TABLE companies (
  handle VARCHAR(10) PRIMARY KEY CHECK (handle = lower(handle)),
  name TEXT UNIQUE NOT NULL,
  num_employees INTEGER CHECK (num_employees >= 0),
  description TEXT NOT NULL,
  logo_url TEXT);

CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary INTEGER CHECK (salary >= 0),
  equity NUMERIC CHECK (equity <= 1.0),
  company_handle VARCHAR(10) NOT NULL
    REFERENCES companies ON DELETE CASCADE);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL
    REFERENCES users ON DELETE CASCADE,
  job_id INTEGER
    REFERENCES jobs ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('applied', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp);

INSERT INTO users(username,
                  password,
                  first_name,
                  last_name,
                  email,
                  is_admin)
  VALUES
  ('test',
   '$2b$04$eSgweZxXr79E3q26egv3mOeWTkxKOj8ga5t7aSo6qNUJzmUzjt7ia',
   'Test',
   'User',
   'test@test.com',
   FALSE);

INSERT INTO companies(handle, name, num_employees, description)
  VALUES
    ('apple', 'Apple', 10000, 'OSX'),
    ('nike', 'Nike', 2000, 'Shoes'),
    ('rithm', 'Rithm School', 10, 'Code'),
    ('starbucks', 'Starbucks', 500000, 'Coffee');

INSERT INTO jobs(title, salary, company_handle)
  VALUES
    ('Engineer', 100000, 'apple'),
    ('Plumber', 120000, 'apple'),
    ('Barista', 200000, 'starbucks');

INSERT INTO applications(username, job_id, state)
  VALUES
    ('test', 1, 'applied'),
    ('test', 2, 'rejected'),
    ('test', 3, 'applied');


\echo 'Delete and recreate jobly_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly_test;
CREATE DATABASE jobly_test;
\connect jobly_test

CREATE TABLE companies (
  handle VARCHAR(10) PRIMARY KEY CHECK (handle = lower(handle)),
  name TEXT UNIQUE NOT NULL,
  num_employees INTEGER CHECK (num_employees >= 0),
  description TEXT NOT NULL,
  logo_url TEXT);

CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary INTEGER CHECK (salary >= 0),
  equity NUMERIC CHECK (equity <= 1.0),
  company_handle VARCHAR(10) NOT NULL
    REFERENCES companies ON DELETE CASCADE);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL
    REFERENCES users ON DELETE CASCADE,
  job_id INTEGER
    REFERENCES jobs ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('applied', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp);
