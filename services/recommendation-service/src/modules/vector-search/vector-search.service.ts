import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { VectorSearchResult, SearchMetadata } from '@/types';
import { SearchDto, IndexContentDto, SimilarContentDto, StudentsAlsoTookDto } from './dto/vector-search.dto';

interface VectorMetadata {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty?: string;
  topics?: string[];
  url?: string;
}

@Injectable()
export class VectorSearchService {
  private readonly logger = new Logger(VectorSearchService.name);
  private readonly pinecone: Pinecone;
  private readonly openai: OpenAI;
  private index: any;

  // In-memory fallback storage if Pinecone is not configured
  private vectorStore = new Map<string, { embedding: number[]; metadata: VectorMetadata }>();

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('ai.openai.apiKey'),
    });

    // Initialize Pinecone if API key is available
    const pineconeApiKey = this.configService.get('ai.pinecone.apiKey');
    if (pineconeApiKey) {
      this.pinecone = new Pinecone({
        apiKey: pineconeApiKey,
      });

      this.initializePinecone();
    } else {
      this.logger.warn('Pinecone API key not configured. Using in-memory vector store.');
    }
  }

  /**
   * Phase 5.1: Initialize Pinecone index
   */
  private async initializePinecone() {
    try {
      const indexName = this.configService.get('ai.pinecone.indexName');
      this.index = this.pinecone.index(indexName);
      this.logger.log(`Connected to Pinecone index: ${indexName}`);
    } catch (error) {
      this.logger.error('Failed to initialize Pinecone:', error);
    }
  }

  /**
   * Phase 5.2: Generate embeddings using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.configService.get('ai.openai.embeddingModel') || 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  /**
   * Phase 5.3: Index content for semantic search
   */
  async indexContent(dto: IndexContentDto): Promise<{ success: boolean }> {
    this.logger.log(`Indexing content: ${dto.id}`);

    // Create combined text for embedding
    const textToEmbed = `${dto.title}\n\n${dto.description}`;
    const embedding = await this.generateEmbedding(textToEmbed);

    const metadata: VectorMetadata = {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      type: dto.type,
      difficulty: dto.difficulty,
      topics: dto.topics,
      url: dto.url,
    };

    if (this.index) {
      // Use Pinecone
      try {
        await this.index.upsert([
          {
            id: dto.id,
            values: embedding,
            metadata,
          },
        ]);
      } catch (error) {
        this.logger.error('Failed to index in Pinecone:', error);
        throw error;
      }
    } else {
      // Use in-memory store
      this.vectorStore.set(dto.id, { embedding, metadata });
    }

    return { success: true };
  }

  /**
   * Phase 5.4: Semantic search for courses and problems
   */
  async search(dto: SearchDto): Promise<VectorSearchResult[]> {
    this.logger.log(`Searching for: ${dto.query}`);

    const topK = dto.topK || 10;

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(dto.query);

    let results: VectorSearchResult[] = [];

    if (this.index) {
      // Use Pinecone
      try {
        const queryResponse = await this.index.query({
          vector: queryEmbedding,
          topK,
          includeMetadata: true,
          filter: this.buildFilter(dto),
        });

        results = queryResponse.matches.map((match: any) => ({
          id: match.id,
          score: match.score,
          metadata: match.metadata as SearchMetadata,
        }));
      } catch (error) {
        this.logger.error('Pinecone search failed:', error);
        results = await this.inMemorySearch(queryEmbedding, topK, dto);
      }
    } else {
      // Use in-memory search
      results = await this.inMemorySearch(queryEmbedding, topK, dto);
    }

    return results;
  }

  /**
   * Phase 5.5: Find similar content recommendations
   */
  async findSimilarContent(dto: SimilarContentDto): Promise<VectorSearchResult[]> {
    this.logger.log(`Finding similar content for: ${dto.contentId}`);

    const limit = dto.limit || 5;

    if (this.index) {
      // Get the vector for the content
      const fetchResponse = await this.index.fetch([dto.contentId]);
      const vector = fetchResponse.records[dto.contentId]?.values;

      if (!vector) {
        throw new Error('Content not found');
      }

      // Find similar vectors
      const queryResponse = await this.index.query({
        vector,
        topK: limit + 1, // +1 because it will include the source itself
        includeMetadata: true,
      });

      // Filter out the source content itself
      return queryResponse.matches
        .filter((match: any) => match.id !== dto.contentId)
        .slice(0, limit)
        .map((match: any) => ({
          id: match.id,
          score: match.score,
          metadata: match.metadata as SearchMetadata,
        }));
    } else {
      // In-memory implementation
      const sourceVector = this.vectorStore.get(dto.contentId);
      if (!sourceVector) {
        throw new Error('Content not found');
      }

      const similarities = Array.from(this.vectorStore.entries())
        .filter(([id]) => id !== dto.contentId)
        .map(([id, data]) => ({
          id,
          score: this.cosineSimilarity(sourceVector.embedding, data.embedding),
          metadata: data.metadata as SearchMetadata,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return similarities;
    }
  }

  /**
   * Phase 5.6: "Students also took" feature using collaborative filtering
   */
  async getStudentsAlsoTook(dto: StudentsAlsoTookDto): Promise<VectorSearchResult[]> {
    this.logger.log(`Finding courses students also took for course: ${dto.courseId}`);

    // Mock implementation - in production, use actual user enrollment data
    // This would involve:
    // 1. Get users who took this course
    // 2. Find other courses they took
    // 3. Rank by frequency and similarity

    const limit = dto.limit || 5;

    // For now, use semantic similarity as a proxy
    return this.findSimilarContent({
      contentId: dto.courseId,
      limit,
    });
  }

  /**
   * Phase 5.7: Batch index multiple content items
   */
  async batchIndexContent(items: IndexContentDto[]): Promise<{ success: boolean; indexed: number }> {
    this.logger.log(`Batch indexing ${items.length} items`);

    let indexed = 0;

    if (this.index) {
      // Batch upsert in Pinecone
      const vectors = await Promise.all(
        items.map(async (item) => {
          const textToEmbed = `${item.title}\n\n${item.description}`;
          const embedding = await this.generateEmbedding(textToEmbed);

          indexed++;

          return {
            id: item.id,
            values: embedding,
            metadata: {
              id: item.id,
              title: item.title,
              description: item.description,
              type: item.type,
              difficulty: item.difficulty,
              topics: item.topics,
              url: item.url,
            },
          };
        }),
      );

      // Upsert in batches of 100 (Pinecone limit)
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await this.index.upsert(batch);
      }
    } else {
      // In-memory batch indexing
      for (const item of items) {
        await this.indexContent(item);
        indexed++;
      }
    }

    return { success: true, indexed };
  }

  /**
   * Helper: Build Pinecone filter from search criteria
   */
  private buildFilter(dto: SearchDto): any {
    const filters: any = {};

    if (dto.difficulty && dto.difficulty.length > 0) {
      filters.difficulty = { $in: dto.difficulty };
    }

    if (dto.topics && dto.topics.length > 0) {
      filters.topics = { $in: dto.topics };
    }

    if (dto.types && dto.types.length > 0) {
      filters.type = { $in: dto.types };
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
  }

  /**
   * Helper: In-memory search using cosine similarity
   */
  private async inMemorySearch(
    queryEmbedding: number[],
    topK: number,
    dto: SearchDto,
  ): Promise<VectorSearchResult[]> {
    const results = Array.from(this.vectorStore.entries())
      .map(([id, data]) => ({
        id,
        score: this.cosineSimilarity(queryEmbedding, data.embedding),
        metadata: data.metadata as SearchMetadata,
      }))
      .filter((result: any) => {
        // Apply filters
        if (dto.difficulty && dto.difficulty.length > 0) {
          if (!dto.difficulty.includes(result.metadata.difficulty as any)) {
            return false;
          }
        }

        if (dto.topics && dto.topics.length > 0) {
          if (!result.metadata.topics?.some((t: any) => dto.topics!.includes(t))) {
            return false;
          }
        }

        if (dto.types && dto.types.length > 0) {
          if (!dto.types.includes(result.metadata.type)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  /**
   * Helper: Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    return dotProduct / (magnitudeA * magnitudeB);
  }
}
