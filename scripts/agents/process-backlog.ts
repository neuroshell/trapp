#!/usr/bin/env ts-node
/**
 * Agentic SDLC Pipeline Orchestrator
 * 
 * Main entry point for processing backlog items through the agent pipeline
 * 
 * Usage:
 *   npm run agents:process              # Process all ready items
 *   npm run agents:process -- --issue=123  # Process specific issue
 *   npm run agents:process -- --watch      # Watch mode (continuous)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Command } from 'commander';
import {
  BacklogManager,
  createBacklogManagerFromEnv,
} from './backlog-manager';
import { ContextBuilder, createContextBuilder } from './context-builder';
import { ApprovalGate, createApprovalGate } from './approval-gate';
import {
  BacklogItem,
  SDLC_PHASES,
  SDLCPhase,
  AgentType,
  AgentResult,
  getNextPhase,
  IssueStatus,
} from './types';

/**
 * Orchestrator configuration
 */
interface OrchestratorConfig {
  backlogManager: BacklogManager;
  contextBuilder: ContextBuilder;
  approvalGate: ApprovalGate;
  projectRoot: string;
  dryRun: boolean;
  verbose: boolean;
}

/**
 * CLI options
 */
interface CLIOptions {
  issue?: number;
  watch?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  phase?: string;
}

/**
 * Main orchestrator class
 */
class PipelineOrchestrator {
  private config: OrchestratorConfig;
  private isRunning = false;

  constructor(config: OrchestratorConfig) {
    this.config = config;
  }

  /**
   * Process a single backlog item through the pipeline
   */
  async processItem(item: BacklogItem): Promise<void> {
    const { verbose, dryRun } = this.config;

    this.log(`\n📋 Processing Issue #${item.issue.number}: ${item.issue.title}`);
    this.log(`   Status: ${item.status}`);
    this.log(`   Current Phase: ${item.currentPhase?.name || 'None'}`);

    if (dryRun) {
      this.log('   [DRY RUN] No actions will be taken');
    }

    // Determine starting phase
    let currentPhase = item.currentPhase;
    
    // If no current phase, start from beginning
    if (!currentPhase) {
      currentPhase = SDLC_PHASES[0];
      if (!dryRun) {
        await this.config.backlogManager.updateStatus(
          item.issue.number,
          currentPhase.statusLabel
        );
      }
    }

    // Process through phases
    while (currentPhase) {
      this.log(`\n▶️  Phase: ${currentPhase.name}`);

      // Check approval gate
      if (currentPhase.requiresApproval && !item.approvalReceived) {
        this.log(`   ⏳ Waiting for approval (${currentPhase.approvalLabel})`);
        
        const gateResult = await this.config.approvalGate.processGate(
          item,
          currentPhase
        );

        if (gateResult.status === 'pending') {
          this.log(`   ⏸️  Paused: Waiting for human approval`);
          break; // Exit, will continue on next run
        }

        if (gateResult.status === 'timeout') {
          this.log(`   ⏰ Timeout: Approval not received`);
          break;
        }
      }

      // Execute agent for this phase
      const result = await this.executeAgent(item, currentPhase);

      if (!result.success) {
        this.log(`   ❌ Phase failed: ${result.error}`);
        
        if (!dryRun) {
          await this.config.backlogManager.addComment(
            item.issue.number,
            `❌ **${currentPhase.name} Phase Failed**\n\nError: ${result.error}\n\nPlease investigate and retry.`
          );
        }
        break;
      }

      this.log(`   ✅ Phase completed successfully`);

      // Post result to issue
      if (!dryRun) {
        await this.config.backlogManager.addComment(
          item.issue.number,
          `## ✅ ${currentPhase.name} Phase Complete\n\n${result.output}`
        );
      }

      // Move to next phase
      const nextPhase = getNextPhase(currentPhase.id);
      
      if (!nextPhase) {
        // All phases complete
        this.log(`\n🎉 All phases complete!`);
        
        if (!dryRun) {
          await this.config.backlogManager.updateStatus(
            item.issue.number,
            'done'
          );
          await this.config.backlogManager.addComment(
            item.issue.number,
            `🎉 **Issue Complete!** All SDLC phases finished successfully.`
          );
        }
        break;
      }

      currentPhase = nextPhase;
      item.currentPhase = nextPhase;

      // Update status
      if (!dryRun) {
        await this.config.backlogManager.updateStatus(
          item.issue.number,
          nextPhase.statusLabel
        );
      }
    }
  }

