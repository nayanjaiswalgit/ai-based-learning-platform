# Base Ubuntu image for Linux basics scenarios
FROM ubuntu:22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install essential tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    vim \
    nano \
    less \
    man-db \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
RUN mkdir -p /workspace && chmod 777 /workspace

# Create a non-root user
RUN useradd -m -s /bin/bash learner && \
    echo "learner:password" | chpasswd && \
    usermod -aG sudo learner

# Set working directory
WORKDIR /workspace

# Set default user
USER learner

# Set default shell
CMD ["/bin/bash"]
