# Foundation Phase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the foundation data layer and UI components for agent creation, templates, skills, models, and presets from Clawnetes.

**Architecture:** Static TypeScript data files under `src/data/` for templates, skills, models, personas, and presets. New pages under `src/app/` for each feature area. Shared types in `src/lib/agent-types.ts`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS

---

### Task 1: Persona Template Data + UI

**Files:**
- Create: `src/data/persona-templates.ts`
- Create: `src/app/templates/page.tsx`

21 persona templates (from Clawnetes personaTemplates.ts). Each defines IDENTITY.md and SOUL.md content. Grid view with persona picker.

### Task 2: Business Function Team Templates

**Files:**
- Create: `src/data/team-templates.ts`
- Create: `src/app/templates/teams/page.tsx`

6 business function presets: Personal Productivity, Software Dev, Financial Analyst, Social Media Manager, CRM, Customer Support. Each defines orchestrator + 2 sub-agents + cron jobs.

### Task 3: Skills Catalog Data + UI

**Files:**
- Create: `src/data/skills-catalog.ts`
- Create: `src/app/skills/page.tsx`

47 skills from Clawnetes organized by category with auth-aware toggling.

### Task 4: Model Catalog Data + UI

**Files:**
- Create: `src/data/model-catalog.ts`
- Create: `src/app/models/page.tsx`

15+ providers, model picker grouped by provider, fallback chain config, capability tags.

### Task 5: Agent Type Presets (Quick-Start)

**Files:**
- Create: `src/data/agent-presets.ts`
- Create: `src/app/presets/page.tsx`

3 presets: Coding Assistant (DevBot 9000), Office Assistant (Alfred), Travel Planner (Atlas). Each sets all config including 7 markdown files.

### Task 6: Agent Definition Editor (7 Markdown Files)

**Files:**
- Create: `src/app/agents/[id]/edit/page.tsx`
- Create: `src/components/MarkdownEditor.tsx`

Form editors for IDENTITY.md, SOUL.md, USER.md, TOOLS.md, AGENTS.md, HEARTBEAT.md, MEMORY.md with markdown preview. Tab-based navigation.

### Task 7: Agent Library Browser

**Files:**
- Create: `src/data/agent-library.ts`
- Create: `src/app/library/page.tsx`

Grid/list view of pre-built agents, preview, one-click clone, category filter.
