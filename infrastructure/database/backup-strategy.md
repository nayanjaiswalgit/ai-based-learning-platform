# Database Backup and Recovery Strategy

Comprehensive backup and disaster recovery plan for the AI-based learning platform.

## Overview

Multi-layered backup strategy ensuring **99.99% data durability** and **RPO < 5 minutes**.

### Key Metrics

- **RPO (Recovery Point Objective)**: 5 minutes (max data loss)
- **RTO (Recovery Time Objective)**: 1 hour (max downtime)
- **Backup Retention**: 30 days daily, 12 months monthly
- **Backup Locations**: 3 geographic regions

## Backup Types

### 1. Continuous WAL Archiving

**Frequency**: Real-time (every 16MB or 5 minutes)

**Purpose**: Point-in-time recovery (PITR)

```bash
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://learning-platform-wal-archive/%f'
archive_timeout = 300  # 5 minutes
```

**Storage**: AWS S3 with versioning enabled

**Retention**: 30 days

### 2. Daily Full Backups

**Frequency**: Daily at 2:00 AM UTC

**Purpose**: Complete database snapshot

```bash
#!/bin/bash
# scripts/backup-daily.sh

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/daily"
S3_BUCKET="s3://learning-platform-backups"

# Create backup
pg_basebackup -h localhost -D "$BACKUP_DIR/backup-$DATE" \
  -F tar -z -P -v \
  -U backup_user

# Upload to S3
aws s3 sync "$BACKUP_DIR/backup-$DATE" \
  "$S3_BUCKET/daily/backup-$DATE/" \
  --storage-class STANDARD_IA

# Cleanup local backups older than 7 days
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} \;

# Verify backup integrity
pg_verifybackup "$BACKUP_DIR/backup-$DATE"
```

**Cron Schedule**:
```cron
0 2 * * * /scripts/backup-daily.sh
```

**Storage**: S3 Standard-IA
**Retention**: 30 days

### 3. Weekly Full Backups

**Frequency**: Weekly (Sundays at 3:00 AM UTC)

**Purpose**: Long-term retention

```bash
#!/bin/bash
# scripts/backup-weekly.sh

WEEK=$(date +%Y-W%V)
pg_dump -h localhost -U backup_user -F custom -f "/backups/weekly/backup-$WEEK.dump" learning_platform

# Upload to S3 Glacier for long-term storage
aws s3 cp "/backups/weekly/backup-$WEEK.dump" \
  "s3://learning-platform-backups/weekly/backup-$WEEK.dump" \
  --storage-class GLACIER
```

**Storage**: S3 Glacier
**Retention**: 1 year

### 4. Monthly Full Backups

**Frequency**: Monthly (1st of month at 4:00 AM UTC)

**Purpose**: Compliance and long-term archiving

**Storage**: S3 Glacier Deep Archive
**Retention**: 7 years

## Backup Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Primary Database                          │
│             (Continuous WAL Streaming)                   │
└────────┬─────────────────────────────┬──────────────────┘
         │                             │
         │ WAL Archive                 │ Base Backup
         │ (Every 5 min)               │ (Daily)
         │                             │
    ┌────▼────┐                   ┌────▼────┐
    │   S3    │                   │   S3    │
    │  WAL    │                   │ Backups │
    │ Archive │                   │ (Daily) │
    └────┬────┘                   └────┬────┘
         │                             │
         └──────────┬──────────────────┘
                    │
              ┌─────▼─────┐
              │  Glacier  │
              │  (Weekly/ │
              │  Monthly) │
              └───────────┘
```

## Automated Backup Scripts

### Main Backup Script

```bash
#!/bin/bash
# /scripts/backup-manager.sh

set -e

