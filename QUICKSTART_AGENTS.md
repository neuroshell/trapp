# Quick Start: Agentic SDLC Pipeline

Get your automated development pipeline running in 5 minutes!

## Step 1: Run Setup (2 minutes)

```bash
# Interactive setup - configures your GitHub token
npm run agents:setup
```

This will:
- Create your `.env` file with GitHub credentials
- Verify dependencies are installed
- Check workflow configuration

## Step 2: Create Your First Backlog Item (1 minute)

1. Go to your GitHub repository Issues tab
2. Click "New Issue"
3. Write a description (e.g., "Add push notification for workout reminders")
4. Add the label: `backlog-item`

## Step 3: Run the Pipeline (30 seconds)

```bash
# Process all ready backlog items
npm run agents:process
```

Watch as agents process your issue through:
- ✅ Specification (product-planner)
- ⏳ **Approval Required** - Add `spec-approved` label to continue
- ✅ Architecture (software-architect)
- ⏳ **Approval Required** - Add `architecture-approved` label
- ✅ Design (ux-ui-designer)
- ⏳ **Approval Required** - Add `design-approved` label
- ✅ Development (expo-react-native-developer)
- ✅ Testing (integration-tester)
- ✅ Code Review (code-reviewer)
- ⏳ **Approval Required** - Add `review-approved` label
- 🎉 **Done!**

## Commands Cheat Sheet

| Command | Description |
|---------|-------------|
| `npm run agents:setup` | Interactive setup wizard |
| `npm run agents:process` | Process all ready items |
| `npm run agents:issue -- --issue=123` | Process specific issue #123 |
| `npm run agents:watch` | Continuous processing (watch mode) |
| `npm run agents:process -- --dry-run` | Simulate without making changes |

## Approval Workflow

When pipeline pauses for approval:

1. **Review** the agent output in GitHub Issue comments
2. **Approve** by adding the approval label:
   ```bash
   # Via GitHub UI or CLI:
   gh issue edit 123 --add-label spec-approved
   ```
3. **Resume** pipeline:
   ```bash
   npm run agents:process
   ```

## Automation (Optional)

The pipeline runs automatically via GitHub Actions:
- **Every hour** on schedule
- **When you label** an issue with `backlog-item`
- **Manual trigger** via Actions tab

No need to run CLI commands after setup!

## Troubleshooting

**"No items ready for processing"**
- Make sure your issue has the `backlog-item` label

**"Approval timeout"**
- Add the approval label manually in GitHub

**"GitHub API error"**
- Check your token has `repo` and `workflow` scopes
- Verify token in `.env` file

## Next Steps

1. Read `AGENTS.md` for detailed documentation
2. Customize phases in `scripts/agents/types.ts`
3. Set up team approval workflows
4. Configure Slack/Discord notifications

---

**Need help?** See `AGENTS.md` or create an issue.
