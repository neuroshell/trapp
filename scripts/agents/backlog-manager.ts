/**
 * Backlog Manager
 * 
 * Handles GitHub Issues API interactions for managing the agentic SDLC backlog
 */

import { Octokit } from '@octokit/rest';
import {
  GitHubIssue,
  BacklogItem,
  IssueStatus,
  SDLC_PHASES,
  getPhaseByStatusLabel,
  getNextPhase,
} from './types';

/**
 * Configuration for BacklogManager
 */
export interface BacklogManagerConfig {
  /** GitHub API token (required) */
  token: string;
  /** Repository owner (e.g., 'facebook') */
  owner: string;
  /** Repository name (e.g., 'react') */
  repo: string;
  /** Label that marks an issue as a backlog item */
  backlogLabel: string;
  /** Prefix for agent-generated comments */
  commentPrefix: string;
}

/**
 * Manages GitHub Issues as backlog items for the agentic SDLC pipeline
 */
export class BacklogManager {
  private octokit: Octokit;
  private config: BacklogManagerConfig;

  constructor(config: BacklogManagerConfig) {
    if (!config.token) {
      throw new Error('GitHub token is required');
    }
    
    this.config = config;
    this.octokit = new Octokit({
      auth: config.token,
    });
  }

  /**
   * Fetch all open backlog issues
   */
  async getBacklogItems(): Promise<BacklogItem[]> {
    const { data: issues } = await this.octokit.issues.listForRepo({
      owner: this.config.owner,
      repo: this.config.repo,
      state: 'open',
      labels: this.config.backlogLabel,
      per_page: 100,
    });

    return Promise.all(
      issues.map(issue => this.parseBacklogItem(issue))
    );
  }

  /**
   * Fetch a single issue by number
   */
  async getIssue(issueNumber: number): Promise<BacklogItem> {
    const { data: issue } = await this.octokit.issues.get({
      owner: this.config.owner,
      repo: this.config.repo,
      issue_number: issueNumber,
    });

    return this.parseBacklogItem(issue);
  }

  /**
   * Parse a GitHub issue into a BacklogItem
   */
  private async parseBacklogItem(issue: GitHubIssue): Promise<BacklogItem> {
    const labels = issue.labels.map(l => 
      typeof l === 'string' ? l : l.name
    ).filter(Boolean) as string[];

    // Determine current status from labels
    const status = this.determineStatus(labels);
    const currentPhase = getPhaseByStatusLabel(status);

    // Calculate completed and pending phases
    const completedPhases: string[] = [];
    const pendingPhases: string[] = [];
    
    let foundCurrent = false;
    for (const phase of SDLC_PHASES) {
      if (phase.statusLabel === status) {
        foundCurrent = true;
        pendingPhases.push(phase.id);
      } else if (!foundCurrent) {
        completedPhases.push(phase.id);
      } else {
        pendingPhases.push(phase.id);
      }
    }

    // Check if approval is needed and received
    const needsApproval = currentPhase?.requiresApproval ?? false;
    const approvalReceived = needsApproval && 
      labels.includes(currentPhase!.approvalLabel!);

    return {
      issue,
      currentPhase,
      status,
      completedPhases,
      pendingPhases,
      needsApproval,
      approvalReceived,
    };
  }

  /**
   * Determine issue status from labels
   */
  private determineStatus(labels: string[]): IssueStatus {
    // Check for SDLC phase labels first
    for (const phase of SDLC_PHASES) {
      if (labels.includes(phase.statusLabel)) {
        return phase.statusLabel;
      }
    }

    // Check for final states
    if (labels.includes('ready-to-merge')) return 'ready-to-merge';
    if (labels.includes('done') || labels.includes('completed')) return 'done';

    // Default to backlog
    return 'backlog';
  }

  /**
   * Update issue status with new label
   */
  async updateStatus(
    issueNumber: number,
    newStatus: IssueStatus,
    removeOldLabels: boolean = true
  ): Promise<void> {
    const issue = await this.getIssue(issueNumber);
    const currentLabels = issue.issue.labels.map(l => 
      typeof l === 'string' ? l : l.name
    ).filter(Boolean) as string[];

    let newLabels = currentLabels.filter(l => l !== this.config.backlogLabel);

    if (removeOldLabels) {
      // Remove old SDLC status labels
      newLabels = newLabels.filter(l => 
        !SDLC_PHASES.some(p => p.statusLabel === l) &&
        l !== 'ready-to-merge' &&
        l !== 'done' &&
        l !== 'completed'
      );
    }

    // Add new status label
    newLabels.push(newStatus);

    await this.octokit.issues.update({
      owner: this.config.owner,
      repo: this.config.repo,
      issue_number: issueNumber,
      labels: newLabels,
    });
  }

