import { z } from 'zod';

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export const CourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  instructorId: z.string().uuid(),
  difficulty: z.nativeEnum(DifficultyLevel),
  price: z.number().optional(),
  published: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Course = z.infer<typeof CourseSchema>;
