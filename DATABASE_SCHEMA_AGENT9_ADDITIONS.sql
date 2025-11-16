-- =====================================================
-- Agent 9: Bootcamp & Cohort Additional Tables
-- Missing tables for complete bootcamp functionality
-- =====================================================

-- =====================================================
-- BOOTCAMP APPLICATIONS & SCREENING
-- =====================================================

CREATE TABLE bootcamp_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bootcamp_id UUID NOT NULL REFERENCES bootcamps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_status VARCHAR(20) DEFAULT 'pending' CHECK (application_status IN ('pending', 'under_review', 'accepted', 'rejected', 'waitlisted')),
    motivation_letter TEXT,
    resume_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    screening_score DECIMAL(5, 2), -- If screening quiz is required
    interview_notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    UNIQUE(bootcamp_id, user_id)
);

CREATE TABLE bootcamp_screening_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bootcamp_id UUID NOT NULL REFERENCES bootcamps(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) CHECK (question_type IN ('text', 'mcq', 'coding', 'file_upload')),
    options JSONB, -- For MCQ questions
    correct_answer TEXT, -- For MCQ questions
    is_required BOOLEAN DEFAULT TRUE,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE application_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES bootcamp_applications(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES bootcamp_screening_questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    file_url TEXT, -- For file upload questions
    is_correct BOOLEAN, -- Auto-graded for MCQ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ASSIGNMENTS & PROJECTS
-- =====================================================

CREATE TABLE cohort_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assignment_type VARCHAR(20) CHECK (assignment_type IN ('individual', 'group', 'project')),
    instructions TEXT,
    resources JSONB, -- Links to resources, starter files, etc.
    max_points INTEGER DEFAULT 100,
    due_date TIMESTAMP NOT NULL,
    allow_late_submission BOOLEAN DEFAULT FALSE,
    late_penalty_percent INTEGER DEFAULT 20,
    peer_review_required BOOLEAN DEFAULT FALSE,
    min_peer_reviews INTEGER DEFAULT 2,
    auto_grading BOOLEAN DEFAULT FALSE,
    test_cases JSONB, -- For auto-graded coding assignments
    rubric JSONB, -- Grading rubric
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES cohort_assignments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_url TEXT, -- GitHub repo, Google Drive, etc.
    submission_text TEXT,
    files JSONB, -- Array of file URLs
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN DEFAULT FALSE,
    grade DECIMAL(5, 2),
    feedback TEXT,
    graded_at TIMESTAMP,
    graded_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'graded', 'resubmit')),
    UNIQUE(assignment_id, user_id)
);

CREATE TABLE peer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    rubric_scores JSONB, -- Scores for each rubric criterion
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_helpful BOOLEAN, -- Reviewed by instructor
    UNIQUE(submission_id, reviewer_id)
);

CREATE TABLE project_showcases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_title VARCHAR(255) NOT NULL,
    description TEXT,
    demo_url TEXT,
    github_url TEXT,
    video_url TEXT,
    tech_stack JSONB, -- Array of technologies used
    screenshots JSONB, -- Array of screenshot URLs
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 1:1 MEETINGS & MENTORSHIP
-- =====================================================

