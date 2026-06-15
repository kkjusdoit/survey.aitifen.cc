CREATE TABLE IF NOT EXISTS assessment_records (
  id TEXT PRIMARY KEY,
  access_code TEXT NOT NULL UNIQUE,
  owner_label TEXT NOT NULL,
  student_name TEXT NOT NULL DEFAULT '',
  school_name TEXT NOT NULL DEFAULT '',
  grade TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  guardian_name TEXT NOT NULL DEFAULT '',
  guardian_role TEXT NOT NULL DEFAULT '',
  subject_scores_json TEXT NOT NULL DEFAULT '{}',
  score_notes TEXT NOT NULL DEFAULT '',
  profile_json TEXT NOT NULL DEFAULT '{}',
  sections_json TEXT NOT NULL DEFAULT '{}',
  completion_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assessment_records_created_at
ON assessment_records(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_records_student_name
ON assessment_records(student_name);

CREATE INDEX IF NOT EXISTS idx_assessment_records_school_name
ON assessment_records(school_name);
