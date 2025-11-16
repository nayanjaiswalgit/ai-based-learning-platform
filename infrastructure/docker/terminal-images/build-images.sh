#!/bin/bash

# Build script for terminal Docker images

set -e

echo "Building terminal Docker images..."

# Base Ubuntu image
echo "Building ubuntu-base image..."
docker build -t ai-learning/ubuntu-base:latest -f ubuntu/Dockerfile ubuntu/

# Ubuntu with Git
echo "Building ubuntu-git image..."
docker build -t ai-learning/ubuntu-git:latest -f ubuntu/Dockerfile.git ubuntu/

# Kubernetes tools
echo "Building k8s-tools image..."
docker build -t ai-learning/k8s-tools:latest -f devops/Dockerfile.k8s devops/

# AWS CLI
echo "Building aws-cli image..."
docker build -t ai-learning/aws-cli:latest -f devops/Dockerfile.aws devops/

# Nginx
echo "Building nginx-tools image..."
docker build -t ai-learning/nginx-tools:latest -f devops/Dockerfile.nginx devops/

echo "All images built successfully!"

# List images
echo ""
echo "Built images:"
docker images | grep ai-learning
