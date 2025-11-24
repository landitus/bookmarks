# Agent Documentation System: Replication Guide

**Purpose:** This document describes the `.agents` directory structure, documentation strategy, and content management approach used in this project. Use this as a template/prompt to replicate this system in other projects.

**Target Audience:** AI coding assistants (Claude, GPT-4, Cursor AI, etc.) working on software projects

**Created:** November 4, 2025  
**Project:** Daily Planner MVP

---

## Overview

The `.agents` directory is a structured documentation system designed to:

1. **Minimize context size** - Keep initial context under ~2,000 tokens
2. **Maximize information density** - Quick references for common questions
3. **Maintain project memory** - Track decisions, plans, and progress
4. **Enable efficient onboarding** - New AI sessions can quickly understand project state
5. **Support long-term development** - Historical context preserved without bloating daily context

---

## Directory Structure

```
.agents/
├── context.md                    # Project overview (~500 tokens) - READ FIRST
├── current-focus.md             # What we're working on now (~260 tokens)
├── backlog.md                   # Bugs, ideas, improvements (~1,200 tokens)
├── decisions.md                 # Key decisions quick reference (~1,800 tokens)
├── decisions-detailed.md        # Detailed implementation notes (when needed)
├── plans.md                     # Index of all implementation plans
├── docs/                        # Detailed documentation (read when needed)
│   ├── PRD.md                   # Product Requirements Document
│   ├── MVP-SUMMARY.md           # MVP scope and features
│   ├── STATUS.md                # Complete project status and history
│   ├── VISION.md                # Long-term vision (future planning)
│   ├── REFERENCES.md            # UI/UX reference images and notes
│   ├── WORKFLOW-ANALYSIS.md     # User workflow analysis
│   ├── [feature]-SUMMARY.md     # Feature-specific summaries
│   ├── [feature]-RESEARCH.md    # Technical research documents
│   ├── plans/                   # Date-prefixed implementation plans
│   │   └── YYYY-MM-DD-description.md
│   └── references/              # Reference images, screenshots
└── migrations/                  # Database migration notes (optional)
    └── migration-description.sql
```

---

## Core Documents (Read Every Session)

### 1. `.agents/context.md` (~500 tokens)

**Purpose:** Quick project overview and essential context

**Content:**

- What we're building (1-2 sentences)
- Core problem being solved
- Minimal MVP scope (what's in, what's out)
- Tech stack summary
- Database schema (simplified)
- Key design decisions (high-level)
- Current phase
- Success criteria

**When to read:** **ALWAYS** - First file to read in every new session

**When to update:**

- When MVP scope changes
- When tech stack changes
- When entering new phase
- When core problem/solution changes

**Token Budget:** Keep under 500 tokens. Be concise, focus on essentials.

---

### 2. `.agents/current-focus.md` (~260 tokens)

**Purpose:** What we're working on RIGHT NOW

**Content:**

