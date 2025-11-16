# Monitoring Stack

## Quick Start

Start the monitoring stack:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

Access dashboards:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **AlertManager**: http://localhost:9093

## Components

### Prometheus
- Metrics collection and storage
- Service discovery for Kubernetes
- Alert rule evaluation
- 30-day data retention

### Grafana
- Visualization dashboards
- Real-time monitoring
- Custom panels and alerts
- Data source: Prometheus

### AlertManager
- Alert routing and grouping
- Slack and email notifications
- Alert deduplication
- Inhibition rules

### Exporters
- **Node Exporter**: System metrics (CPU, memory, disk)
- **Postgres Exporter**: Database metrics
- **Redis Exporter**: Cache metrics

## Configuration

### Prometheus Targets
All services are auto-discovered via Kubernetes service discovery. Manual targets:
- PostgreSQL: `postgres-exporter:9187`
- Redis: `redis-exporter:9121`

### Alert Rules
See `prometheus/alerts.yml` for all configured alerts:
- CPU/Memory thresholds
- Service health
- Error rates
- Database performance

### Grafana Dashboards
- Overview: Platform metrics summary
- API Performance: Request rates, latency
- Database: Connection pools, query performance
- Infrastructure: CPU, memory, disk usage

## Customization

### Adding New Alerts

Edit `prometheus/alerts.yml`:

```yaml
- alert: MyNewAlert
  expr: my_metric > threshold
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Alert title"
    description: "Alert description"
```

Reload Prometheus:
```bash
curl -X POST http://localhost:9090/-/reload
```

### Adding Grafana Dashboards

1. Create dashboard in UI
2. Export JSON
3. Save to `grafana/dashboards/`
4. Restart Grafana

## Production Deployment

For production, use Kubernetes manifests in `k8s/monitoring/`:

```bash
kubectl apply -f k8s/monitoring/ --recursive
```

This deploys:
- Prometheus Operator
- Grafana with persistent storage
- AlertManager with HA
- ServiceMonitors for auto-discovery
