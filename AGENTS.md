# Agentic SDLC Pipeline

Automated software development lifecycle using AI agents to process GitHub Issues through a structured pipeline with human approval gates.

## Overview

The Agentic SDLC Pipeline automates the software development process by routing backlog items (GitHub Issues) through specialized AI agents:

```
GitHub Issue → Product Planner → Software Architect → UX/UI Designer → Developer → Tester → Code Reviewer → Done
     ↓              ↓                   ↓                    ↓              ↓         ↓            ↓
  Backlog      Spec Writing      Architecture          Design        Development  Testing   Review
     ↓              ↓                   ↓                    ↓              ↓         ↓            ↓
  [APPROVAL]     [APPROVAL]         [APPROVAL]                              [APPROVAL]
```

## Features

- **GitHub Issues Integration**: Uses GitHub Issues as your backlog management system
- **Specialized Agents**: 9 different agent types for different SDLC phases
- **Approval Gates**: Human review checkpoints at critical phases
- **Hybrid Triggering**: Manual CLI + GitHub Actions automation
- **Watch Mode**: Continuous background processing
- **Audit Trail**: All agent outputs posted as issue comments

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file or set environment variables:

```bash
# Required: GitHub Personal Access Token
GITHUB_TOKEN=ghp_your_token_here

# Required: Repository info
GITHUB_REPO_OWNER=neuroshell
GITHUB_REPO_NAME=trapp

# Optional: Configuration
AGENT_TIMEOUT=300000        # 5 minutes per agent
AGENT_CONCURRENCY=3         # Max concurrent agents
APPROVAL_TIMEOUT=86400000   # 24 hours for approval
```

### 3. Create a GitHub Token

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate a new token with these scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Actions workflows)
3. Copy the token and add it to your `.env` file

### 4. Label Your Issues

Add the `backlog-item` label to any GitHub Issue you want processed:

```
# In GitHub Issues:
1. Create a new issue describing your feature/bug
2. Add label: `backlog-item`
3. The pipeline will pick it up automatically
```

### 5. Run the Pipeline

**Manual (CLI):**

```bash
# Process all ready items
npm run agents:process

# Process specific issue
npm run agents:issue -- --issue=123

# Watch mode (continuous)
npm run agents:watch

# Dry run (simulate)
npm run agents:process -- --dry-run
```

**Automated (GitHub Actions):**

- Pipeline runs every hour automatically
- Triggered when `backlog-item` label is added
- Manual trigger via Actions tab → "Agentic SDLC Pipeline" → "Run workflow"

## SDLC Phases

| Phase             | Agent                         | Description                                        | Approval Required |
| ----------------- | ----------------------------- | -------------------------------------------------- | ----------------- |
| **Specification** | `product-planner`             | Define user stories, requirements, success metrics | ✅ Yes            |
| **Architecture**  | `software-architect`          | Design technical architecture, data models, ADRs   | ✅ Yes            |
| **Design**        | `ux-ui-designer`              | Create UI/UX designs, wireframes, user flows       | ✅ Yes            |
| **Development**   | `expo-react-native-developer` | Implement the feature code                         | ❌ No             |
| **Testing**       | `integration-tester`          | Run integration tests, validate functionality      | ❌ No             |
| **Code Review**   | `code-reviewer`               | Review code quality, security, maintainability     | ✅ Yes            |

## Approval Gates

At approval phases, the pipeline:

1. **Posts output** to the GitHub Issue as a comment
2. **Pauses execution** and waits for human review
3. **Requires label** to be added (e.g., `spec-approved`, `architecture-approved`)
4. **Resumes** when approval label is detected

### Approval Labels

| Phase         | Approval Label          |
| ------------- | ----------------------- |
| Specification | `spec-approved`         |
| Architecture  | `architecture-approved` |
| Design        | `design-approved`       |
| Code Review   | `review-approved`       |

### How to Approve

1. Review the agent output in the issue comments
2. If satisfied, add the approval label:
   ```bash
   # Via GitHub UI: Add label to issue
   # Or via CLI:
   gh issue edit <number> --add-label spec-approved
   ```
3. Pipeline automatically resumes on next run

## GitHub Actions Workflow

The workflow (`.github/workflows/agents-pipeline.yml`) triggers on:

- **Issue labeled** with `backlog-item`
- **Schedule**: Every hour (`0 * * * *`)
- **Manual**: Via Actions tab
- **Push**: To main branch

### Workflow Outputs

- **Comments**: Agent results posted to issues
- **Labels**: Status labels updated automatically
- **PRs**: Auto-created for code changes
- **Branches**: `agent-pipeline/auto-<run_id>`

## Architecture

