-- CreateTable
CREATE TABLE "course_generation_sessions" (
    "id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generating',
    "generated_content" JSONB NOT NULL,
    "refinement_history" JSONB,
    "published_course_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_generation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_generation_sessions_published_course_id_key" ON "course_generation_sessions"("published_course_id");

-- CreateIndex
CREATE INDEX "course_generation_sessions_instructor_id_idx" ON "course_generation_sessions"("instructor_id");

-- CreateIndex
CREATE INDEX "course_generation_sessions_status_idx" ON "course_generation_sessions"("status");

-- AddForeignKey
ALTER TABLE "course_generation_sessions" ADD CONSTRAINT "course_generation_sessions_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_generation_sessions" ADD CONSTRAINT "course_generation_sessions_published_course_id_fkey" FOREIGN KEY ("published_course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