  /**
   * Add a comment to an issue
   */
  async addComment(issueNumber: number, body: string): Promise<void> {
    const commentBody = this.config.commentPrefix 
      ? `**${this.config.commentPrefix}**: ${body}`
      : body;

    await this.octokit.issues.createComment({
      owner: this.config.owner,
      repo: this.config.repo,
      issue_number: issueNumber,
      body: commentBody,
    });
  }

  /**
   * Add approval label to an issue
   */
  async addApprovalLabel(
    issueNumber: number,
    phaseId: string
  ): Promise<void> {
    const phase = SDLC_PHASES.find(p => p.id === phaseId);
    if (!phase?.approvalLabel) {
      throw new Error(`Phase ${phaseId} does not require approval`);
    }

    await this.octokit.issues.addLabels({
      owner: this.config.owner,
      repo: this.config.repo,
      issue_number: issueNumber,
      labels: [phase.approvalLabel],
    });
  }

  /**
   * Check if approval label exists for a phase
   */
  async checkApproval(
    issueNumber: number,
    phaseId: string
  ): Promise<boolean> {
    const issue = await this.getIssue(issueNumber);
    const phase = SDLC_PHASES.find(p => p.id === phaseId);
    
    if (!phase?.approvalLabel) {
      return false;
    }

    return issue.issue.labels.some(l => 
      (typeof l === 'string' ? l : l.name) === phase.approvalLabel
    );
  }

  /**
   * Create a new issue for a backlog item
   */
  async createIssue(
    title: string,
    body: string,
    labels: string[] = [this.config.backlogLabel]
  ): Promise<BacklogItem> {
    const { data: issue } = await this.octokit.issues.create({
      owner: this.config.owner,
      repo: this.config.repo,
      title,
      body,
      labels,
    });

    return this.parseBacklogItem(issue);
  }

  /**
   * Close an issue
   */
  async closeIssue(issueNumber: number): Promise<void> {
    await this.octokit.issues.update({
      owner: this.config.owner,
      repo: this.config.repo,
      issue_number: issueNumber,
      state: 'closed',
    });
  }

  /**
   * Create a branch for development
   */
  async createBranch(
    branchName: string,
    fromBranch: string = 'main'
  ): Promise<void> {
    // Get the latest commit SHA from the base branch
    const { data: ref } = await this.octokit.git.getRef({
      owner: this.config.owner,
      repo: this.config.repo,
      ref: `heads/${fromBranch}`,
    });

    // Create a new branch
    await this.octokit.git.createRef({
      owner: this.config.owner,
      repo: this.config.repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    title: string,
    body: string,
    head: string,
    base: string = 'main',
    issueNumber?: number
  ): Promise<{ number: number; url: string }> {
    const { data: pr } = await this.octokit.pulls.create({
      owner: this.config.owner,
      repo: this.config.repo,
      title,
      body,
      head,
      base,
    });

    // Link PR to issue if provided
    if (issueNumber) {
      await this.addComment(issueNumber, 
        `Created PR #${pr.number}: ${pr.html_url}`
      );
    }

    return {
      number: pr.number,
      url: pr.html_url,
    };
  }

  /**
   * Get issues that need approval
   */
  async getIssuesNeedingApproval(): Promise<BacklogItem[]> {
    const items = await this.getBacklogItems();
    return items.filter(
      item => item.needsApproval && !item.approvalReceived
    );
  }

  /**
   * Get issues ready for next phase
   */
  async getIssuesReadyForNextPhase(): Promise<BacklogItem[]> {
    const items = await this.getBacklogItems();
    return items.filter(
      item => !item.needsApproval || item.approvalReceived
    );
  }

  /**
   * Get repository info (useful for context building)
   */
  async getRepoInfo(): Promise<{ name: string; description: string | null; default_branch: string }> {
    const { data: repo } = await this.octokit.repos.get({
      owner: this.config.owner,
      repo: this.config.repo,
    });

    return {
      name: repo.name,
      description: repo.description,
      default_branch: repo.default_branch,
    };
  }
}

/**
 * Create a BacklogManager instance from environment variables
 */
export function createBacklogManagerFromEnv(): BacklogManager {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;

  if (!token || !owner || !repo) {
    throw new Error(
      'Missing required environment variables: GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME'
    );
  }

  return new BacklogManager({
    token,
    owner,
    repo,
    backlogLabel: 'backlog-item',
    commentPrefix: '🤖 Agent Pipeline',
  });
}
