import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

// Index name
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'learning-platform';

// Vector dimensions (for OpenAI text-embedding-3-small)
const VECTOR_DIMENSION = 1536;

/**
 * Vector metadata types
 */
export interface CourseVectorMetadata {
  type: 'course';
  courseId: string;
  title: string;
  description: string;
  instructorId: string;
  skills: string[];
  difficultyLevel: string;
  price: number;
}

export interface QuestionVectorMetadata {
  type: 'question';
  questionId: string;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  companyTags: string[];
}

export interface LessonVectorMetadata {
  type: 'lesson';
  lessonId: string;
  courseId: string;
  title: string;
  contentType: string;
}

export type VectorMetadata =
  | CourseVectorMetadata
  | QuestionVectorMetadata
  | LessonVectorMetadata;

/**
 * Vector Search Service for AI-powered recommendations
 */
export class VectorSearchService {
  private pinecone: Pinecone;
  private indexName: string;

  constructor() {
    this.pinecone = pinecone;
    this.indexName = INDEX_NAME;
  }

  /**
   * Initialize Pinecone index
   */
  async initializeIndex(): Promise<void> {
    try {
      // Check if index exists
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.indexes?.some((idx) => idx.name === this.indexName);

      if (!indexExists) {
        console.log(`Creating Pinecone index: ${this.indexName}...`);

        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: VECTOR_DIMENSION,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1',
            },
          },
        });

        console.log('✅ Pinecone index created');
      } else {
        console.log('✅ Pinecone index already exists');
      }
    } catch (error) {
      console.error('Error initializing Pinecone index:', error);
      throw error;
    }
  }

  /**
   * Upsert vectors to Pinecone
   */
  async upsertVectors(
    vectors: Array<{
      id: string;
      values: number[];
      metadata: VectorMetadata;
    }>
  ): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);
      await index.upsert(vectors);
    } catch (error) {
      console.error('Error upserting vectors:', error);
      throw error;
    }
  }

  /**
   * Search for similar courses based on vector similarity
   */
  async findSimilarCourses(
    queryVector: number[],
    filters?: {
      difficultyLevel?: string;
      maxPrice?: number;
    },
    topK: number = 10
  ): Promise<any> {
    try {
      const index = this.pinecone.index(this.indexName);

      const queryFilter: any = { type: { $eq: 'course' } };

      if (filters) {
        if (filters.difficultyLevel) {
          queryFilter.difficultyLevel = { $eq: filters.difficultyLevel };
        }

        if (filters.maxPrice !== undefined) {
          queryFilter.price = { $lte: filters.maxPrice };
        }
      }

      const results = await index.query({
        vector: queryVector,
        topK,
        filter: queryFilter,
        includeMetadata: true,
      });

      return results.matches;
    } catch (error) {
      console.error('Error finding similar courses:', error);
      throw error;
    }
  }

  /**
   * Search for similar questions
   */
  async findSimilarQuestions(
    queryVector: number[],
    filters?: {
      difficulty?: string;
      topics?: string[];
    },
    topK: number = 10
  ): Promise<any> {
    try {
      const index = this.pinecone.index(this.indexName);

      const queryFilter: any = { type: { $eq: 'question' } };

      if (filters) {
        if (filters.difficulty) {
          queryFilter.difficulty = { $eq: filters.difficulty };
        }

        if (filters.topics && filters.topics.length > 0) {
          queryFilter.topics = { $in: filters.topics };
        }
      }

      const results = await index.query({
        vector: queryVector,
        topK,
        filter: queryFilter,
        includeMetadata: true,
      });

      return results.matches;
    } catch (error) {
      console.error('Error finding similar questions:', error);
      throw error;
    }
  }

  /**
   * Get personalized course recommendations based on user's learning history
   */
  async getPersonalizedRecommendations(
    userInterestVector: number[],
    userId: string,
    limit: number = 10
  ): Promise<any> {
    try {
      const index = this.pinecone.index(this.indexName);

      // Query for similar courses
      const results = await index.query({
        vector: userInterestVector,
        topK: limit * 2, // Fetch more to filter out enrolled courses
        filter: { type: { $eq: 'course' } },
        includeMetadata: true,
      });

      // Filter out courses the user is already enrolled in
      // (You would need to fetch user enrollments from database)
      // For now, return all results
      return results.matches.slice(0, limit);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      throw error;
    }
  }

  /**
   * Delete vectors by IDs
   */
  async deleteVectors(ids: string[]): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);
      await index.deleteMany(ids);
    } catch (error) {
      console.error('Error deleting vectors:', error);
      throw error;
    }
  }

  /**
   * Delete all vectors matching a filter
   */
  async deleteByFilter(filter: Record<string, any>): Promise<void> {
    try {
      const index = this.pinecone.index(this.indexName);
      await index.deleteMany(filter);
    } catch (error) {
      console.error('Error deleting vectors by filter:', error);
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<any> {
    try {
      const index = this.pinecone.index(this.indexName);
      return await index.describeIndexStats();
    } catch (error) {
      console.error('Error getting index stats:', error);
      throw error;
    }
  }

  /**
   * Fetch vectors by IDs
   */
  async fetchVectors(ids: string[]): Promise<any> {
    try {
      const index = this.pinecone.index(this.indexName);
      return await index.fetch(ids);
    } catch (error) {
      console.error('Error fetching vectors:', error);
      throw error;
    }
  }
}

// Singleton instance
export const vectorSearchService = new VectorSearchService();

/**
 * Helper function to generate embeddings using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // This would use OpenAI's embedding API
  // Placeholder implementation
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Sync courses to vector database
 */
export async function syncCoursesToVectorDB(courses: any[]): Promise<void> {
  console.log('🔄 Syncing courses to Pinecone...');

  const vectors = await Promise.all(
    courses.map(async (course) => {
      const text = `${course.title} ${course.description} ${course.longDescription}`;
      const embedding = await generateEmbedding(text);

      return {
        id: `course_${course.id}`,
        values: embedding,
        metadata: {
          type: 'course',
          courseId: course.id,
          title: course.title,
          description: course.description,
          instructorId: course.instructorId,
          skills: course.courseSkills?.map((cs: any) => cs.skill.name) || [],
          difficultyLevel: course.difficultyLevel,
          price: parseFloat(course.price.toString()),
        } as CourseVectorMetadata,
      };
    })
  );

  // Batch upsert (max 100 vectors per batch)
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await vectorSearchService.upsertVectors(batch);
  }

  console.log(`✅ Synced ${vectors.length} courses to Pinecone`);
}

/**
 * Sync questions to vector database
 */
export async function syncQuestionsToVectorDB(questions: any[]): Promise<void> {
  console.log('🔄 Syncing questions to Pinecone...');

  const vectors = await Promise.all(
    questions.map(async (question) => {
      const text = `${question.title} ${question.description}`;
      const embedding = await generateEmbedding(text);

      return {
        id: `question_${question.id}`,
        values: embedding,
        metadata: {
          type: 'question',
          questionId: question.id,
          title: question.title,
          description: question.description || '',
          difficulty: question.difficulty,
          topics: Array.isArray(question.topics) ? question.topics : [],
          companyTags: Array.isArray(question.companyTags) ? question.companyTags : [],
        } as QuestionVectorMetadata,
      };
    })
  );

  // Batch upsert
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await vectorSearchService.upsertVectors(batch);
  }

  console.log(`✅ Synced ${vectors.length} questions to Pinecone`);
}

export default vectorSearchService;
