/**
 * Context Builder
 *
 * Builds detailed prompts for agents with project context,
 * ensuring agents have full information for autonomous work
 */

import * as fs from "fs/promises";
import * as path from "path";
import { BacklogItem, AgentType, SDLCPhase, PipelineContext } from "./types";

/**
 * Configuration for context building
 */
export interface ContextBuilderConfig {
  /** Root directory of the project */
  projectRoot: string;
  /** Maximum file size to include (bytes) */
  maxFileSize: number;
  /** Maximum context size (bytes) */
  maxContextSize: number;
  /** Files to always include */
  alwaysInclude: string[];
  /** File patterns to exclude */
  excludePatterns: string[];
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ContextBuilderConfig = {
  projectRoot: process.cwd(),
  maxFileSize: 100 * 1024, // 100KB
  maxContextSize: 500 * 1024, // 500KB
  alwaysInclude: [
    "package.json",
    "README.md",
    "QWEN.md",
    "tsconfig.json",
    "app.json",
  ],
  excludePatterns: [
    "node_modules",
    ".git",
    ".expo",
    "__tests__",
    "*.test.ts",
    "*.test.tsx",
    "build",
    "dist",
  ],
};

/**
 * Builds context prompts for agent invocations
 */
export class ContextBuilder {
  private config: ContextBuilderConfig;

