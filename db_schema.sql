-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('company', 'student');

CREATE TYPE task_difficulty AS ENUM ('easy', 'medium', 'hard');

CREATE TYPE task_status AS ENUM (
    'open',
    'assigned',
    'in_progress',
    'submitted',
    'completed',
    'closed',
    'cancelled'
);

CREATE TYPE task_type AS ENUM ('ui', 'api', 'data', 'component', 'script', 'poc');

CREATE TYPE proposal_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TYPE review_status AS ENUM ('approved', 'changes_requested', 'rejected');

CREATE TYPE asset_type AS ENUM ('csv', 'json', 'script', 'component', 'readme', 'figma_link', 'api_spec');

CREATE TYPE verification_status AS ENUM ('unverified', 'verified');


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_updated_at TIMESTAMPTZ DEFAULT NOW(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- COMPANIES
-- ============================================================

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    website TEXT,
    description TEXT,
    verification_status verification_status DEFAULT 'unverified',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- STUDENTS
-- ============================================================

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bio TEXT,
    github_url TEXT,
    university TEXT,
    graduation_year INTEGER,
    verification_status verification_status DEFAULT 'unverified',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TASKS
-- ============================================================

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty task_difficulty NOT NULL,
    estimated_hours INTEGER,
    status task_status DEFAULT 'open',
    task_type task_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- TASK ASSETS
-- ============================================================

CREATE TABLE task_assets (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    file_type asset_type NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- AI FILE ANALYSIS
-- ============================================================

CREATE TABLE ai_file_analysis (
    id SERIAL PRIMARY KEY,
    task_asset_id INTEGER UNIQUE NOT NULL REFERENCES task_assets(id) ON DELETE CASCADE,
    detected_type TEXT NOT NULL,
    recommended_filename TEXT NOT NULL,
    recommended_folder TEXT NOT NULL,
    confidence_score FLOAT,
    analysis_json JSONB,
    risk_level TEXT,              -- NEW
    security_status TEXT,         -- NEW
    findings JSONB,               -- NEW
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- PROPOSALS
-- ============================================================

CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    estimated_hours INTEGER,
    status proposal_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (task_id, student_id)   -- PREVENT DUPLICATE PROPOSALS
);


-- ============================================================
-- ASSIGNMENTS
-- ============================================================

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER UNIQUE NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    deadline TIMESTAMPTZ
);


-- ============================================================
-- SANDBOXES
-- ============================================================

CREATE TABLE sandboxes (
    id SERIAL PRIMARY KEY,
    task_id INTEGER UNIQUE NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    zip_path TEXT NOT NULL,
    template_used TEXT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- SUBMISSIONS
-- ============================================================

CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submission_zip_path TEXT NOT NULL,
    github_url TEXT,
    notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER UNIQUE NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    status review_status NOT NULL,
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- RATINGS
-- ============================================================

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER UNIQUE NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
