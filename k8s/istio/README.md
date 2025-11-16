# Istio Service Mesh (Optional)

Istio provides advanced traffic management, security, and observability features for microservices.

## When to Use Istio

Use Istio when you need:
- Advanced traffic management (canary deployments, A/B testing)
- Mutual TLS between services
- Circuit breaking and retries
- Distributed tracing
- Service-to-service authorization

## Installation

### 1. Install Istio CLI

```bash
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH
```

### 2. Install Istio on Kubernetes

```bash
# Install with demo profile (for testing)
istioctl install --set profile=demo -y

# For production, use:
istioctl install --set profile=production -y
```

### 3. Enable Sidecar Injection

```bash
kubectl label namespace learning-platform istio-injection=enabled
```

### 4. Apply Istio Configurations

```bash
kubectl apply -f k8s/istio/
```

## Components

### Gateway
Exposes services outside the mesh with advanced routing.

### VirtualService
Defines routing rules for traffic within the mesh.

### DestinationRule
Configures traffic policies (load balancing, circuit breaking).

### PeerAuthentication
Enables mutual TLS between services.

## Verification

```bash
# Check Istio installation
istioctl verify-install

# Check proxy status
istioctl proxy-status

# View mesh configuration
istioctl analyze

# Check mTLS status
kubectl exec -it <pod-name> -n learning-platform -c istio-proxy -- curl http://localhost:15000/config_dump
```

## Monitoring with Istio

### Kiali (Service Mesh Dashboard)

```bash
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
kubectl port-forward -n istio-system svc/kiali 20001:20001
# Open http://localhost:20001
```

### Jaeger (Distributed Tracing)

```bash
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml
kubectl port-forward -n istio-system svc/tracing 16686:80
# Open http://localhost:16686
```

### Prometheus & Grafana (Already configured)

Istio automatically exports metrics to Prometheus.

## Uninstall

```bash
# Remove Istio
istioctl uninstall --purge -y

# Remove namespace label
kubectl label namespace learning-platform istio-injection-
```

## Note

Istio is **optional** for this platform. Start without it and add it later when you need advanced features. It adds complexity and resource overhead.