CREATE TABLE mentor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE one_on_one_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES users(id),
    student_id UUID NOT NULL REFERENCES users(id),
    cohort_id UUID REFERENCES cohorts(id),
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    meeting_link TEXT,
    meeting_provider VARCHAR(20) CHECK (meeting_provider IN ('zoom', 'google_meet', 'teams', 'other')),
    meeting_id VARCHAR(255), -- Provider-specific meeting ID
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    agenda TEXT,
    student_notes TEXT, -- Student's notes/questions before meeting
    mentor_notes TEXT, -- Mentor's notes after meeting
    recording_url TEXT,
    calendar_event_id TEXT, -- Google Calendar or Outlook event ID
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meeting_action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES one_on_one_meetings(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CERTIFICATES
-- =====================================================

CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bootcamp_id UUID REFERENCES bootcamps(id), -- NULL for global templates
    template_type VARCHAR(20) CHECK (template_type IN ('bootcamp_completion', 'course_completion', 'achievement')),
    design_config JSONB NOT NULL, -- Layout, colors, fonts, logo positions, etc.
    background_image_url TEXT,
    signature_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES certificate_templates(id),
    certificate_type VARCHAR(20) CHECK (certificate_type IN ('bootcamp', 'course', 'achievement')),
    resource_id UUID, -- Bootcamp ID, Course ID, or Achievement ID
    certificate_number VARCHAR(100) UNIQUE NOT NULL, -- Unique certificate number for verification
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE, -- Optional, for time-limited certificates
    recipient_name VARCHAR(255) NOT NULL,
    certificate_title VARCHAR(255) NOT NULL, -- e.g., "Full Stack Web Development Bootcamp"
    description TEXT,
    pdf_url TEXT NOT NULL,
    verification_url TEXT, -- Public URL to verify certificate
    blockchain_hash TEXT, -- Optional: NFT or blockchain verification
    linkedin_share_url TEXT,
    metadata JSONB, -- Additional data (grades, completion date, etc.)
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP,
    revoked_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COHORT ANNOUNCEMENTS & CHAT
-- =====================================================

CREATE TABLE cohort_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    announcement_type VARCHAR(20) CHECK (announcement_type IN ('general', 'urgent', 'assignment', 'session', 'resource')),
    created_by UUID NOT NULL REFERENCES users(id),
    is_pinned BOOLEAN DEFAULT FALSE,
    send_email BOOLEAN DEFAULT TRUE,
    send_notification BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cohort_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    parent_message_id UUID REFERENCES cohort_messages(id), -- For threaded replies
    attachments JSONB, -- Array of file URLs
    reactions JSONB DEFAULT '{}', -- { "👍": [user_id1, user_id2], "❤️": [user_id3] }
    is_pinned BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP, -- Soft delete
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_bootcamp_applications_user ON bootcamp_applications(user_id);
CREATE INDEX idx_bootcamp_applications_bootcamp ON bootcamp_applications(bootcamp_id);
CREATE INDEX idx_bootcamp_applications_status ON bootcamp_applications(application_status);

CREATE INDEX idx_cohort_assignments_cohort ON cohort_assignments(cohort_id);
CREATE INDEX idx_cohort_assignments_due_date ON cohort_assignments(due_date);

CREATE INDEX idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_user ON assignment_submissions(user_id);
CREATE INDEX idx_assignment_submissions_status ON assignment_submissions(status);

CREATE INDEX idx_peer_reviews_submission ON peer_reviews(submission_id);
CREATE INDEX idx_peer_reviews_reviewer ON peer_reviews(reviewer_id);

CREATE INDEX idx_one_on_one_meetings_mentor ON one_on_one_meetings(mentor_id);
CREATE INDEX idx_one_on_one_meetings_student ON one_on_one_meetings(student_id);
CREATE INDEX idx_one_on_one_meetings_scheduled ON one_on_one_meetings(scheduled_at);
CREATE INDEX idx_one_on_one_meetings_status ON one_on_one_meetings(status);

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_type_resource ON certificates(certificate_type, resource_id);

CREATE INDEX idx_cohort_announcements_cohort ON cohort_announcements(cohort_id);
CREATE INDEX idx_cohort_announcements_created ON cohort_announcements(created_at DESC);

CREATE INDEX idx_cohort_messages_cohort ON cohort_messages(cohort_id);
CREATE INDEX idx_cohort_messages_sender ON cohort_messages(sender_id);
CREATE INDEX idx_cohort_messages_created ON cohort_messages(created_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cohort_assignments_updated_at BEFORE UPDATE ON cohort_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at BEFORE UPDATE ON assignment_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_one_on_one_meetings_updated_at BEFORE UPDATE ON one_on_one_meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificate_templates_updated_at BEFORE UPDATE ON certificate_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment enrollment count on cohort
CREATE OR REPLACE FUNCTION increment_cohort_enrollment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE cohorts
    SET current_enrollment = current_enrollment + 1
    WHERE id = NEW.cohort_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_enrollment_on_accept AFTER INSERT ON cohort_enrollments
    FOR EACH ROW WHEN (NEW.enrollment_status = 'active')
    EXECUTE FUNCTION increment_cohort_enrollment();

-- Generate unique certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.certificate_number := 'CERT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12));
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_cert_number_trigger BEFORE INSERT ON certificates
    FOR EACH ROW WHEN (NEW.certificate_number IS NULL)
    EXECUTE FUNCTION generate_certificate_number();
