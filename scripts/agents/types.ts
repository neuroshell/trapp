/**
 * Agentic SDLC Pipeline Types
 * 
 * Type definitions for the automated agent orchestration system
 */

/**
 * GitHub Issue status in the backlog pipeline
 */
export type IssueStatus = 
  | 'backlog'           // Newly created, not yet processed
  | 'spec-writing'      // Product planner is working
  | 'spec-approved'     // Specification approved by human
  | 'architecture'      // Architect is working
  | 'architecture-approved'  // Architecture approved
  | 'design'            // UX/UI designer is working
  | 'design-approved'    // Design approved
  | 'development'       // Developer is working
  | 'testing'           // Testers are working
  | 'review'            // Code reviewer is working
  | 'ready-to-merge'    // Awaiting human merge
  | 'done';             // Issue completed

/**
 * Agent types available in the SDLC pipeline
 */
export type AgentType =
  | 'product-planner'
  | 'software-architect'
  | 'ux-ui-designer'
  | 'expo-react-native-developer'
  | 'express-backend-engineer'
  | 'api-tester'
  | 'ui-tester'
  | 'integration-tester'
  | 'code-reviewer'
  | 'devops-ci-engineer';

/**
 * SDLC Phase configuration
 */
export interface SDLCPhase {
  /** Unique phase identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Agent type to invoke */
  agent: AgentType;
  /** Status label when in this phase */
  statusLabel: IssueStatus;
  /** Requires human approval before proceeding */
  requiresApproval: boolean;
  /** Approval label to look for */
  approvalLabel?: string;
  /** Description of what this phase does */
  description: string;
}

/**
 * GitHub Issue representation from API
 */
export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  labels: string[];
  created_at: string;
  updated_at: string;
  html_url: string;
  user: {
    login: string;
  };
}

/**
 * Parsed backlog item with pipeline metadata
 */
export interface BacklogItem {
  issue: GitHubIssue;
  currentPhase: SDLCPhase | null;
  status: IssueStatus;
  completedPhases: string[];
  pendingPhases: string[];
  needsApproval: boolean;
  approvalReceived: boolean;
}

/**
 * Agent invocation result
 */
export interface AgentResult {
  success: boolean;
  phase: string;
  output: string;
  artifacts?: {
    type: 'code' | 'document' | 'test' | 'config';
    path?: string;
    content?: string;
    description: string;
  }[];
  error?: string;
}

/**
 * Approval gate result
 */
export interface ApprovalResult {
  approved: boolean;
  feedback?: string;
  timestamp?: string;
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  /** GitHub repository owner */
  owner: string;
  /** GitHub repository name */
  repo: string;
  /** GitHub token for API access */
  token: string;
  /** Maximum concurrent agents */
  maxConcurrency: number;
  /** Timeout per agent in milliseconds */
  agentTimeout: number;
  /** Whether to auto-create PRs */
  autoCreatePR: boolean;
  /** Branch prefix for agent-generated code */
  branchPrefix: string;
}

/**
 * Pipeline execution context
 */
export interface PipelineContext {
  item: BacklogItem;
  config: OrchestratorConfig;
  previousResults: AgentResult[];
  currentPhase: SDLCPhase;
  projectRoot: string;
}

/**
 * Standard SDLC pipeline phases in order
 */
export const SDLC_PHASES: SDLCPhase[] = [
  {
    id: 'spec',
    name: 'Specification',
    agent: 'product-planner',
    statusLabel: 'spec-writing',
    requiresApproval: true,
    approvalLabel: 'spec-approved',
    description: 'Define feature scope, user stories, and success metrics',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    agent: 'software-architect',
    statusLabel: 'architecture',
    requiresApproval: true,
    approvalLabel: 'architecture-approved',
    description: 'Design system architecture and technical decisions',
  },
  {
    id: 'design',
    name: 'Design',
    agent: 'ux-ui-designer',
    statusLabel: 'design',
    requiresApproval: true,
    approvalLabel: 'design-approved',
    description: 'Create UI/UX designs and wireframes',
  },
  {
    id: 'development',
    name: 'Development',
    agent: 'expo-react-native-developer',
    statusLabel: 'development',
    requiresApproval: false,
    description: 'Implement the feature code',
  },
  {
    id: 'testing',
    name: 'Testing',
    agent: 'integration-tester',
    statusLabel: 'testing',
    requiresApproval: false,
    description: 'Run integration and end-to-end tests',
  },
  {
    id: 'review',
    name: 'Code Review',
    agent: 'code-reviewer',
    statusLabel: 'review',
    requiresApproval: true,
    approvalLabel: 'review-approved',
    description: 'Review code for quality, security, and maintainability',
  },
];

/**
 * Map status labels to phases
 */
export function getPhaseByStatusLabel(statusLabel: IssueStatus): SDLCPhase | null {
  return SDLC_PHASES.find(phase => phase.statusLabel === statusLabel) || null;
}

/**
 * Get next phase for a backlog item
 */
export function getNextPhase(currentPhaseId: string | null): SDLCPhase | null {
  if (!currentPhaseId) {
    return SDLC_PHASES[0];
  }
  const currentIndex = SDLC_PHASES.findIndex(p => p.id === currentPhaseId);
  if (currentIndex === -1 || currentIndex >= SDLC_PHASES.length - 1) {
    return null;
  }
  return SDLC_PHASES[currentIndex + 1];
}
