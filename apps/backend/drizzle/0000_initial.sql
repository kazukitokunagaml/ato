-- Migration: Initial schema with RLS
-- Description: Create tables for users, projects, file_tree_docs, file_content_docs with RLS policies

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "google_id" text NOT NULL UNIQUE,
  "email" text NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create file_tree_docs table
CREATE TABLE IF NOT EXISTS "file_tree_docs" (
  "project_id" uuid PRIMARY KEY REFERENCES "projects"("id") ON DELETE CASCADE,
  "doc" bytea NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create file_content_docs table
CREATE TABLE IF NOT EXISTS "file_content_docs" (
  "file_id" uuid PRIMARY KEY,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "doc" bytea NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create index for file_content_docs on project_id
CREATE INDEX IF NOT EXISTS "file_content_docs_project_id_idx" ON "file_content_docs"("project_id");

-- Create index for projects on owner_id
CREATE INDEX IF NOT EXISTS "projects_owner_id_idx" ON "projects"("owner_id");

-- Enable Row Level Security
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "file_tree_docs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "file_content_docs" ENABLE ROW LEVEL SECURITY;

-- Create function to get current user id from session variable
CREATE OR REPLACE FUNCTION current_user_id() RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for projects
CREATE POLICY "projects_select_policy" ON "projects"
  FOR SELECT USING (owner_id = current_user_id());

CREATE POLICY "projects_insert_policy" ON "projects"
  FOR INSERT WITH CHECK (owner_id = current_user_id());

CREATE POLICY "projects_update_policy" ON "projects"
  FOR UPDATE USING (owner_id = current_user_id());

CREATE POLICY "projects_delete_policy" ON "projects"
  FOR DELETE USING (owner_id = current_user_id());

-- RLS Policies for file_tree_docs
CREATE POLICY "file_tree_docs_select_policy" ON "file_tree_docs"
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = current_user_id())
  );

CREATE POLICY "file_tree_docs_insert_policy" ON "file_tree_docs"
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE owner_id = current_user_id())
  );

CREATE POLICY "file_tree_docs_update_policy" ON "file_tree_docs"
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = current_user_id())
  );

CREATE POLICY "file_tree_docs_delete_policy" ON "file_tree_docs"
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = current_user_id())
  );

-- RLS Policies for file_content_docs
CREATE POLICY "file_content_docs_select_policy" ON "file_content_docs"
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = current_user_id())
  );

CREATE POLICY "file_content_docs_insert_policy" ON "file_content_docs"
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE owner_id = current_user_id())
  );

CREATE POLICY "file_content_docs_update_policy" ON "file_content_docs"
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = current_user_id())
  );

CREATE POLICY "file_content_docs_delete_policy" ON "file_content_docs"
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = current_user_id())
  );