  constructor(config: Partial<ContextBuilderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Build complete context for an agent
   */
  async buildContext(
    agentType: AgentType,
    backlogItem: BacklogItem,
    phase: SDLCPhase,
    previousResults: Array<{ phase: string; output: string }> = [],
  ): Promise<string> {
    const sections: string[] = [];

    // 1. Project overview
    sections.push(await this.buildProjectOverview());

    // 2. Issue details
    sections.push(this.buildIssueDetails(backlogItem));

    // 3. Phase-specific instructions
    sections.push(this.buildPhaseInstructions(phase, agentType));

    // 4. Previous results (for continuity)
    if (previousResults.length > 0) {
      sections.push(this.buildPreviousResults(previousResults));
    }

    // 5. Relevant files
    sections.push(await this.buildRelevantFiles(agentType, phase));

    // 6. Output expectations
    sections.push(this.buildOutputExpectations(phase, agentType));

    return sections.join("\n\n---\n\n");
  }

  /**
   * Build project overview section
   */
  private async buildProjectOverview(): Promise<string> {
    let overview = "# Project Context\n\n";
    overview += "## Project Structure\n";
    overview +=
      'This is a React Native + Expo fitness tracking application called "Trapp Tracker" (FitTrack Pro).\n\n';

    // Read QWEN.md if available
    try {
      const qwenPath = path.join(this.config.projectRoot, "QWEN.md");
      const qwenContent = await fs.readFile(qwenPath, "utf-8");
      overview += "## Project Documentation\n";
      overview += qwenContent.substring(0, 2000); // Limit size
      overview += "\n...(truncated)...\n";
    } catch {
      overview += "See QWEN.md for detailed project documentation.\n";
    }

    // Tech stack summary
    overview += "\n## Tech Stack\n";
    overview += "- **Frontend**: React Native 0.81.5, Expo SDK 55.0.6\n";
    overview += "- **Language**: TypeScript 5.9.2\n";
    overview += "- **Navigation**: React Navigation 6.x\n";
    overview += "- **Storage**: AsyncStorage\n";
    overview += "- **Backend**: Express.js with lowdb (optional)\n";
    overview += "- **Testing**: Jest + React Native Testing Library\n";

    return overview;
  }

  /**
   * Build issue details section
   */
  private buildIssueDetails(item: BacklogItem): string {
    const { issue, status, completedPhases, pendingPhases } = item;

    let details = "# Issue Details\n\n";
    details += `**Title**: ${issue.title}\n`;
    details += `**Issue #**: ${issue.number}\n`;
    details += `**URL**: ${issue.html_url}\n`;
    details += `**Status**: ${status}\n\n`;

    if (issue.body) {
      details += `**Description**:\n${issue.body}\n\n`;
    }

    details += `**Labels**: ${issue.labels
      .map((l) => (typeof l === "string" ? l : l.name))
      .join(", ")}\n\n`;

    details += `**Completed Phases**: ${completedPhases.join(", ") || "None"}\n`;
    details += `**Pending Phases**: ${pendingPhases.join(", ")}\n`;

    return details;
  }

  /**
   * Build phase-specific instructions
   */
  private buildPhaseInstructions(
    phase: SDLCPhase,
    agentType: AgentType,
  ): string {
    const instructions: Record<string, string> = {
      "product-planner": `
# Specification Phase Instructions

Your task is to create a comprehensive product specification for this feature.

## Deliverables:
1. **User Stories**: Write 3-5 user stories with acceptance criteria
2. **Functional Requirements**: List all required functionality
3. **Success Metrics**: Define how to measure success
4. **Edge Cases**: Identify potential edge cases and error scenarios
5. **Dependencies**: Note any dependencies on other features or systems

## Output Format:
- Use markdown formatting
- Be specific and actionable
- Consider both happy path and error cases
- Reference existing app patterns from QWEN.md
`,
      "software-architect": `
# Architecture Phase Instructions

Your task is to design the technical architecture for this feature.

## Deliverables:
1. **Architecture Decision Record (ADR)**: Document key technical decisions
2. **Data Models**: Define TypeScript interfaces/types
3. **Component Structure**: Outline React components needed
4. **API Design**: Specify any new API endpoints (if backend changes needed)
5. **State Management**: Describe how state will be managed
6. **Storage Strategy**: Explain data persistence approach

## Output Format:
- Create ADR in markdown format
- Include code snippets for new types/interfaces
- Reference existing patterns in src/ directory
- Consider offline-first architecture
`,
      "ux-ui-designer": `
# Design Phase Instructions

Your task is to create UI/UX designs for this feature.

## Deliverables:
1. **Wireframe Description**: Describe screen layouts and component placement
2. **User Flow**: Step-by-step user interaction flow
3. **Component Specifications**: Detail each UI component needed
4. **Accessibility Notes**: WCAG compliance considerations
5. **Responsive Behavior**: How design adapts to different screen sizes

## Design System:
- Use Material Community Icons (@expo/vector-icons)
- Follow theme constants in src/theme.ts
- Maintain consistency with existing screens

## Output Format:
- Describe layouts in detail (can't create actual images)
- Use ASCII wireframes if helpful
- Specify colors, spacing, typography from theme.ts
`,
      "expo-react-native-developer": `
# Development Phase Instructions

Your task is to implement the feature code based on previous phases.

## Requirements:
1. **Follow Existing Patterns**: Match code style in src/
2. **TypeScript**: Use strict typing, no 'any'
3. **Components**: Named exports for screen components
4. **Error Handling**: Implement proper error handling
5. **Testing**: Add basic tests for new functionality

## Code Conventions:
- React JSX transform (react-jsx)
- Async/await for async operations
- Functional components with hooks
- Proper prop typing

## Output Format:
- Provide complete file contents
- Include file path at top of each code block
- Explain any non-obvious implementation choices
`,
      "integration-tester": `
# Testing Phase Instructions

Your task is to validate the implementation works correctly.

## Test Coverage:
1. **Happy Path**: Verify main functionality works
2. **Edge Cases**: Test boundary conditions
3. **Error States**: Verify error handling
4. **Integration**: Test with existing features
5. **Performance**: Note any performance concerns

## Output Format:
- List test scenarios and expected results
- Provide actual test code if writing tests
- Report any bugs or issues found
- Suggest improvements
`,
      "code-reviewer": `
# Code Review Phase Instructions

Your task is to review the code for quality, security, and maintainability.

## Review Checklist:
1. **Security**: Check for vulnerabilities, exposed secrets
2. **Performance**: Identify N+1 queries, unnecessary re-renders
3. **Maintainability**: Code clarity, proper naming, comments
4. **Testing**: Verify adequate test coverage
5. **Conventions**: Ensure ESLint, TypeScript compliance
6. **Accessibility**: Check WCAG compliance

## Output Format:
- List issues by severity (Critical, High, Medium, Low)
- Provide specific code suggestions for fixes
- Approve only if no Critical/High issues remain
`,
    };

    return (
      instructions[agentType] ||
      `# ${phase.name} Phase\n\nExecute the ${phase.description} for this issue.`
    );
  }

  /**
   * Build previous results section
   */
  private buildPreviousResults(
    results: Array<{ phase: string; output: string }>,
  ): string {
    let section = "# Previous Phase Results\n\n";

    for (const result of results) {
      section += `## ${result.phase} Phase Output\n\n`;
      section += result.output.substring(0, 1500); // Limit size
      section += "\n...(truncated)...\n\n";
    }

    return section;
  }

  /**
   * Build relevant files section
   */
  private async buildRelevantFiles(
    agentType: AgentType,
    phase: SDLCPhase,
  ): Promise<string> {
    let section = "# Relevant Project Files\n\n";

    // Always include key config files
    for (const file of this.config.alwaysInclude) {
      const filePath = path.join(this.config.projectRoot, file);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        if (content.length < this.config.maxFileSize) {
          section += `## ${file}\n\`\`\`\n${content}\n\`\`\`\n\n`;
        } else {
          section += `## ${file}\n(File too large, see repository)\n\n`;
        }
      } catch {
        // File doesn't exist, skip
      }
    }

    // Include phase-specific files
    const phaseFiles = this.getPhaseSpecificFiles(agentType, phase);
    for (const filePattern of phaseFiles) {
      try {
        const fullPath = path.join(this.config.projectRoot, filePattern);
        const content = await fs.readFile(fullPath, "utf-8");
        if (content.length < this.config.maxFileSize) {
          section += `## ${filePattern}\n\`\`\`\n${content}\n\`\`\`\n\n`;
        }
      } catch {
        // File doesn't exist, skip
      }
    }

    return section;
  }

