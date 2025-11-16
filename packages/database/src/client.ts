import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Read Replica Connection Pool
class ReadReplicaPool {
  private readReplicas: PrismaClient[] = [];
  private currentIndex = 0;

  constructor() {
    const readReplicaUrls = [
      process.env.DATABASE_READ_REPLICA_1,
      process.env.DATABASE_READ_REPLICA_2,
      process.env.DATABASE_READ_REPLICA_3,
      process.env.DATABASE_READ_REPLICA_4,
      process.env.DATABASE_READ_REPLICA_5,
    ].filter(Boolean) as string[];

    this.readReplicas = readReplicaUrls.map(
      (url) =>
        new PrismaClient({
          datasources: { db: { url } },
          log: ['error'],
        })
    );
  }

  // Round-robin load balancing across read replicas
  getReadClient(): PrismaClient {
    if (this.readReplicas.length === 0) {
      return prisma; // Fallback to primary if no replicas configured
    }

    const client = this.readReplicas[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.readReplicas.length;
    return client;
  }

  async disconnect() {
    await Promise.all(this.readReplicas.map((client) => client.$disconnect()));
  }
}

export const readReplicaPool = new ReadReplicaPool();

// Helper function to get appropriate client for query type
export function getDbClient(readOnly: boolean = false): PrismaClient {
  return readOnly ? readReplicaPool.getReadClient() : prisma;
}

// Graceful shutdown
async function gracefulShutdown() {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
  await readReplicaPool.disconnect();
  console.log('Database connections closed');
  process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default prisma;