```
scripts/agents/
├── types.ts              # TypeScript types and interfaces
├── backlog-manager.ts    # GitHub Issues API wrapper
├── context-builder.ts    # Agent prompt builder
├── approval-gate.ts      # Approval gate logic
└── process-backlog.ts    # Main orchestrator
```

### Key Components

**BacklogManager**: Handles GitHub API interactions

- Fetch issues with `backlog-item` label
- Update status labels
- Post comments with agent results
- Check for approval labels

**ContextBuilder**: Builds detailed prompts for agents

- Includes project documentation (QWEN.md)
- Adds relevant source files
- Provides phase-specific instructions
- Maintains continuity with previous results

**ApprovalGate**: Manages human review checkpoints

- Polls for approval labels
- Posts pending/approved notifications
- Supports timeout configuration
- Non-blocking in watch mode

**PipelineOrchestrator**: Main execution engine

- Chains agents in correct order
- Handles approval gates
- Manages errors and retries
- Updates issue status throughout

## Usage Examples

### Example 1: Add a New Feature

```bash
# 1. Create GitHub Issue
# Title: "Add workout history chart"
# Body: "Users should see a weekly chart of their workouts"
# Label: backlog-item

# 2. Run pipeline
npm run agents:process

# 3. Review each phase output in issue comments
# 4. Add approval labels as phases complete
# 5. Merge the auto-created PR
```

### Example 2: Fix a Bug

```bash
# 1. Create Issue with bug description
# 2. Add labels: backlog-item, bug
# 3. Pipeline processes automatically (hourly)
# 4. Review and merge PR
```

### Example 3: Process Specific Issue

```bash
# Process only issue #42
npm run agents:issue -- --issue=42
```

### Example 4: Watch Mode Development

```bash
# Continuous processing during development
npm run agents:watch

# Processes new items every 60 seconds
# Press Ctrl+C to stop
```

## Configuration

### Environment Variables

| Variable            | Required | Description                                     |
| ------------------- | -------- | ----------------------------------------------- |
| `GITHUB_TOKEN`      | ✅       | GitHub Personal Access Token                    |
| `GITHUB_REPO_OWNER` | ✅       | Repository owner (e.g., `facebook`)             |
| `GITHUB_REPO_NAME`  | ✅       | Repository name (e.g., `react`)                 |
| `AGENT_TIMEOUT`     | ❌       | Timeout per agent in ms (default: 300000)       |
| `APPROVAL_TIMEOUT`  | ❌       | Approval wait time in ms (default: 86400000)    |
| `POLL_INTERVAL`     | ❌       | GitHub polling interval in ms (default: 300000) |

### Customizing Phases

Edit `scripts/agents/types.ts` to modify the `SDLC_PHASES` array:

```typescript
export const SDLC_PHASES: SDLCPhase[] = [
  {
    id: "spec",
    name: "Specification",
    agent: "product-planner",
    statusLabel: "spec-writing",
    requiresApproval: true,
    approvalLabel: "spec-approved",
    description: "Define feature scope",
  },
  // Add/remove/modify phases here
];
```

## Troubleshooting

### Pipeline Not Running

**Check:**

1. GitHub token is valid and has correct scopes
2. Issue has `backlog-item` label
3. Workflow is enabled in repository settings
4. Check Actions tab for error logs

### Approval Not Detected

**Check:**

1. Approval label is spelled correctly (case-sensitive)
2. Pipeline has run since label was added
3. Check issue comments for approval status

### Agent Timeout

**Solutions:**

1. Increase `AGENT_TIMEOUT` environment variable
2. Check if agent is stuck on large context
3. Review agent output for errors

### GitHub API Rate Limits

**Solutions:**

1. Use a Personal Access Token (higher limits)
2. Increase `POLL_INTERVAL` to reduce API calls
3. For large repos, consider GitHub App authentication

## Best Practices

1. **Write Clear Issues**: Detailed descriptions = better agent output
2. **Review Thoroughly**: Approval gates are your quality control
3. **Start Small**: Test with simple issues first
4. **Monitor Logs**: Check Actions tab for pipeline status
5. **Iterate**: Refine prompts and phases based on results

## Limitations

- **Agent Integration**: Currently a framework - requires Qwen Code API integration
- **Context Size**: Large projects may exceed token limits
- **Complex Features**: May need manual intervention for complex changes
- **Testing**: Agent-generated tests need human validation

## Future Enhancements

- [ ] Qwen Code API integration for actual agent execution
- [ ] Parallel agent execution for independent tasks
- [ ] Slack/Discord notifications for approval requests
- [ ] Dashboard for pipeline status visualization
- [ ] Custom agent prompts per project
- [ ] A/B testing for agent strategies

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

---

**Need Help?** Check the [GitHub Issues](https://github.com/your-repo/trapp/issues) or contact the maintainers.
