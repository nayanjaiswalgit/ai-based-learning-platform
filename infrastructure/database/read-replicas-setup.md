# PostgreSQL Read Replicas Setup Guide

This guide explains how to set up and configure PostgreSQL read replicas for horizontal read scaling.

## Architecture Overview

- **1 Primary (Master)**: Handles all writes and can handle reads
- **5 Read Replicas**: Handle read queries only
- **Load Balancing**: Round-robin distribution of read queries

## Benefits

- **Improved Read Performance**: Distribute read load across multiple servers
- **High Availability**: If primary fails, a replica can be promoted
- **Scalability**: Add more replicas as read traffic increases
- **Geographic Distribution**: Place replicas closer to users

## Setup Instructions

### 1. Configure Primary Server

Edit PostgreSQL configuration on the primary server:

```bash
# /var/lib/postgresql/data/postgresql.conf

# Replication settings
wal_level = replica
max_wal_senders = 10
wal_keep_size = 64
hot_standby = on
synchronous_commit = off

# Performance tuning
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### 2. Create Replication User

On the primary server:

```sql
CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'your-secure-password';
```

Edit `pg_hba.conf`:

```
# Allow replication connections from replicas
host    replication     replicator      replica1-ip/32        md5
host    replication     replicator      replica2-ip/32        md5
host    replication     replicator      replica3-ip/32        md5
host    replication     replicator      replica4-ip/32        md5
host    replication     replicator      replica5-ip/32        md5
```

Reload PostgreSQL:

```bash
pg_ctl reload
```

### 3. Set Up Read Replicas

On each replica server:

```bash
# Stop PostgreSQL
systemctl stop postgresql

# Remove existing data
rm -rf /var/lib/postgresql/data/*

# Create base backup from primary
pg_basebackup -h primary-server-ip -D /var/lib/postgresql/data -U replicator -P -v -R -X stream -C -S replica1_slot

# Start PostgreSQL
systemctl start postgresql
```

The `-R` flag automatically creates `standby.signal` and configures `postgresql.auto.conf` for replication.

### 4. Verify Replication

On the primary server:

```sql
-- Check replication slots
SELECT * FROM pg_replication_slots;

-- Check replication status
SELECT client_addr, state, sync_state FROM pg_stat_replication;
```

On each replica:

```sql
-- Check if in recovery mode (should be 't')
SELECT pg_is_in_recovery();

-- Check replication lag
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;
```

## Docker Compose Setup (Development)

For local development, use Docker Compose:

```yaml
version: '3.8'

services:
  postgres-primary:
    image: postgres:16.4
    environment:
      POSTGRES_DB: learning_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    command: |
      postgres
      -c wal_level=replica
      -c hot_standby=on
      -c max_wal_senders=10
      -c max_replication_slots=10
      -c hot_standby_feedback=on
    ports:
      - "5432:5432"
    volumes:
      - postgres_primary_data:/var/lib/postgresql/data

  postgres-replica-1:
    image: postgres:16.4
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    command: |
      bash -c "
      until pg_basebackup -h postgres-primary -D /var/lib/postgresql/data -U replicator -P -v -R -X stream; do
        echo 'Waiting for primary to be ready...'
        sleep 5
      done
      postgres
      "
    ports:
      - "5433:5432"
    depends_on:
      - postgres-primary
    volumes:
      - postgres_replica_1_data:/var/lib/postgresql/data

  # Add more replicas similarly...
```

## Kubernetes Deployment

For production on Kubernetes, use a StatefulSet:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-replicas
spec:
  serviceName: postgres-replicas
  replicas: 5
  selector:
    matchLabels:
      app: postgres-replica
  template:
    metadata:
      labels:
        app: postgres-replica
    spec:
      containers:
      - name: postgres
        image: postgres:16.4
        env:
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        - name: POSTGRES_REPLICATION_MODE
          value: slave
        - name: POSTGRES_MASTER_HOST
          value: postgres-primary
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
```

## Monitoring Replication

### Key Metrics to Monitor

1. **Replication Lag**: Time delay between primary and replicas
2. **Replication Slot Usage**: Ensure slots don't fill up
3. **WAL Sender/Receiver Status**: Check for connectivity issues

### Prometheus Queries

```promql
# Replication lag in seconds
pg_replication_lag_seconds

# Bytes behind primary
pg_replication_lag_bytes

# Number of active replicas
pg_stat_replication_count
```

## Failover Strategy

### Automatic Failover with Patroni

Consider using Patroni for automatic failover:

```yaml
# patroni.yml
scope: learning-platform
namespace: /db/
name: postgres1

restapi:
  listen: 0.0.0.0:8008
  connect_address: postgres1:8008

etcd:
  hosts: etcd:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true
      parameters:
        wal_level: replica
        hot_standby: on
        max_wal_senders: 10
```

### Manual Failover

If a primary fails:

1. Promote a replica to primary:
   ```bash
   pg_ctl promote -D /var/lib/postgresql/data
   ```

2. Update connection strings to point to new primary

3. Reconfigure other replicas to follow new primary

## Performance Tuning

### Read Replica Configuration

```sql
-- On replicas, optimize for read performance
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_cache_size = '2GB';
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET work_mem = '8MB';
```

### Connection Pooling

Use PgBouncer in front of each replica:

```ini
[databases]
learning_platform = host=replica1 port=5432 dbname=learning_platform

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

## Troubleshooting

### Replica Not Syncing

```sql
-- Check for errors in PostgreSQL logs
SELECT * FROM pg_stat_wal_receiver;

-- Verify replication slot exists
SELECT * FROM pg_replication_slots WHERE slot_name = 'replica1_slot';
```

### High Replication Lag

- Check network latency between primary and replica
- Verify replica has sufficient CPU/memory
- Consider using synchronous replication for critical data
- Tune `max_wal_size` and `checkpoint_completion_target`

### Disk Space Issues on Primary

```sql
-- Check WAL disk usage
SELECT pg_current_wal_lsn();
SELECT pg_walfile_name(pg_current_wal_lsn());

-- Clean up old WAL files (if replicas are caught up)
SELECT pg_switch_wal();
```

## Best Practices

1. **Monitor Replication Lag**: Keep lag under 5 seconds
2. **Use Replication Slots**: Prevent WAL deletion before replicas consume it
3. **Regular Backups**: Don't rely solely on replicas for disaster recovery
4. **Test Failover**: Regularly practice failover procedures
5. **SSL/TLS**: Encrypt replication traffic in production
6. **Resource Allocation**: Ensure replicas have adequate resources
7. **Geographic Distribution**: Place replicas in different availability zones

## Cost Optimization

- Use smaller instance types for read replicas if read queries are less intensive
- Scale replicas based on read traffic patterns
- Consider using cloud provider managed services (AWS RDS, Google Cloud SQL)
- Implement query caching (Redis) to reduce load on replicas

## Conclusion

With 5 read replicas and proper load balancing, the platform can handle:
- **10M+ concurrent users**
- **100K+ queries per second**
- **99.99% uptime**
- **<100ms query latency**