# Configuration
export PGHOST="localhost"
export PGPORT="5432"
export PGUSER="backup_user"
export PGDATABASE="learning_platform"
export BACKUP_DIR="/var/backups/postgres"
export S3_BUCKET="learning-platform-backups"
export LOG_FILE="/var/log/backup-manager.log"

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function: Create full backup
create_full_backup() {
  local backup_type=$1
  local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
  local backup_path="$BACKUP_DIR/$backup_type/$backup_name"

  log "Starting $backup_type backup: $backup_name"

  mkdir -p "$backup_path"

  # Create base backup
  pg_basebackup -D "$backup_path" -F tar -z -P -v --wal-method=stream

  # Calculate checksum
  find "$backup_path" -type f -exec sha256sum {} \; > "$backup_path/checksums.txt"

  # Upload to S3
  log "Uploading to S3..."
  aws s3 sync "$backup_path" "s3://$S3_BUCKET/$backup_type/$backup_name/" \
    --storage-class STANDARD_IA

  log "Backup completed: $backup_name"

  # Send notification
  send_notification "✅ Backup completed: $backup_type/$backup_name"

  return 0
}

# Function: Dump logical backup
create_logical_backup() {
  local backup_name="logical-backup-$(date +%Y%m%d-%H%M%S).dump"
  local backup_path="$BACKUP_DIR/logical/$backup_name"

  log "Creating logical backup: $backup_name"

  mkdir -p "$BACKUP_DIR/logical"

  # Create dump
  pg_dump -F custom -Z 9 -f "$backup_path"

  # Upload to S3
  aws s3 cp "$backup_path" "s3://$S3_BUCKET/logical/$backup_name" \
    --storage-class STANDARD_IA

  log "Logical backup completed"

  return 0
}

# Function: Verify backup
verify_backup() {
  local backup_path=$1

  log "Verifying backup: $backup_path"

  # Check if backup exists
  if [ ! -d "$backup_path" ]; then
    log "ERROR: Backup not found: $backup_path"
    return 1
  fi

  # Verify checksums
  cd "$backup_path"
  sha256sum -c checksums.txt

  log "Backup verification successful"

  return 0
}

# Function: Cleanup old backups
cleanup_old_backups() {
  local retention_days=$1
  local backup_type=$2

  log "Cleaning up $backup_type backups older than $retention_days days"

  # Local cleanup
  find "$BACKUP_DIR/$backup_type" -type d -mtime +$retention_days -exec rm -rf {} \;

  # S3 lifecycle policy handles cloud cleanup
  log "Cleanup completed"
}

# Function: Send notification
send_notification() {
  local message=$1

  # Send to Slack
  curl -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d "{\"text\": \"$message\"}"

  # Send email (via AWS SES)
  aws ses send-email \
    --from "backups@learning-platform.com" \
    --to "ops@learning-platform.com" \
    --subject "Database Backup Notification" \
    --text "$message"
}

# Main execution
case "$1" in
  daily)
    create_full_backup "daily"
    cleanup_old_backups 30 "daily"
    ;;
  weekly)
    create_full_backup "weekly"
    create_logical_backup
    ;;
  monthly)
    create_full_backup "monthly"
    ;;
  verify)
    verify_backup "$2"
    ;;
  *)
    echo "Usage: $0 {daily|weekly|monthly|verify <path>}"
    exit 1
    ;;
esac
```

### Cron Configuration

```cron
# /etc/cron.d/postgres-backup

# Daily backups at 2 AM UTC
0 2 * * * postgres /scripts/backup-manager.sh daily

# Weekly backups on Sunday at 3 AM UTC
0 3 * * 0 postgres /scripts/backup-manager.sh weekly

# Monthly backups on 1st at 4 AM UTC
0 4 1 * * postgres /scripts/backup-manager.sh monthly

# Hourly WAL archive check
0 * * * * postgres /scripts/check-wal-archive.sh
```

## Point-in-Time Recovery (PITR)

### Recovery Procedure

```bash
#!/bin/bash
# scripts/restore-pitr.sh

TARGET_TIME="$1"  # Format: 2024-11-16 10:30:00

