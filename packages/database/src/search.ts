import { MeiliSearch, Index } from 'meilisearch';

// Initialize Meilisearch client
const meilisearchClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY || '',
});

// Index names
export enum SearchIndexes {
  COURSES = 'courses',
  QUESTIONS = 'questions',
  USERS = 'users',
  BOOTCAMPS = 'bootcamps',
  DSA_SHEETS = 'dsa_sheets',
}

// Type definitions for search documents
export interface CourseDocument {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  instructorId: string;
  instructorName: string;
  difficultyLevel: string;
  price: number;
  isFree: boolean;
  language: string;
  ratingAverage: number;
  enrollmentCount: number;
  skills: string[];
  thumbnailUrl: string;
  createdAt: number;
  updatedAt: number;
}

export interface QuestionDocument {
  id: string;
  title: string;
  description: string;
  questionType: string;
  difficulty: string;
  topics: string[];
  companyTags: string[];
  likesCount: number;
  createdAt: number;
}

export interface UserDocument {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  role: string;
  skills: string[];
  experienceLevel: string;
}

/**
 * Search Service for managing all search operations
 */
export class SearchService {
  private client: MeiliSearch;

  constructor() {
    this.client = meilisearchClient;
  }

  /**
   * Initialize all search indexes with settings
   */
  async initializeIndexes(): Promise<void> {
    console.log('🔍 Initializing Meilisearch indexes...');

    // Courses index
    await this.setupCoursesIndex();

    // Questions index
    await this.setupQuestionsIndex();

    // Users index
    await this.setupUsersIndex();

    // Bootcamps index
    await this.setupBootcampsIndex();

    // DSA Sheets index
    await this.setupDsaSheetsIndex();

    console.log('✅ All search indexes initialized');
  }

  /**
   * Setup courses index with searchable attributes and filters
   */
  private async setupCoursesIndex(): Promise<void> {
    const index = this.client.index(SearchIndexes.COURSES);

    await index.updateSettings({
      searchableAttributes: [
        'title',
        'description',
        'longDescription',
        'instructorName',
        'skills',
      ],
      filterableAttributes: [
        'difficultyLevel',
        'isFree',
        'price',
        'language',
        'instructorId',
        'skills',
        'ratingAverage',
      ],
      sortableAttributes: [
        'createdAt',
        'updatedAt',
        'ratingAverage',
        'enrollmentCount',
        'price',
      ],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
        'enrollmentCount:desc',
        'ratingAverage:desc',
      ],
      stopWords: ['the', 'a', 'an'],
      synonyms: {
        javascript: ['js', 'ecmascript'],
        typescript: ['ts'],
        python: ['py'],
        kubernetes: ['k8s'],
      },
    });