- Current session focus (what we're doing today)
- What we just completed (last session summary)
- Next steps (immediate priorities)
- Current status (progress %, phase, blockers)

**When to read:** **ALWAYS** - Second file to read in every new session

**When to update:**

- At start of new session (set focus)
- After completing work (update "just completed")
- When priorities change
- When blockers appear/resolve

**Token Budget:** Keep under 300 tokens. Be very specific and actionable.

---

### 3. `.agents/backlog.md` (~1,200 tokens)

**Purpose:** Track bugs, ideas, and future improvements

**Content Structure:**

- How to use this document (workflow)
- Bugs (categorized by priority: P0, P1, P2, P3)
- Enhancements (categorized by priority)
- Ideas (new features, UX improvements, performance)
- Polish (visual refinements)
- Completed (moved here when done, with dates/references)

**When to read:** **ALWAYS** - Third file to read in every new session

**When to update:**

- When user reports a bug → Add to Bugs section
- When user suggests an idea → Add to Ideas section
- When completing work → Move to Completed section
- When prioritizing → Update priority levels

**Token Budget:** Can grow to ~1,500 tokens. Keep organized, remove completed items after 30 days if desired.

**Template for new items:**

```markdown
### [Category] Short Description

**Priority:** P1  
**Discovered:** 2025-11-02  
**Impact:** [Who/what is affected]  
**Details:** [Full description]  
**Reproduction:** [If bug - steps to reproduce]  
**Proposal:** [If enhancement - how to implement]  
**Related:** [Links to code, plans, decisions]  
**Status:** [Not started / In progress / Blocked]
```

---

## Reference Documents (Read When Needed)

### 4. `.agents/decisions.md` (~1,800 tokens)

**Purpose:** Quick reference for important architectural and product decisions

**Content:**

- Architecture decisions (tech stack, code organization, patterns)
- Product decisions (scope, features, what's deferred)
- Design decisions (UI/UX choices)
- Technical decisions (state management, React patterns, validation)
- Deferred decisions (what we'll decide later)
- Principles (when in doubt, follow these)

**When to read:** When making decisions, resolving questions, understanding "why we chose X"

**When to update:** After making any architectural, product, or design decision

**Token Budget:** Keep under 2,000 tokens. Focus on decisions that affect future work.

**Structure:**

- Quick links to other docs
- Categorized by type (Architecture, Product, Design, Technical)
- Each decision includes: What, Why, When, Key Details

---

### 5. `.agents/decisions-detailed.md` (unlimited)

**Purpose:** Full implementation details, code examples, historical context

**Content:**

- Complete code examples
- Historical context and evolution
- Comprehensive explanations
- Technical deep-dives
- Lessons learned and trade-offs
- References to related documentation

**When to read:** When you need deep understanding of implementation details or historical context

**When to update:** When implementing complex features or resolving complex issues

**Token Budget:** No limit - this is for deep dives. Keep detailed.

---

### 6. `.agents/plans.md` (~400 tokens)

**Purpose:** Index of all implementation plans organized by date and category

**Content:**

- How to use this index
- Plans by date (chronological)
- Plans by category (scroll, UI/UX, performance, etc.)
- Key insights across plans
- Related documentation links
- Documentation maintenance guidelines

**When to read:** When looking for specific implementation plans or understanding historical work

**When to update:** When creating new plans (add entry to index)

**Token Budget:** Can grow. Keep organized with clear categorization.

---

## Detailed Documentation (`.agents/docs/`)

### Core Documents

#### `PRD.md` (~5,000 tokens)

- Complete Product Requirements Document
- User stories, acceptance criteria
- Feature specifications
- **Read when:** Implementing major features, clarifying requirements

#### `MVP-SUMMARY.md` (~830 tokens)

- MVP scope and features
- What's in vs. out of scope
- Success criteria
- **Read when:** Clarifying MVP boundaries, planning features

#### `STATUS.md` (~1,000+ tokens)

- Complete project status and history
- Milestones, sprints, progress tracking
- Decision history with dates
- **Read when:** Understanding project history, tracking progress

#### `VISION.md` (~7,000 tokens)

- Long-term vision and roadmap
- Future features and ideas
- Strategic direction
- **Read when:** Future planning, understanding product direction

#### `REFERENCES.md` (~1,500 tokens)

- UI/UX reference images and notes
- Design inspiration
- User workflow analysis
- **Read when:** UI design questions, implementing visual features

### Implementation Plans (`docs/plans/`)

**Naming Convention:** `YYYY-MM-DD-description.md`

**Purpose:** Document specific implementation plans, research, and findings

**Content:**

- Purpose and status
- Key findings and insights
- Implementation details
- Related code references
- Lessons learned

**When to create:**

- Before implementing complex features
- When researching solutions
- When documenting refactoring plans
- When tracking multi-phase work

**When to read:** When implementing specific features or understanding past work

---

## Content Management Strategy

### Token Budget Management

**Total Initial Context:** ~1,960-2,790 tokens

- `context.md`: ~500 tokens
- `current-focus.md`: ~260 tokens
- `backlog.md`: ~1,200 tokens
- `decisions.md`: ~1,800 tokens (read when needed)
- **Total:** ~3,760 tokens if all read

**Strategy:** Read first 3 files every session (~1,960 tokens), read `decisions.md` when needed.

### Document Lifecycle

1. **Create** → Add to appropriate location
2. **Update** → Keep current, remove outdated info
3. **Archive** → Move completed plans to archive after 90 days (optional)
4. **Reference** → Link between related documents

### Update Frequency

- **Every Session:** `current-focus.md`
- **When Needed:** `context.md`, `backlog.md`, `decisions.md`
- **After Major Work:** `decisions.md`, `plans.md` index
- **After Features:** `STATUS.md`, create plan documents

---

## Workflow for AI Assistants

### On Every New Session

1. **Read first:** `.agents/context.md` (~500 tokens)
2. **Then read:** `.agents/current-focus.md` (~260 tokens)
3. **Check:** `.agents/backlog.md` (~1,200 tokens) - For priorities and bugs
4. **If needed:** `.agents/docs/MVP-SUMMARY.md` (~830 tokens) - For feature details

**Total context: ~1,960-2,790 tokens** ✅

### Avoid Reading Unless Necessary

- `.agents/docs/PRD.md` (5000 tokens) - Only for deep feature implementation
- `.agents/docs/VISION.md` (7000 tokens) - Only for future planning
- `.agents/docs/REFERENCES.md` (1500 tokens) - Only for UI design questions

### When Making Changes

1. **Update `current-focus.md`** - What we're working on now
2. **Update `backlog.md`** - Add bugs/ideas, move completed items
3. **Update `decisions.md`** - Document architectural decisions
4. **Create plan document** - For complex implementations (in `docs/plans/`)
5. **Update `plans.md` index** - Add entry for new plans

### When Completing Work

1. **Update `current-focus.md`** - Move to "just completed"
2. **Update `backlog.md`** - Move to "completed" section
3. **Update `STATUS.md`** - Track progress and milestones
4. **Update `decisions.md`** - Document any decisions made

---

## Best Practices

### Writing Style

- **Be concise** - Every word counts toward token budget
- **Be specific** - Use concrete examples, avoid vague language
- **Be actionable** - Focus on what to do, not just what is
- **Use structure** - Headers, lists, tables for scannability
- **Link documents** - Cross-reference related content

### Content Guidelines

- **Focus on "why"** - Explain decisions, not just what was decided
- **Include dates** - Track when decisions/plans were made
- **Reference code** - Link to specific files/functions when relevant
- **Track status** - Keep status indicators current (✅, 🔄, ⚠️, ❌)
- **Remove outdated info** - Don't let documents become bloated

### Token Optimization

- **Use abbreviations** - MVP, PRD, RLS, etc. (define once, use everywhere)
- **Reference, don't repeat** - Link to detailed docs instead of copying
- **Use tables** - More information-dense than paragraphs
- **Use lists** - Easier to scan than prose
- **Remove completed items** - Archive old plans after 90 days

---

## Replication Instructions

### Step 1: Create Directory Structure

```bash
mkdir -p .agents/docs/plans
mkdir -p .agents/docs/references
mkdir -p .agents/migrations  # Optional, if using database migrations
```

### Step 2: Create Core Documents

Create these files with initial content:

1. **`.agents/context.md`** - Start with project overview
2. **`.agents/current-focus.md`** - What you're working on now
3. **`.agents/backlog.md`** - Empty template with structure
4. **`.agents/decisions.md`** - Start with tech stack decisions
5. **`.agents/plans.md`** - Empty index

### Step 3: Create Detailed Docs (As Needed)

Create these when you have content:

- `docs/PRD.md` - Product requirements
- `docs/MVP-SUMMARY.md` - MVP scope
- `docs/STATUS.md` - Project status tracking
- `docs/VISION.md` - Long-term vision (optional)

### Step 4: Add to `.cursorrules` or Project Rules

Add this section to your project's AI assistant rules:

```markdown
## Context Management

### On Every New Session

1. **Always read first:** `.agents/context.md` (~500 tokens)
2. **Then read:** `.agents/current-focus.md` (~260 tokens)
3. **Check:** `.agents/backlog.md` (~1,200 tokens) - For priorities and bugs
4. **If needed:** `.agents/docs/MVP-SUMMARY.md` (~830 tokens) - For feature details

### Total context: ~1,960-2,790 tokens ✅

### Avoid Reading Unless Necessary

- `.agents/docs/PRD.md` (5000 tokens) - Only for deep feature implementation
- `.agents/docs/VISION.md` (7000 tokens) - Only for future planning
- `.agents/docs/REFERENCES.md` (1500 tokens) - Only for UI design questions
```

### Step 5: Establish Workflow

- Update `current-focus.md` at start/end of sessions
- Add bugs/ideas to `backlog.md` immediately
- Document decisions in `decisions.md` as you make them
- Create plan documents for complex implementations

---

## Example: Starting a New Project

### Initial Setup

1. **Create `.agents/context.md`:**

   ```markdown
   # Project Context (Quick Reference)

   **Last Updated:** [Date]

   ## What We're Building

   [1-2 sentence description]

   ## Core Problem

   [What problem are we solving?]

   ## Tech Stack

   - Frontend: [Framework]
   - Backend: [Service]
   - Database: [Database]

   ## Current Phase

   [Setup / Development / Polish / Launch]
   ```

2. **Create `.agents/current-focus.md`:**

   ```markdown
   # Current Focus

   **Last Updated:** [Date]
   **Session:** [Session name]

   ## 🎯 Current Session Focus

   [What we're doing today]

   ## ✅ What We Just Completed

   [Last session summary]

   ## 🔄 Next Steps

   [Immediate priorities]
   ```

3. **Create `.agents/backlog.md`:**

   ```markdown
   # Backlog: Bugs & Future Improvements

   ## 🐛 Bugs

   ### Critical (P0)

   ### High Priority (P1)

   ### Medium Priority (P2)

   ### Low Priority (P3)

   ## ✨ Enhancements

   ## 💡 Ideas

   ## 🎨 Polish

   ## ✅ Completed
   ```

4. **Create `.agents/decisions.md`:**

   ```markdown
   # Key Decisions Log (Quick Reference)

   ## Architecture Decisions

   ### Tech Stack

   [Your tech choices]

   ## Product Decisions

   ## Design Decisions

   ## Technical Decisions
   ```

---

## Benefits of This System

1. **Efficient Onboarding** - New AI sessions understand project in ~2,000 tokens
2. **Consistent Context** - Same information available every session
3. **Historical Memory** - Decisions and plans preserved for reference
4. **Prioritization** - Backlog keeps bugs and ideas organized
5. **Decision Tracking** - Understand "why" behind choices
6. **Progress Visibility** - Current focus and status always clear

---

## Maintenance

### Weekly

- Review and update `current-focus.md`
- Check `backlog.md` for priorities
- Archive completed plans older than 90 days (optional)

### Monthly

- Review `decisions.md` for outdated decisions
- Update `context.md` if project phase changes
- Clean up `backlog.md` completed section

### As Needed

- Create plan documents for complex work
- Update detailed docs when implementing features
- Document decisions immediately when made

---

## Customization

This system is designed to be flexible. Adapt it to your project:

- **Small projects:** Skip detailed docs, focus on core files
- **Large projects:** Add more detailed docs, create feature-specific folders
- **Team projects:** Add collaboration guidelines, code review notes
- **Open source:** Add contribution guidelines, roadmap docs

---

## Questions?

When replicating this system:

1. Start with core documents (`context.md`, `current-focus.md`, `backlog.md`)
2. Add detailed docs as project grows
3. Adjust token budgets based on your needs
4. Customize structure for your workflow

**Remember:** The goal is efficient context management, not perfect documentation. Start simple, iterate as needed.

---

**Last Updated:** November 4, 2025  
**Project:** Daily Planner MVP  
**System Version:** 1.0