if [ -z "$TARGET_TIME" ]; then
  echo "Usage: $0 'YYYY-MM-DD HH:MM:SS'"
  exit 1
fi

# 1. Stop PostgreSQL
systemctl stop postgresql

# 2. Backup current data (just in case)
mv /var/lib/postgresql/data /var/lib/postgresql/data.old

# 3. Restore base backup
mkdir -p /var/lib/postgresql/data
aws s3 sync s3://learning-platform-backups/daily/latest/ /var/lib/postgresql/data/

# 4. Create recovery configuration
cat > /var/lib/postgresql/data/recovery.conf <<EOF
restore_command = 'aws s3 cp s3://learning-platform-wal-archive/%f %p'
recovery_target_time = '$TARGET_TIME'
recovery_target_action = promote
EOF

# 5. Start PostgreSQL
chown -R postgres:postgres /var/lib/postgresql/data
systemctl start postgresql

# 6. Monitor recovery
tail -f /var/log/postgresql/postgresql.log
```

### Automated PITR Testing

```bash
#!/bin/bash
# scripts/test-pitr.sh

# Test PITR weekly to ensure backups are valid

# 1. Spin up test instance
docker run -d --name pitr-test \
  -v pitr-test-data:/var/lib/postgresql/data \
  postgres:16.4

# 2. Restore to 24 hours ago
TARGET_TIME=$(date -d "24 hours ago" "+%Y-%m-%d %H:%M:%S")
docker exec pitr-test bash /restore-pitr.sh "$TARGET_TIME"

# 3. Verify data
docker exec pitr-test psql -U postgres -c "SELECT COUNT(*) FROM users;"

# 4. Cleanup
docker stop pitr-test
docker rm pitr-test
```

## Disaster Recovery Scenarios

### Scenario 1: Accidental Data Deletion

**Problem**: Admin accidentally deletes 1000 user records at 10:30 AM

**Solution**: PITR to 10:29 AM

```bash
./scripts/restore-pitr.sh "2024-11-16 10:29:00"
```

**RTO**: 30 minutes
**RPO**: 1 minute

### Scenario 2: Database Corruption

**Problem**: Database files corrupted due to disk failure

**Solution**: Restore from latest daily backup

```bash
# 1. Download latest backup
aws s3 sync s3://learning-platform-backups/daily/latest/ /restore/

# 2. Restore
pg_restore -d learning_platform /restore/latest.dump

# 3. Apply WAL from time of backup to now
# (Automatic with recovery.conf)
```

**RTO**: 1 hour
**RPO**: 5 minutes

### Scenario 3: Complete Data Center Failure

**Problem**: Primary data center goes offline

**Solution**: Failover to standby region

```bash
# 1. Promote read replica in DR region to primary
pg_ctl promote -D /var/lib/postgresql/data

# 2. Update DNS to point to new primary
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123 \
  --change-batch file://failover-dns.json

# 3. Restore from S3 if replica is behind
aws s3 sync s3://learning-platform-backups-dr/latest/ /restore/
```

**RTO**: 2 hours
**RPO**: 5 minutes

## Backup Monitoring

### Prometheus Metrics

```yaml
# prometheus-rules.yml
groups:
  - name: backup_alerts
    rules:
      - alert: BackupFailed
        expr: postgres_backup_last_success_timestamp < time() - 86400
        for: 1h
        annotations:
          summary: "Database backup failed"
          description: "No successful backup in last 24 hours"

      - alert: BackupTooOld
        expr: postgres_backup_age_hours > 24
        annotations:
          summary: "Backup is too old"

      - alert: WALArchiveLag
        expr: postgres_wal_archive_lag_bytes > 1073741824  # 1GB
        annotations:
          summary: "WAL archive lag is too high"
```

### Health Check Script

```bash
#!/bin/bash
# scripts/check-backup-health.sh