  /**
   * Get files relevant to specific phase
   */
  private getPhaseSpecificFiles(
    agentType: AgentType,
    phase: SDLCPhase,
  ): string[] {
    const files: Record<AgentType, string[]> = {
      "product-planner": ["src/screens/", "src/models.ts"],
      "software-architect": ["src/models.ts", "src/storage.ts", "src/auth/"],
      "ux-ui-designer": ["src/theme.ts", "src/components/", "src/screens/"],
      "expo-react-native-developer": ["src/", "App.tsx", "app.json"],
      "express-backend-engineer": ["backend/"],
      "api-tester": ["backend/", "src/storage.ts"],
      "ui-tester": ["src/screens/", "src/components/", "__tests__/"],
      "integration-tester": ["src/", "backend/", "__tests__/"],
      "code-reviewer": ["src/", "backend/", "package.json", "tsconfig.json"],
      "devops-ci-engineer": [".github/", "package.json", "app.json"],
    };

    return files[agentType] || [];
  }

  /**
   * Build output expectations
   */
  private buildOutputExpectations(
    phase: SDLCPhase,
    agentType: AgentType,
  ): string {
    return `# Output Expectations

## For This Phase (${phase.name}):
- ${phase.description}
- Provide clear, actionable output
- Reference existing project patterns
- Consider the full SDLC context

## Response Format:
- Use markdown for clarity
- Include code blocks with file paths
- Explain reasoning for key decisions
- Be concise but thorough`;
  }

  /**
   * Build context for a specific agent type with custom additions
   */
  async buildCustomContext(
    agentType: AgentType,
    backlogItem: BacklogItem,
    phase: SDLCPhase,
    customSections: Array<{ title: string; content: string }> = [],
    previousResults: Array<{ phase: string; output: string }> = [],
  ): Promise<string> {
    const baseContext = await this.buildContext(
      agentType,
      backlogItem,
      phase,
      previousResults,
    );

    if (customSections.length > 0) {
      const customSection = [
        "\n\n---\n\n# Custom Context\n",
        ...customSections.map((s) => `## ${s.title}\n\n${s.content}`),
      ].join("\n");

      return baseContext + customSection;
    }

    return baseContext;
  }
}

/**
 * Create a ContextBuilder instance with project defaults
 */
export function createContextBuilder(projectRoot?: string): ContextBuilder {
  return new ContextBuilder({
    projectRoot: projectRoot || process.cwd(),
  });
}