  /**
   * Execute an agent for a specific phase
   */
  private async executeAgent(
    item: BacklogItem,
    phase: SDLCPhase
  ): Promise<AgentResult> {
    const agentType = phase.agent;
    this.log(`   🤖 Invoking agent: ${agentType}`);

    try {
      // Build context for the agent
      const context = await this.config.contextBuilder.buildContext(
        agentType,
        item,
        phase,
        [] // TODO: Pass previous results
      );

      // In a real implementation, this would call Qwen Code's task tool
      // For now, we simulate the agent invocation
      this.log(`   📝 Context built (${context.length} chars)`);
      
      // TODO: Integrate with Qwen Code API to invoke agents
      // For now, return a placeholder result
      return {
        success: true,
        phase: phase.id,
        output: `[${agentType}] Phase executed. (Agent integration pending)`,
        artifacts: [],
      };
    } catch (error) {
      return {
        success: false,
        phase: phase.id,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process all ready backlog items
   */
  async processAll(): Promise<void> {
    if (this.isRunning) {
      this.log('⚠️  Pipeline already running');
      return;
    }

    this.isRunning = true;

    try {
      this.log('\n🚀 Starting Agentic SDLC Pipeline');
      this.log('================================');

      // Get items ready for processing
      const items = await this.config.backlogManager.getIssuesReadyForNextPhase();
      
      if (items.length === 0) {
        this.log('✅ No items ready for processing');
        return;
      }

      this.log(`📦 Found ${items.length} item(s) to process`);

      // Process each item
      for (const item of items) {
        await this.processItem(item);
      }

      this.log('\n✅ Pipeline run complete');
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process a specific issue
   */
  async processIssue(issueNumber: number): Promise<void> {
    this.log(`\n🎯 Processing specific issue #${issueNumber}`);
    
    const item = await this.config.backlogManager.getIssue(issueNumber);
    await this.processItem(item);
  }

  /**
   * Run in watch mode (continuous processing)
   */
  async runWatchMode(intervalMs: number = 60000): Promise<void> {
    this.log('\n👁️  Starting watch mode...');
    this.log(`   Polling every ${intervalMs / 1000} seconds`);
    this.log('   Press Ctrl+C to stop');

    while (true) {
      await this.processAll();
      await this.sleep(intervalMs);
    }
  }

  /**
   * Log message (respects verbose flag)
   */
  private log(message: string): void {
    if (this.config.verbose || !message.startsWith('   ')) {
      console.log(message);
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Main entry point
 */
async function main() {
  const program = new Command();

  program
    .name('agents:process')
    .description('Process backlog items through the agentic SDLC pipeline')
    .option('--issue <number>', 'Process specific issue number')
    .option('--watch', 'Run in watch mode (continuous processing)')
    .option('--dry-run', 'Simulate without making changes')
    .option('--verbose', 'Show detailed output')
    .option('--phase <phase>', 'Start from specific phase')
    .action(async (options: CLIOptions) => {
      try {
        // Initialize components
        const backlogManager = createBacklogManagerFromEnv();
        const contextBuilder = createContextBuilder(process.cwd());
        const approvalGate = createApprovalGate(backlogManager, {
          waitForApproval: !options.watch, // Blocking in non-watch mode
          pollInterval: 5 * 60 * 1000,     // 5 minutes
          timeout: 24 * 60 * 60 * 1000,    // 24 hours
        });

        const orchestrator = new PipelineOrchestrator({
          backlogManager,
          contextBuilder,
          approvalGate,
          projectRoot: process.cwd(),
          dryRun: options.dryRun ?? false,
          verbose: options.verbose ?? true,
        });

        // Execute based on options
        if (options.issue) {
          await orchestrator.processIssue(parseInt(options.issue, 10));
        } else if (options.watch) {
          await orchestrator.runWatchMode(60000); // 1 minute interval
        } else {
          await orchestrator.processAll();
        }
      } catch (error) {
        console.error('❌ Pipeline error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  program.parse();
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { PipelineOrchestrator, main };
