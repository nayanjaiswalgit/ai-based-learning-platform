#!/bin/bash

# Redis Cluster Setup Script
# Creates a 6-node cluster (3 masters + 3 slaves)

set -e

echo "🚀 Setting up Redis Cluster..."

# Create directories for each node
for port in 7001 7002 7003 7004 7005 7006; do
  mkdir -p redis-cluster/$port/data
  mkdir -p redis-cluster/$port/logs
done

# Generate redis.conf for each node
for port in 7001 7002 7003 7004 7005 7006; do
  cat > redis-cluster/$port/redis.conf <<EOF
port $port
cluster-enabled yes
cluster-config-file nodes-$port.conf
cluster-node-timeout 5000
appendonly yes
dir /data
logfile /logs/redis-$port.log

# Security
requirepass your-redis-password
masterauth your-redis-password

# Performance tuning
maxmemory 2gb
maxmemory-policy allkeys-lru
tcp-backlog 511
timeout 0
tcp-keepalive 300

# Persistence
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump-$port.rdb

# Replication
repl-diskless-sync no
repl-diskless-sync-delay 5
EOF
done

echo "✅ Configuration files created"
echo "📦 Starting Redis nodes..."

# Start each Redis node
for port in 7001 7002 7003 7004 7005 7006; do
  docker run -d \
    --name redis-$port \
    --net redis-cluster-net \
    -p $port:$port \
    -v $(pwd)/redis-cluster/$port/data:/data \
    -v $(pwd)/redis-cluster/$port/logs:/logs \
    -v $(pwd)/redis-cluster/$port/redis.conf:/usr/local/etc/redis/redis.conf \
    redis:7.4 redis-server /usr/local/etc/redis/redis.conf

  echo "✅ Started Redis node on port $port"
done

echo "⏳ Waiting for Redis nodes to be ready..."
sleep 10

echo "🔗 Creating Redis Cluster..."

# Create cluster (3 masters, 3 replicas)
docker exec -it redis-7001 redis-cli --cluster create \
  127.0.0.1:7001 \
  127.0.0.1:7002 \
  127.0.0.1:7003 \
  127.0.0.1:7004 \
  127.0.0.1:7005 \
  127.0.0.1:7006 \
  --cluster-replicas 1 \
  --cluster-yes

echo "✅ Redis Cluster created successfully!"
echo "🔍 Cluster info:"

docker exec -it redis-7001 redis-cli -p 7001 cluster info
docker exec -it redis-7001 redis-cli -p 7001 cluster nodes

echo "🎉 Redis Cluster setup complete!"
echo ""
echo "📝 Connection details:"
echo "  Nodes: localhost:7001,localhost:7002,localhost:7003,localhost:7004,localhost:7005,localhost:7006"
echo "  Password: your-redis-password"
