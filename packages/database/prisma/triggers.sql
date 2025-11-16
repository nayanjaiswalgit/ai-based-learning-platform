-- =====================================================
-- Database Triggers and Functions
-- AI-Based Learning Platform
-- =====================================================

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_providers_updated_at
    BEFORE UPDATE ON oauth_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_skills_updated_at
    BEFORE UPDATE ON user_skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
    BEFORE UPDATE ON course_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_reviews_updated_at
    BEFORE UPDATE ON course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bootcamps_updated_at
    BEFORE UPDATE ON bootcamps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cohorts_updated_at
    BEFORE UPDATE ON cohorts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dsa_sheets_updated_at
    BEFORE UPDATE ON dsa_sheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at
    BEFORE UPDATE ON roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_streaks_updated_at
    BEFORE UPDATE ON learning_streaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_threads_updated_at
    BEFORE UPDATE ON discussion_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at
    BEFORE UPDATE ON discussion_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Update course enrollment count
-- =====================================================

CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses
    SET enrollment_count = (
        SELECT COUNT(*)
        FROM course_enrollments
        WHERE course_id = NEW.course_id
    )
    WHERE id = NEW.course_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enrollment_count
    AFTER INSERT ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_enrollment_count();

-- =====================================================
-- FUNCTION: Update course rating
-- =====================================================

CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses
    SET
        rating_average = (
            SELECT COALESCE(AVG(rating), 0)
            FROM course_reviews
            WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM course_reviews
            WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        )
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_rating_on_insert
    AFTER INSERT ON course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_course_rating();

CREATE TRIGGER update_course_rating_on_update
    AFTER UPDATE ON course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_course_rating();

CREATE TRIGGER update_course_rating_on_delete
    AFTER DELETE ON course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_course_rating();

-- =====================================================
-- FUNCTION: Update cohort enrollment count
-- =====================================================

CREATE OR REPLACE FUNCTION update_cohort_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE cohorts
    SET current_enrollment = (
        SELECT COUNT(*)
        FROM cohort_enrollments
        WHERE cohort_id = NEW.cohort_id
        AND enrollment_status IN ('pending', 'active')
    )
    WHERE id = NEW.cohort_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cohort_enrollment_on_insert
    AFTER INSERT ON cohort_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_cohort_enrollment_count();

CREATE TRIGGER update_cohort_enrollment_on_update
    AFTER UPDATE ON cohort_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_cohort_enrollment_count();

-- =====================================================
-- FUNCTION: Update discussion thread replies count
-- =====================================================

CREATE OR REPLACE FUNCTION update_thread_replies_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussion_threads
    SET replies_count = (
        SELECT COUNT(*)
        FROM discussion_replies
        WHERE thread_id = NEW.thread_id
    )
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_replies_on_insert
    AFTER INSERT ON discussion_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_replies_count();

CREATE TRIGGER update_thread_replies_on_delete
    AFTER DELETE ON discussion_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_replies_count();

-- =====================================================
-- FUNCTION: Update learning streak
-- =====================================================

CREATE OR REPLACE FUNCTION update_learning_streak(user_uuid UUID, activity_date DATE)
RETURNS VOID AS $$
DECLARE
    current_record RECORD;
    days_diff INTEGER;
BEGIN
    -- Get current streak record
    SELECT * INTO current_record
    FROM learning_streaks
    WHERE user_id = user_uuid;

    IF current_record IS NULL THEN
        -- Create new streak record
        INSERT INTO learning_streaks (
            user_id,
            current_streak_days,
            longest_streak_days,
            last_activity_date,
            total_active_days
        ) VALUES (
            user_uuid,
            1,
            1,
            activity_date,
            1
        );
    ELSE
        -- Calculate days difference
        days_diff := activity_date - current_record.last_activity_date;

        IF days_diff = 0 THEN
            -- Same day, no update needed
            RETURN;
        ELSIF days_diff = 1 THEN
            -- Consecutive day, increment streak
            UPDATE learning_streaks
            SET
                current_streak_days = current_record.current_streak_days + 1,
                longest_streak_days = GREATEST(current_record.longest_streak_days, current_record.current_streak_days + 1),
                last_activity_date = activity_date,
                total_active_days = current_record.total_active_days + 1
            WHERE user_id = user_uuid;
        ELSE
            -- Streak broken, reset
            UPDATE learning_streaks
            SET
                current_streak_days = 1,
                last_activity_date = activity_date,
                total_active_days = current_record.total_active_days + 1
            WHERE user_id = user_uuid;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Calculate user progress percentage for course
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_course_progress(user_uuid UUID, course_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress DECIMAL;
BEGIN
    -- Count total lessons in course
    SELECT COUNT(*) INTO total_lessons
    FROM lessons l
    INNER JOIN course_modules cm ON l.module_id = cm.id
    WHERE cm.course_id = course_uuid;

    IF total_lessons = 0 THEN
        RETURN 0;
    END IF;

    -- Count completed lessons
    SELECT COUNT(*) INTO completed_lessons
    FROM user_progress up
    INNER JOIN lessons l ON up.resource_id = l.id
    INNER JOIN course_modules cm ON l.module_id = cm.id
    WHERE up.user_id = user_uuid
    AND up.resource_type = 'lesson'
    AND cm.course_id = course_uuid
    AND up.completed_at IS NOT NULL;

    progress := (completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100;

    RETURN ROUND(progress, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get user skill proficiency
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_skill_proficiency(user_uuid UUID, skill_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_questions INTEGER;
    solved_questions INTEGER;
    proficiency INTEGER;
BEGIN
    -- This is a simplified proficiency calculation
    -- In production, you'd want more complex logic

    -- Count total questions for this skill (through courses)
    SELECT COUNT(DISTINCT q.id) INTO total_questions
    FROM questions q
    WHERE q.topics::jsonb ? (SELECT name FROM skills WHERE id = skill_uuid);

    IF total_questions = 0 THEN
        RETURN 0;
    END IF;

    -- Count solved questions
    SELECT COUNT(DISTINCT us.question_id) INTO solved_questions
    FROM user_submissions us
    INNER JOIN questions q ON us.question_id = q.id
    WHERE us.user_id = user_uuid
    AND us.status = 'accepted'
    AND q.topics::jsonb ? (SELECT name FROM skills WHERE id = skill_uuid);

    proficiency := LEAST(100, (solved_questions::DECIMAL / total_questions::DECIMAL) * 100);

    RETURN proficiency;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- END OF TRIGGERS AND FUNCTIONS
-- =====================================================
