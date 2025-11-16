import { Injectable, Logger } from '@nestjs/common';

export interface ScenarioCheckpoint {
  id: string;
  title: string;
  description: string;
  validationScript: string;
  order: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'linux' | 'git' | 'docker' | 'kubernetes' | 'aws' | 'nginx' | 'cicd';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  dockerImage: string;
  setupScript?: string;
  checkpoints: ScenarioCheckpoint[];
  hints: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ScenarioService {
  private readonly logger = new Logger(ScenarioService.name);
  private scenarios: Map<string, Scenario> = new Map();

  constructor() {
    // Initialize with pre-built scenarios
    this.initializeDefaultScenarios();
  }

  /**
   * Get scenario by ID
   */
  getScenario(scenarioId: string): Scenario | undefined {
    return this.scenarios.get(scenarioId);
  }

  /**
   * List all scenarios
   */
  listScenarios(category?: string): Scenario[] {
    const scenarios = Array.from(this.scenarios.values());

    if (category) {
      return scenarios.filter((s) => s.category === category);
    }

    return scenarios;
  }

  /**
   * Create a new scenario
   */
  createScenario(scenario: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>): Scenario {
    const id = `scenario-${Date.now()}`;
    const newScenario: Scenario = {
      ...scenario,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.scenarios.set(id, newScenario);

    this.logger.log(`Scenario ${id} created: ${scenario.title}`);

    return newScenario;
  }

  /**
   * Update scenario
   */
  updateScenario(scenarioId: string, updates: Partial<Scenario>): Scenario {
    const scenario = this.scenarios.get(scenarioId);

    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    const updatedScenario = {
      ...scenario,
      ...updates,
      id: scenarioId, // Preserve ID
      updatedAt: new Date(),
    };

    this.scenarios.set(scenarioId, updatedScenario);

    this.logger.log(`Scenario ${scenarioId} updated`);

    return updatedScenario;
  }

  /**
   * Delete scenario
   */
  deleteScenario(scenarioId: string): void {
    this.scenarios.delete(scenarioId);
    this.logger.log(`Scenario ${scenarioId} deleted`);
  }

  /**
   * Validate checkpoint
   */
  async validateCheckpoint(
    scenarioId: string,
    checkpointId: string,
    containerOutput: string,
  ): Promise<boolean> {
    const scenario = this.scenarios.get(scenarioId);

    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    const checkpoint = scenario.checkpoints.find((c) => c.id === checkpointId);

    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    // Execute validation script
    // In a real implementation, this would execute the validation script
    // against the container state
    try {
      // For now, basic validation based on output
      const validationResult = this.executeValidation(
        checkpoint.validationScript,
        containerOutput,
      );

      return validationResult;
    } catch (error) {
      this.logger.error(
        `Validation failed for checkpoint ${checkpointId}`,
        error,
      );
      return false;
    }
  }

  /**
   * Execute validation script
   * This is a simplified version - in production, this would be more sophisticated
   */
  private executeValidation(script: string, output: string): boolean {
    try {
      // Basic validation using eval (in production, use a safer method)
      // This would typically run inside the container itself
      const validationFn = new Function('output', script);
      return validationFn(output);
    } catch (error) {
      this.logger.error('Validation script error', error);
      return false;
    }
  }

  /**
   * Get hints for a scenario
   */
  getHints(scenarioId: string): string[] {
    const scenario = this.scenarios.get(scenarioId);
    return scenario?.hints || [];
  }

  /**
   * Initialize default scenarios
   */
  private initializeDefaultScenarios(): void {
    // Linux Basics Scenarios
    this.createScenario({
      title: 'Linux File Operations - Basics',
      description:
        'Learn basic Linux file operations including creating, moving, and deleting files and directories.',
      category: 'linux',
      difficulty: 'beginner',
      estimatedTime: 15,
      dockerImage: 'ai-learning/ubuntu-base:latest',
      setupScript: `
        # Create initial files
        mkdir /workspace
        cd /workspace
        echo "Hello World" > greeting.txt
      `,
      checkpoints: [
        {
          id: 'cp1',
          title: 'Create a directory',
          description: 'Create a directory named "myproject" in /workspace',
          validationScript: 'return output.includes("myproject") || false;',
          order: 1,
        },
        {
          id: 'cp2',
          title: 'Create a file',
          description: 'Create a file named "readme.txt" inside myproject',
          validationScript: 'return output.includes("readme.txt") || false;',
          order: 2,
        },
        {
          id: 'cp3',
          title: 'Change permissions',
          description: 'Make readme.txt executable',
          validationScript: 'return output.includes("x") || false;',
          order: 3,
        },
      ],
      hints: [
        'Use mkdir to create directories',
        'Use touch to create files',
        'Use chmod to change permissions',
      ],
      createdBy: 'system',
    });

    this.createScenario({
      title: 'Git Basics - Your First Repository',
      description: 'Learn Git fundamentals by creating a repository and making commits.',
      category: 'git',
      difficulty: 'beginner',
      estimatedTime: 20,
      dockerImage: 'ai-learning/ubuntu-git:latest',
      setupScript: `
        mkdir /workspace
        cd /workspace
      `,
      checkpoints: [
        {
          id: 'cp1',
          title: 'Initialize Git repository',
          description: 'Initialize a new Git repository',
          validationScript: 'return output.includes(".git") || false;',
          order: 1,
        },
        {
          id: 'cp2',
          title: 'Create and stage a file',
          description: 'Create README.md and stage it',
          validationScript: 'return output.includes("README.md") || false;',
          order: 2,
        },
        {
          id: 'cp3',
          title: 'Make first commit',
          description: 'Commit your changes with a message',
          validationScript: 'return output.includes("Initial commit") || false;',
          order: 3,
        },
      ],
      hints: [
        'Use "git init" to initialize a repository',
        'Use "git add" to stage files',
        'Use "git commit" to save changes',
      ],
      createdBy: 'system',
    });

    this.createScenario({
      title: 'Docker Basics - Running Containers',
      description: 'Learn how to run and manage Docker containers.',
      category: 'docker',
      difficulty: 'beginner',
      estimatedTime: 25,
      dockerImage: 'docker:dind',
      setupScript: '',
      checkpoints: [
        {
          id: 'cp1',
          title: 'Run a container',
          description: 'Run an nginx container in detached mode',
          validationScript: 'return output.includes("nginx") || false;',
          order: 1,
        },
        {
          id: 'cp2',
          title: 'List running containers',
          description: 'View all running containers',
          validationScript: 'return output.includes("CONTAINER") || false;',
          order: 2,
        },
        {
          id: 'cp3',
          title: 'Stop container',
          description: 'Stop the nginx container',
          validationScript: 'return output.includes("nginx") || false;',
          order: 3,
        },
      ],
      hints: [
        'Use "docker run" to start containers',
        'Use "docker ps" to list containers',
        'Use "docker stop" to stop containers',
      ],
      createdBy: 'system',
    });

    this.createScenario({
      title: 'Kubernetes Basics - Pods and Deployments',
      description: 'Learn how to deploy applications on Kubernetes.',
      category: 'kubernetes',
      difficulty: 'intermediate',
      estimatedTime: 30,
      dockerImage: 'ai-learning/k8s-tools:latest',
      setupScript: '',
      checkpoints: [
        {
          id: 'cp1',
          title: 'Create a Pod',
          description: 'Create a simple nginx pod',
          validationScript: 'return output.includes("pod/") || false;',
          order: 1,
        },
        {
          id: 'cp2',
          title: 'Create a Deployment',
          description: 'Create a deployment with 3 replicas',
          validationScript: 'return output.includes("deployment") || false;',
          order: 2,
        },
        {
          id: 'cp3',
          title: 'Expose deployment',
          description: 'Expose the deployment as a service',
          validationScript: 'return output.includes("service/") || false;',
          order: 3,
        },
      ],
      hints: [
        'Use "kubectl run" to create pods',
        'Use "kubectl create deployment" for deployments',
        'Use "kubectl expose" to create services',
      ],
      createdBy: 'system',
    });

    this.createScenario({
      title: 'AWS CLI Basics - S3 Operations',
      description: 'Learn AWS CLI by working with S3 buckets.',
      category: 'aws',
      difficulty: 'intermediate',
      estimatedTime: 20,
      dockerImage: 'ai-learning/aws-cli:latest',
      setupScript: '',
      checkpoints: [
        {
          id: 'cp1',
          title: 'List buckets',
          description: 'List all S3 buckets',
          validationScript: 'return output.includes("s3://") || false;',
          order: 1,
        },
        {
          id: 'cp2',
          title: 'Create bucket',
          description: 'Create a new S3 bucket',
          validationScript: 'return output.includes("make_bucket") || false;',
          order: 2,
        },
        {
          id: 'cp3',
          title: 'Upload file',
          description: 'Upload a file to the bucket',
          validationScript: 'return output.includes("upload:") || false;',
          order: 3,
        },
      ],
      hints: [
        'Use "aws s3 ls" to list buckets',
        'Use "aws s3 mb" to create buckets',
        'Use "aws s3 cp" to upload files',
      ],
      createdBy: 'system',
    });

    this.createScenario({
      title: 'Nginx Configuration - Reverse Proxy',
      description: 'Configure Nginx as a reverse proxy.',
      category: 'nginx',
      difficulty: 'intermediate',
      estimatedTime: 30,
      dockerImage: 'ai-learning/nginx-tools:latest',
      setupScript: '',
      checkpoints: [
        {
          id: 'cp1',
          title: 'Create config file',
          description: 'Create an nginx configuration file',
          validationScript: 'return output.includes("nginx.conf") || false;',
          order: 1,
        },
        {
          id: 'cp2',
          title: 'Configure proxy',
          description: 'Set up reverse proxy to localhost:8080',
          validationScript: 'return output.includes("proxy_pass") || false;',
          order: 2,
        },
        {
          id: 'cp3',
          title: 'Test configuration',
          description: 'Test nginx configuration',
          validationScript: 'return output.includes("test is successful") || false;',
          order: 3,
        },
      ],
      hints: [
        'Config files go in /etc/nginx/',
        'Use proxy_pass directive',
        'Use "nginx -t" to test config',
      ],
      createdBy: 'system',
    });

    this.createScenario({
      title: 'GitHub Actions - CI/CD Pipeline',
      description: 'Create a CI/CD pipeline using GitHub Actions.',
      category: 'cicd',
      difficulty: 'advanced',
      estimatedTime: 40,
      dockerImage: 'ai-learning/ubuntu-git:latest',
      setupScript: `
        mkdir -p /workspace/.github/workflows
        cd /workspace
        git init
      `,
      checkpoints: [
        {
          id: 'cp1',
          title: 'Create workflow file',
          description: 'Create .github/workflows/ci.yml',
          validationScript: 'return output.includes("ci.yml") || false;',
          order: 1,
        },
        {
          id: 'cp2',
          title: 'Add build job',
          description: 'Configure a build job in the workflow',
          validationScript: 'return output.includes("jobs:") || false;',
          order: 2,
        },
        {
          id: 'cp3',
          title: 'Add test step',
          description: 'Add a test step to the workflow',
          validationScript: 'return output.includes("run:") || false;',
          order: 3,
        },
      ],
      hints: [
        'Workflow files use YAML format',
        'Define jobs with "jobs:" key',
        'Use "run:" for shell commands',
      ],
      createdBy: 'system',
    });

    this.logger.log(`Initialized ${this.scenarios.size} default scenarios`);
  }
}
