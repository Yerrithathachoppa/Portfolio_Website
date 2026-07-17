-- Database Schema for Portfolio Website with AI Chatbot

CREATE TABLE IF NOT EXISTS profile (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  email TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  bio TEXT,
  photo_url TEXT,
  resume_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experience (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  video_url TEXT,
  project_url TEXT,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('technical', 'tools', 'soft')),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS faq (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS certifications (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  sort_order INTEGER NOT NULL
);
