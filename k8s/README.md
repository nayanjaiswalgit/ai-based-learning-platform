# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the AI-Based Learning Platform.

## Directory Structure

```
k8s/
├── base/                    # Base Kubernetes manifests
│   ├── namespace.yaml       # Namespace definition
│   ├── api-deployment.yaml  # API service deployment
│   ├── code-runner-deployment.yaml
│   ├── ai-service-deployment.yaml
│   ├── notification-service-deployment.yaml
│   ├── hpa.yaml            # Horizontal Pod Autoscalers
│   ├── ingress.yaml        # Ingress configurations
│   ├── cert-manager.yaml   # SSL/TLS certificates
│   └── secrets-template.yaml
├── production/             # Production overlays
└── staging/                # Staging overlays
```

## Prerequisites

1. **Kubernetes Cluster** (1.28+)
   - GKE, EKS, AKS, or self-managed
   - Minimum 3 nodes (4 vCPUs, 16GB RAM each)

2. **kubectl** CLI installed
   ```bash
   kubectl version --client
   ```

3. **Helm** (for installing operators)
   ```bash
   helm version
   ```

4. **Sealed Secrets Controller**
   ```bash
   helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
   helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system
   ```

5. **NGINX Ingress Controller**
   ```bash
   helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
   helm install ingress-nginx ingress-nginx/ingress-nginx \
     --namespace ingress-nginx --create-namespace
   ```

6. **Cert-Manager** (for SSL/TLS)
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

## Deployment Steps

### 1. Create Namespace

```bash
kubectl apply -f k8s/base/namespace.yaml
```

### 2. Create Secrets

**DO NOT commit actual secrets to Git!**

Create secrets from the template:

```bash
# Copy the template
cp k8s/base/secrets-template.yaml secrets.yaml

# Edit secrets.yaml with actual values
vim secrets.yaml

# Seal the secrets (requires sealed-secrets controller)
kubeseal --format yaml < secrets.yaml > k8s/base/sealed-secrets.yaml

# Apply sealed secrets
kubectl apply -f k8s/base/sealed-secrets.yaml

# Delete the unencrypted file
rm secrets.yaml
```

### 3. Deploy Services

```bash
# Deploy all services
kubectl apply -f k8s/base/ --recursive

# Verify deployments
kubectl get deployments -n learning-platform
kubectl get pods -n learning-platform
kubectl get services -n learning-platform
```

### 4. Configure Ingress & SSL

```bash
# Apply cert-manager cluster issuers
kubectl apply -f k8s/base/cert-manager.yaml

# Apply ingress
kubectl apply -f k8s/base/ingress.yaml

# Check certificate status
kubectl get certificate -n learning-platform
kubectl describe certificate learning-platform-tls -n learning-platform
```

### 5. Configure Auto-Scaling

```bash
# Apply HPA
kubectl apply -f k8s/base/hpa.yaml

# Verify HPA
kubectl get hpa -n learning-platform
kubectl describe hpa api-hpa -n learning-platform
```

## Monitoring Deployment

### Check Pod Status

```bash
kubectl get pods -n learning-platform -w
```

### View Logs

```bash
# API logs
kubectl logs -f deployment/api -n learning-platform

# Code runner logs
kubectl logs -f deployment/code-runner -n learning-platform

# AI service logs
kubectl logs -f deployment/ai-service -n learning-platform
```

### Check Service Health

```bash
kubectl get services -n learning-platform
kubectl describe service api -n learning-platform
```

### Verify HPA

```bash
kubectl get hpa -n learning-platform
kubectl top pods -n learning-platform
```

## Scaling

### Manual Scaling

```bash
# Scale API service
kubectl scale deployment api --replicas=5 -n learning-platform

# Scale code runner
kubectl scale deployment code-runner --replicas=10 -n learning-platform
```

### Auto-Scaling Configuration

HPA is configured to scale based on:
- CPU utilization (70-80%)
- Memory utilization (75-85%)

Min/Max replicas:
- API: 3-20
- Code Runner: 5-50
- AI Service: 2-10
- Notification Service: 2-15

## Rolling Updates

```bash
# Update image
kubectl set image deployment/api api=new-image:tag -n learning-platform

# Check rollout status
kubectl rollout status deployment/api -n learning-platform

# Rollback if needed
kubectl rollout undo deployment/api -n learning-platform
```

## Troubleshooting

### Pod Not Starting

```bash
kubectl describe pod <pod-name> -n learning-platform
kubectl logs <pod-name> -n learning-platform
```

### Service Unreachable

```bash
kubectl get endpoints -n learning-platform
kubectl describe service <service-name> -n learning-platform
```

### Ingress Issues

```bash
kubectl describe ingress learning-platform-ingress -n learning-platform
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

### Certificate Issues

```bash
kubectl describe certificate learning-platform-tls -n learning-platform
kubectl logs -n cert-manager deployment/cert-manager
```

## Cleanup

```bash
# Delete all resources
kubectl delete namespace learning-platform

# Uninstall ingress controller
helm uninstall ingress-nginx -n ingress-nginx

# Uninstall sealed secrets
helm uninstall sealed-secrets -n kube-system
```

## Production Checklist

- [ ] Secrets are sealed and encrypted
- [ ] Resource limits are configured
- [ ] HPA is enabled and tested
- [ ] SSL certificates are valid
- [ ] Ingress is configured correctly
- [ ] Monitoring is set up (Prometheus/Grafana)
- [ ] Logging is centralized
- [ ] Backups are configured
- [ ] Disaster recovery plan is in place
- [ ] Load testing is complete