    console.log('✅ Courses index configured');
  }

  /**
   * Setup questions index
   */
  private async setupQuestionsIndex(): Promise<void> {
    const index = this.client.index(SearchIndexes.QUESTIONS);

    await index.updateSettings({
      searchableAttributes: ['title', 'description', 'topics', 'companyTags'],
      filterableAttributes: [
        'difficulty',
        'questionType',
        'topics',
        'companyTags',
      ],
      sortableAttributes: ['createdAt', 'likesCount'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
        'likesCount:desc',
      ],
    });

    console.log('✅ Questions index configured');
  }

  /**
   * Setup users index
   */
  private async setupUsersIndex(): Promise<void> {
    const index = this.client.index(SearchIndexes.USERS);

    await index.updateSettings({
      searchableAttributes: ['username', 'fullName', 'bio', 'skills'],
      filterableAttributes: ['role', 'experienceLevel', 'skills'],
      sortableAttributes: [],
    });

    console.log('✅ Users index configured');
  }

  /**
   * Setup bootcamps index
   */
  private async setupBootcampsIndex(): Promise<void> {
    const index = this.client.index(SearchIndexes.BOOTCAMPS);

    await index.updateSettings({
      searchableAttributes: ['title', 'description'],
      filterableAttributes: ['difficultyLevel', 'price', 'instructorId'],
      sortableAttributes: ['createdAt', 'price'],
    });

    console.log('✅ Bootcamps index configured');
  }

  /**
   * Setup DSA sheets index
   */
  private async setupDsaSheetsIndex(): Promise<void> {
    const index = this.client.index(SearchIndexes.DSA_SHEETS);

    await index.updateSettings({
      searchableAttributes: ['title', 'description'],
      filterableAttributes: ['isOfficial', 'isPublic'],
      sortableAttributes: ['createdAt', 'totalProblems'],
    });

    console.log('✅ DSA Sheets index configured');
  }

  /**
   * Index a course
   */
  async indexCourse(course: CourseDocument): Promise<void> {
    const index = this.client.index(SearchIndexes.COURSES);
    await index.addDocuments([course]);
  }

  /**
   * Index multiple courses
   */
  async indexCourses(courses: CourseDocument[]): Promise<void> {
    const index = this.client.index(SearchIndexes.COURSES);
    await index.addDocuments(courses);
  }

  /**
   * Search courses
   */
  async searchCourses(
    query: string,
    filters?: {
      difficultyLevel?: string[];
      isFree?: boolean;
      minPrice?: number;
      maxPrice?: number;
      skills?: string[];
      minRating?: number;
    },
    options?: {
      limit?: number;
      offset?: number;
      sort?: string[];
    }
  ) {
    const index = this.client.index(SearchIndexes.COURSES);

    // Build filter string
    const filterParts: string[] = [];

    if (filters) {
      if (filters.difficultyLevel && filters.difficultyLevel.length > 0) {
        filterParts.push(
          `difficultyLevel IN [${filters.difficultyLevel.map((d) => `"${d}"`).join(', ')}]`
        );
      }

      if (filters.isFree !== undefined) {
        filterParts.push(`isFree = ${filters.isFree}`);
      }

      if (filters.minPrice !== undefined) {
        filterParts.push(`price >= ${filters.minPrice}`);
      }

      if (filters.maxPrice !== undefined) {
        filterParts.push(`price <= ${filters.maxPrice}`);
      }

      if (filters.skills && filters.skills.length > 0) {
        filterParts.push(
          `skills IN [${filters.skills.map((s) => `"${s}"`).join(', ')}]`
        );
      }

      if (filters.minRating !== undefined) {
        filterParts.push(`ratingAverage >= ${filters.minRating}`);
      }
    }

    const searchOptions: any = {
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    };

    if (filterParts.length > 0) {
      searchOptions.filter = filterParts.join(' AND ');
    }

    if (options?.sort && options.sort.length > 0) {
      searchOptions.sort = options.sort;
    }

    return index.search(query, searchOptions);
  }

  /**
   * Search questions
   */
  async searchQuestions(
    query: string,
    filters?: {
      difficulty?: string[];
      questionType?: string[];
      topics?: string[];
      companyTags?: string[];
    },
    options?: {
      limit?: number;
      offset?: number;
    }
  ) {
    const index = this.client.index(SearchIndexes.QUESTIONS);

    const filterParts: string[] = [];

    if (filters) {
      if (filters.difficulty && filters.difficulty.length > 0) {
        filterParts.push(
          `difficulty IN [${filters.difficulty.map((d) => `"${d}"`).join(', ')}]`
        );
      }

      if (filters.questionType && filters.questionType.length > 0) {
        filterParts.push(
          `questionType IN [${filters.questionType.map((t) => `"${t}"`).join(', ')}]`
        );
      }

      if (filters.topics && filters.topics.length > 0) {
        filterParts.push(
          `topics IN [${filters.topics.map((t) => `"${t}"`).join(', ')}]`
        );
      }

      if (filters.companyTags && filters.companyTags.length > 0) {
        filterParts.push(
          `companyTags IN [${filters.companyTags.map((c) => `"${c}"`).join(', ')}]`
        );
      }
    }

    const searchOptions: any = {
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    };

    if (filterParts.length > 0) {
      searchOptions.filter = filterParts.join(' AND ');
    }

    return index.search(query, searchOptions);
  }

  /**
   * Delete a document from an index
   */
  async deleteDocument(indexName: SearchIndexes, documentId: string): Promise<void> {
    const index = this.client.index(indexName);
    await index.deleteDocument(documentId);
  }

  /**
   * Update a document in an index
   */
  async updateDocument(
    indexName: SearchIndexes,
    document: any
  ): Promise<void> {
    const index = this.client.index(indexName);
    await index.updateDocuments([document]);
  }

  /**
   * Get index statistics
   */
  async getIndexStats(indexName: SearchIndexes) {
    const index = this.client.index(indexName);
    return index.getStats();
  }

  /**
   * Clear all documents from an index
   */
  async clearIndex(indexName: SearchIndexes): Promise<void> {
    const index = this.client.index(indexName);
    await index.deleteAllDocuments();
  }
}

// Singleton instance
export const searchService = new SearchService();

/**
 * Helper function to sync database to search index
 */
export async function syncDatabaseToSearch(prisma: any): Promise<void> {
  console.log('🔄 Syncing database to Meilisearch...');

  // Sync courses
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: { include: { profile: true } },
      courseSkills: { include: { skill: true } },
    },
  });

  const courseDocs: CourseDocument[] = courses.map((course: any) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description || '',
    longDescription: course.longDescription || '',
    instructorId: course.instructorId,
    instructorName: course.instructor.profile?.fullName || course.instructor.username,
    difficultyLevel: course.difficultyLevel || '',
    price: parseFloat(course.price.toString()),
    isFree: course.isFree,
    language: course.language,
    ratingAverage: parseFloat(course.ratingAverage.toString()),
    enrollmentCount: course.enrollmentCount,
    skills: course.courseSkills.map((cs: any) => cs.skill.name),
    thumbnailUrl: course.thumbnailUrl || '',
    createdAt: course.createdAt.getTime(),
    updatedAt: course.updatedAt.getTime(),
  }));

  await searchService.indexCourses(courseDocs);
  console.log(`✅ Synced ${courseDocs.length} courses`);

  // Sync questions
  const questions = await prisma.question.findMany({
    where: { isPublic: true },
  });

  const questionDocs: QuestionDocument[] = questions.map((q: any) => ({
    id: q.id,
    title: q.title,
    description: q.description || '',
    questionType: q.questionType,
    difficulty: q.difficulty || '',
    topics: Array.isArray(q.topics) ? q.topics : [],
    companyTags: Array.isArray(q.companyTags) ? q.companyTags : [],
    likesCount: q.likesCount,
    createdAt: q.createdAt.getTime(),
  }));

  const questionsIndex = meilisearchClient.index(SearchIndexes.QUESTIONS);
  await questionsIndex.addDocuments(questionDocs);
  console.log(`✅ Synced ${questionDocs.length} questions`);

  console.log('✅ Database sync to Meilisearch completed');
}

export default searchService;
