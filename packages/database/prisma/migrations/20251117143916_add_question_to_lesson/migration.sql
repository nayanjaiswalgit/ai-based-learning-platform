-- AlterTable
ALTER TABLE "lessons" ADD COLUMN "question_id" TEXT;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
