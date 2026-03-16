/**
 * Approval Gate System
 *
 * Manages approval gates in the SDLC pipeline, waiting for human review
 * before proceeding to the next phase
 */

import { BacklogManager } from "./backlog-manager";
import { BacklogItem, SDLC_PHASES, SDLCPhase, ApprovalResult } from "./types";

/**
 * Approval gate status
 */
export type GateStatus =
  | "pending" // Waiting for approval
  | "approved" // Approval received
  | "rejected" // Approval rejected
  | "timeout" // Approval timeout
  | "skipped"; // Gate skipped (not required)

/**
 * Configuration for approval gate
 */
export interface ApprovalGateConfig {
  /** Timeout in milliseconds (default: 24 hours) */
  timeout: number;
  /** Poll interval in milliseconds (default: 5 minutes) */
  pollInterval: number;
  /** Whether to wait or return immediately */
  waitForApproval: boolean;
  /** Comment to post when waiting for approval */
  pendingComment?: string;
}

const DEFAULT_CONFIG: ApprovalGateConfig = {
  timeout: 24 * 60 * 60 * 1000, // 24 hours
  pollInterval: 5 * 60 * 1000, // 5 minutes
  waitForApproval: false, // Non-blocking by default
  pendingComment: undefined,
};

/**
 * Manages approval gates for SDLC phases
 */
export class ApprovalGate {
  private backlogManager: BacklogManager;
  private config: ApprovalGateConfig;

  constructor(
    backlogManager: BacklogManager,
    config: Partial<ApprovalGateConfig> = {},
  ) {
    this.backlogManager = backlogManager;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if a phase requires approval
   */
  requiresApproval(phase: SDLCPhase): boolean {
    return phase.requiresApproval;
  }

  /**
   * Check if approval has been received for a phase
   */
  async checkApproval(
    issueNumber: number,
    phase: SDLCPhase,
  ): Promise<ApprovalResult> {
    if (!phase.approvalLabel) {
      return { approved: false };
    }

    const hasApproval = await this.backlogManager.checkApproval(
      issueNumber,
      phase.id,
    );

    if (hasApproval) {
      return {
        approved: true,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      approved: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Wait for approval (blocking)
   *
   * Polls GitHub until approval is received or timeout occurs
   */
  async waitForApproval(
    issueNumber: number,
    phase: SDLCPhase,
  ): Promise<ApprovalResult> {
    if (!phase.requiresApproval || !phase.approvalLabel) {
      return { approved: true }; // Skip if no approval needed
    }

    const startTime = Date.now();
    const issueUrl = `https://github.com/${this.backlogManager["config"].owner}/${this.backlogManager["config"].repo}/issues/${issueNumber}`;

    // Post pending comment
    await this.backlogManager.addComment(
      issueNumber,
      this.config.pendingComment ||
        `⏳ **Approval Required**: Waiting for human review before proceeding to next phase.\n\n` +
          `Phase: **${phase.name}**\n\n` +
          `Please review the output above and add the \`${phase.approvalLabel}\` label to approve, ` +
          `or comment with feedback if changes are needed.\n\n` +
          `[View Issue](${issueUrl})`,
    );

    // Poll for approval
    while (Date.now() - startTime < this.config.timeout) {
      const result = await this.checkApproval(issueNumber, phase);

      if (result.approved) {
        await this.backlogManager.addComment(
          issueNumber,
          `✅ **Approval Received**: ${phase.name} phase approved. Continuing pipeline...`,
        );
        return result;
      }

      // Check for rejection comments (optional enhancement)
      // Could parse recent comments for "reject" keywords

      // Wait before next poll
      await this.sleep(this.config.pollInterval);
    }

    // Timeout reached
    await this.backlogManager.addComment(
      issueNumber,
      `⏰ **Approval Timeout**: No approval received within ${this.config.timeout / (60 * 60 * 1000)} hours.\n\n` +
        `The pipeline has paused. Add the \`${phase.approvalLabel}\` label to resume.`,
    );

    return {
      approved: false,
      feedback: "Timeout waiting for approval",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process approval gate (non-blocking or blocking based on config)
   */
  async processGate(
    item: BacklogItem,
    phase: SDLCPhase,
  ): Promise<{ status: GateStatus; result?: ApprovalResult }> {
    if (!phase.requiresApproval) {
      return { status: "skipped" };
    }

    // Check if already approved
    const existingApproval = await this.checkApproval(item.issue.number, phase);

    if (existingApproval.approved) {
      return { status: "approved", result: existingApproval };
    }

    if (!this.config.waitForApproval) {
      // Non-blocking: just report status
      return { status: "pending" };
    }

    // Blocking: wait for approval
    const result = await this.waitForApproval(item.issue.number, phase);

    if (result.approved) {
      return { status: "approved", result };
    }

    return { status: "timeout", result };
  }

  /**
   * Get all issues waiting for approval
   */
  async getIssuesWaitingForApproval(): Promise<BacklogItem[]> {
    const items = await this.backlogManager.getBacklogItems();
    return items.filter((item) => item.needsApproval && !item.approvalReceived);
  }

  /**
   * Get approval status summary for dashboard/reporting
   */
  async getApprovalStatusSummary(): Promise<{
    total: number;
    waiting: number;
    approved: number;
    byPhase: Record<string, { waiting: number; approved: number }>;
  }> {
    const items = await this.backlogManager.getBacklogItems();

    const summary = {
      total: items.length,
      waiting: 0,
      approved: 0,
      byPhase: {} as Record<string, { waiting: number; approved: number }>,
    };

    for (const item of items) {
      if (item.needsApproval) {
        const phaseId = item.currentPhase?.id || "unknown";

        if (!summary.byPhase[phaseId]) {
          summary.byPhase[phaseId] = { waiting: 0, approved: 0 };
        }

        if (item.approvalReceived) {
          summary.approved++;
          summary.byPhase[phaseId].approved++;
        } else {
          summary.waiting++;
          summary.byPhase[phaseId].waiting++;
        }
      }
    }

    return summary;
  }

  /**
   * Manually trigger approval for a phase (for testing/CLI)
   */
  async approvePhase(issueNumber: number, phaseId: string): Promise<void> {
    const phase = SDLC_PHASES.find((p) => p.id === phaseId);
    if (!phase?.approvalLabel) {
      throw new Error(`Phase ${phaseId} does not require approval`);
    }

    await this.backlogManager.addApprovalLabel(issueNumber, phaseId);

    await this.backlogManager.addComment(
      issueNumber,
      `✅ Phase **${phase.name}** approved via CLI. Continuing pipeline...`,
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create an ApprovalGate instance
 */
export function createApprovalGate(
  backlogManager: BacklogManager,
  config?: Partial<ApprovalGateConfig>,
): ApprovalGate {
  return new ApprovalGate(backlogManager, config);
}
