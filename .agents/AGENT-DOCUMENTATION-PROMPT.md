# Agent Documentation System: Prompt Template

**Use this prompt in your `.cursorrules` or project rules file to enable the agent documentation system.**

---

## Context Management System

This project uses a structured `.agents` directory for efficient context management. Follow these rules:

### On Every New Session

1. **Always read first:** `.agents/context.md` (~500 tokens)
2. **Then read:** `.agents/current-focus.md` (~260 tokens)
3. **Check:** `.agents/backlog.md` (~1,200 tokens) - For priorities and bugs
4. **If needed:** `.agents/docs/MVP-SUMMARY.md` (~830 tokens) - For feature details

**Total context: ~1,960-2,790 tokens** ✅

### Avoid Reading Unless Necessary

- `.agents/docs/PRD.md` (5000 tokens) - Only for deep feature implementation
- `.agents/docs/VISION.md` (7000 tokens) - Only for future planning
- `.agents/docs/REFERENCES.md` (1500 tokens) - Only for UI design questions
- `.agents/docs/STATUS.md` (1000+ tokens) - Only for understanding project history

### Directory Structure

```
.agents/
├── context.md                    # Project overview (~500 tokens) - READ FIRST
├── current-focus.md             # What we're working on now (~260 tokens)
├── backlog.md                   # Bugs, ideas, improvements (~1,200 tokens)
├── decisions.md                 # Key decisions quick reference (~1,800 tokens)
├── decisions-detailed.md        # Detailed implementation notes (when needed)
├── plans.md                     # Index of all implementation plans
└── docs/                        # Detailed documentation (read when needed)
    ├── PRD.md                   # Product Requirements Document
    ├── MVP-SUMMARY.md           # MVP scope and features
    ├── STATUS.md                # Complete project status and history
    ├── VISION.md                # Long-term vision (future planning)
    ├── REFERENCES.md            # UI/UX reference images and notes
    ├── plans/                   # Date-prefixed implementation plans
    │   └── YYYY-MM-DD-description.md
    └── references/              # Reference images, screenshots
```

### Document Purposes

**Core Documents (Read Every Session):**

- **`context.md`** - Project overview, MVP scope, tech stack, current phase
- **`current-focus.md`** - What we're working on now, recent completions, next steps
- **`backlog.md`** - Bugs (P0-P3), enhancements, ideas, completed items

**Reference Documents (Read When Needed):**

- **`decisions.md`** - Quick reference for architectural/product/design decisions
- **`decisions-detailed.md`** - Full implementation details with code examples
- **`plans.md`** - Index of all implementation plans by date and category

**Detailed Documentation (Read When Needed):**

- **`docs/PRD.md`** - Complete product requirements (read for major features)
- **`docs/MVP-SUMMARY.md`** - MVP scope boundaries (read for feature planning)
- **`docs/STATUS.md`** - Project history and progress (read for context)
- **`docs/VISION.md`** - Long-term roadmap (read for future planning)
- **`docs/plans/YYYY-MM-DD-*.md`** - Specific implementation plans (read when implementing)

### When Making Changes

1. **Update `current-focus.md`** - Set session focus, update completions
2. **Update `backlog.md`** - Add bugs/ideas, move completed items
3. **Update `decisions.md`** - Document architectural/product decisions
4. **Create plan document** - For complex implementations (in `docs/plans/`)
5. **Update `plans.md` index** - Add entry for new plans

### When Completing Work

1. **Update `current-focus.md`** - Move work to "just completed" section
2. **Update `backlog.md`** - Move items to "completed" section with date/reference
3. **Update `decisions.md`** - Document any decisions made during work
4. **Update `docs/STATUS.md`** - Track progress and milestones (if exists)

### Content Guidelines

- **Be concise** - Respect token budgets (context.md ~500, current-focus.md ~260)
- **Be specific** - Use concrete examples, avoid vague language
- **Be actionable** - Focus on what to do, not just what is
- **Include dates** - Track when decisions/plans were made
- **Link documents** - Cross-reference related content
- **Remove outdated info** - Keep documents current, archive old plans after 90 days

### Token Budget Management

**Initial Context (Every Session):**
- `context.md`: ~500 tokens
- `current-focus.md`: ~260 tokens
- `backlog.md`: ~1,200 tokens
- **Total:** ~1,960 tokens

**Optional (When Needed):**
- `decisions.md`: ~1,800 tokens
- `docs/MVP-SUMMARY.md`: ~830 tokens
- **Total with optional:** ~4,590 tokens

**Avoid Unless Necessary:**
- `docs/PRD.md`: 5,000+ tokens
- `docs/VISION.md`: 7,000+ tokens
- `docs/STATUS.md`: 1,000+ tokens

### Workflow Example

**Starting a new session:**
1. Read `context.md` → Understand project
2. Read `current-focus.md` → Know what to work on
3. Read `backlog.md` → Check for bugs/priorities
4. If implementing feature → Read `docs/MVP-SUMMARY.md` for scope
5. If making decision → Read `decisions.md` for context

**During work:**
- Discover bug → Add to `backlog.md`
- Make decision → Update `decisions.md`
- Complex implementation → Create plan in `docs/plans/`

**Ending session:**
- Update `current-focus.md` → Move to "just completed"
- Update `backlog.md` → Move completed items
- Update `decisions.md` → Document decisions made

---

**For full documentation system guide:** See `.agents/AGENT-DOCUMENTATION-SYSTEM.md`