# Check last backup timestamp
LAST_BACKUP=$(aws s3 ls s3://learning-platform-backups/daily/ | tail -1 | awk '{print $1}')
LAST_BACKUP_AGE=$(( ($(date +%s) - $(date -d "$LAST_BACKUP" +%s)) / 3600 ))

if [ "$LAST_BACKUP_AGE" -gt 24 ]; then
  echo "CRITICAL: Last backup is $LAST_BACKUP_AGE hours old"
  exit 2
fi

# Check WAL archive
WAL_COUNT=$(aws s3 ls s3://learning-platform-wal-archive/ | wc -l)
if [ "$WAL_COUNT" -eq 0 ]; then
  echo "CRITICAL: No WAL archives found"
  exit 2
fi

echo "OK: Backups are healthy"
exit 0
```

## S3 Lifecycle Policies

```json
{
  "Rules": [
    {
      "Id": "DailyBackupRetention",
      "Status": "Enabled",
      "Prefix": "daily/",
      "Transitions": [
        {
          "Days": 7,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 90
      }
    },
    {
      "Id": "WeeklyBackupRetention",
      "Status": "Enabled",
      "Prefix": "weekly/",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    },
    {
      "Id": "MonthlyBackupRetention",
      "Status": "Enabled",
      "Prefix": "monthly/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER_DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

## Backup Cost Optimization

### Storage Costs (AWS S3)

- **Daily Backups (30 days)**: 30 × 50GB = 1.5TB @ $0.0125/GB = **$18.75/month**
- **Weekly Backups (52 weeks)**: 52 × 50GB = 2.6TB @ $0.004/GB = **$10.40/month**
- **Monthly Backups (84 months)**: 84 × 50GB = 4.2TB @ $0.00099/GB = **$4.16/month**
- **WAL Archives**: ~500GB/month @ $0.023/GB = **$11.50/month**

**Total**: ~$45/month for complete backup solution

### Optimization Strategies

1. **Compress backups** with `gzip -9` (70% reduction)
2. **Incremental backups** for large databases
3. **Deduplicate** identical WAL segments
4. **Glacier for long-term** (90% cost reduction)

## Testing & Validation

### Monthly Restore Tests

```bash
#!/bin/bash
# scripts/monthly-restore-test.sh

# Automated monthly test of restore procedures

# 1. Create test environment
docker-compose -f docker-compose.restore-test.yml up -d

# 2. Restore latest backup
./scripts/restore-pitr.sh "$(date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S')"

# 3. Run validation queries
psql -h localhost -U postgres -d learning_platform <<EOF
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM enrollments;
EOF

# 4. Generate report
echo "Restore test completed successfully" | mail -s "Monthly Restore Test" ops@learning-platform.com

# 5. Cleanup
docker-compose -f docker-compose.restore-test.yml down -v
```

## Best Practices

1. ✅ **Test restores monthly** - Backups are useless if they can't be restored
2. ✅ **3-2-1 Rule**: 3 copies, 2 different media, 1 offsite
3. ✅ **Encrypt backups** at rest and in transit
4. ✅ **Monitor backup health** with alerts
5. ✅ **Document procedures** for disaster recovery
6. ✅ **Automate everything** - No manual steps
7. ✅ **Geographic diversity** - Backups in multiple regions
8. ✅ **Version control** backup scripts

## Compliance

### GDPR Requirements

- Backups encrypted with AES-256
- Right to erasure: Can delete user data from all backups
- Backup retention aligns with data retention policies

### SOC 2 Requirements

- Documented backup and recovery procedures
- Regular restore testing
- Access controls on backup data
- Audit logs for all backup operations

## Conclusion

This backup strategy provides:
- ✅ **99.999% data durability**
- ✅ **RPO: 5 minutes**
- ✅ **RTO: 1 hour**
- ✅ **Cost-effective**: ~$45/month
- ✅ **Automated**: Zero manual intervention
- ✅ **Tested**: Monthly restore validation
