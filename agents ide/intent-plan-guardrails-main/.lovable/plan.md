

# Project-Centric AI Workforce Platform — Complete Redesign

A transformative redesign introducing a **project-first workflow** where users define projects, the system recommends agents, and humans maintain full control while watching AI agents work on their codebase in real-time.

---

## Core Concept: The New Workflow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROJECT-CENTRIC WORKFLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. CREATE PROJECT                                                          │
│     ├─ Name, description, goals                                             │
│     ├─ Connect GitHub repository                                            │
│     └─ Select tech stack preferences                                        │
│                                                                             │
│  2. AGENT RECOMMENDATION                                                    │
│     ├─ System analyzes project needs                                        │
│     ├─ Suggests required agents (Frontend, Backend, QA...)                  │
│     └─ User can add/remove/purchase agents                                  │
│                                                                             │
│  3. AGENT WORKSPACE (Beautiful IDE-like Experience)                         │
│     ├─ Left: Agent panel with status + controls                             │
│     ├─ Center: Live code editor (Monaco) — user can edit                    │
│     ├─ Right: Agent activity + plan panel                                   │
│     └─ Bottom: Terminal/logs (collapsible)                                  │
│                                                                             │
│  4. HUMAN-IN-THE-LOOP                                                       │
│     ├─ Approve/reject agent actions                                         │
│     ├─ Edit agent code changes directly                                     │
│     ├─ Request modifications                                                │
│     └─ Real-time collaboration                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## New Data Models

### Project Type
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  goals: string[];
  
  // Repository
  githubUrl?: string;
  branch: string;
  lastSynced?: Date;
  
  // Tech Stack
  frontendStack: TechStack[];
  backendStack: TechStack[];
  
  // Agents
  assignedAgentIds: string[];
  recommendedAgentIds: string[];
  
  // Status
  status: "setup" | "active" | "paused" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

interface TechStack {
  id: string;
  name: string;
  category: "language" | "framework" | "database" | "tool";
  icon: string;
}
```

---

## Screen 1: Projects Dashboard (New Home)

**Purpose:** Central hub for all projects with quick access to active work

**Layout:**
- Top: Header with "New Project" button
- Main: Project cards grid with status, agents, last activity
- Sidebar: Quick agent overview

**Each Project Card Shows:**
- Project name and description
- Connected repository (GitHub icon + repo name)
- Active agents (avatar pills)
- Current status (Setup / Active / Paused)
- Last activity timestamp
- Progress indicator

---

## Screen 2: New Project Wizard

**A beautiful multi-step wizard with:**

### Step 1: Project Details
- Project name
- Description (what are you building?)
- Goals (bulleted list)

### Step 2: Connect Repository
- GitHub OAuth connection
- Repository selector
- Branch selector
- Initial codebase analysis preview

### Step 3: Tech Stack Selection
**Beautiful visual selectors:**

**Frontend:**
- React / Vue / Angular / Svelte
- TypeScript / JavaScript
- Tailwind / CSS Modules / Styled Components

**Backend:**
- Node.js / Python / Go / Rust
- Express / FastAPI / Gin
- PostgreSQL / MongoDB / Redis

**Tools:**
- Docker / Kubernetes
- Jest / Vitest / Playwright

### Step 4: Agent Recommendation
- System analyzes project and recommends agents
- Visual cards showing "Your team needs:"
- Toggle to add/remove agents
- "Purchase Agent" button for missing roles
- Cost estimation

### Step 5: Review & Launch
- Summary of project setup
- Team composition
- Budget allocation
- "Launch Project" button

---

## Screen 3: Agent Marketplace (Purchase Agents)

**Purpose:** When user doesn't have an agent role, they can acquire it

**Layout:**
- Grid of available agent types
- Pricing tiers (Observer / Advisor / Executor / Autonomous)
- Feature comparison
- One-click add to project

**Agent Card:**
- Role icon and name
- Description
- Base capabilities
- Pricing per hour/execution
- "Add to Workforce" button

---

## Screen 4: Agent Workspace (Complete Redesign)

**The hero screen — where the magic happens**

### Layout: Four-Panel IDE-Style Interface

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ◀ Project Name │ Agent: UI Architect │ ⚡ Executing │ ⏱ 12:34 │ $4.50 │ ⚙ │
├────────────────┬──────────────────────────────────────────┬─────────────────┤
│                │                                          │                 │
│   AGENTS       │           CODE EDITOR                    │  AGENT BRAIN    │
│   PANEL        │         (Monaco Editor)                  │   PANEL         │
│                │                                          │                 │
│  ┌──────────┐  │  ┌────────────────────────────────────┐  │  Current Task   │
│  │ FE Agent │  │  │ 1  import React from 'react';     │  │  ───────────── │
│  │ ⚡ Active │  │  │ 2  import { Button } from './ui'; │  │  Implementing   │
│  └──────────┘  │  │ 3  + import { Modal } from './Modal'│  │  auth flow      │
│                │  │ 4                                   │  │                 │
│  ┌──────────┐  │  │ 5  export function App() {         │  │  Plan           │
│  │ BE Agent │  │  │ 6    const [open, setOpen] = ...   │  │  ───────────── │
│  │ ◯ Idle   │  │  │ 7    return (                      │  │  Step 2 of 5    │
│  └──────────┘  │  │ 8      <div>                       │  │  [░░▓▓░░░░░░]   │
│                │  │ 9  +     <Modal open={open} />     │  │                 │
│  ┌──────────┐  │  │ 10      </div>                     │  │  Files Changed  │
│  │ QA Agent │  │  │ 11    );                           │  │  ───────────── │
│  │ ◯ Idle   │  │  │ 12  }                              │  │  • App.tsx      │
│  └──────────┘  │  │                                     │  │  • Modal.tsx    │
│                │  └────────────────────────────────────┘  │                 │
│  + Add Agent   │                                          │  [Approve]      │
│                │  File: src/App.tsx │ Modified │ Agent    │  [Request Edit] │
│                │                                          │  [Reject]       │
├────────────────┴──────────────────────────────────────────┴─────────────────┤
│ TERMINAL / LOGS                                                    ▲ Expand │
│ 12:34:02 [INFO] Agent analyzing codebase structure...                       │
│ 12:34:05 [INFO] Creating Modal component with accessible patterns...        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Left Panel: Agent Control

**Collapsible sidebar with:**
- List of assigned agents
- Status indicators (animated for active)
- Quick actions (pause, resume, reassign)
- Agent health metrics
- "+ Add Agent" button

**Agent Mini-Card:**
- Role icon + name
- Status dot (animated pulse when executing)
- Current task preview (truncated)
- Click to expand details

### Center Panel: Live Code Editor

**Monaco Editor integration with:**
- Syntax highlighting
- Line-by-line diff highlighting
- Agent changes highlighted (green additions, red deletions)
- **USER CAN EDIT** — full editing capabilities
- File tree sidebar (collapsible)
- Tab bar for open files
- Save/commit controls

**Diff Overlay:**
- When agent makes changes, show inline diff
- Accept/reject individual hunks
- "Accept All" / "Reject All" actions

### Right Panel: Agent Brain

**What the agent is thinking:**
- Current task description
- Step-by-step plan progress
- Confidence indicator
- Files being touched
- Risk alerts

**Approval Controls:**
- Prominent "Approve" button
- "Request Changes" button
- "Reject" button
- Comment/feedback input

### Bottom Panel: Terminal/Logs

**Collapsible terminal with:**
- Real-time agent logs
- Build output
- Test results
- Error messages
- Filterable by level (info/warning/error)

---

## Screen 5: Agent Detail Drawer

**Slide-in drawer when clicking an agent:**
- Full agent context (role, authority, scope)
- Current and past tasks
- Performance metrics
- Settings/configuration
- Pause/Resume/Reassign controls

---

## Visual Design System Updates

### Color Palette (Premium Dark Theme)

```css
/* Deep space background */
--background: 230 15% 6%;

/* Rich surface layers */
--surface-1: 230 14% 9%;
--surface-2: 230 13% 12%;
--surface-3: 230 12% 16%;

/* Vibrant accents */
--primary: 250 100% 70%;      /* Electric violet */
--success: 155 80% 50%;       /* Mint green */
--warning: 35 100% 55%;       /* Warm amber */
--error: 0 85% 60%;           /* Coral red */
--info: 200 100% 60%;         /* Cyan blue */

/* Agent status colors */
--executing: 155 80% 50%;     /* Pulsing green */
--planning: 250 100% 70%;     /* Purple */
--awaiting: 35 100% 55%;      /* Amber */
--idle: 220 10% 45%;          /* Muted gray */
```

### Typography

- **Headers:** Inter/SF Pro Display — clean, modern
- **Body:** Inter — highly readable
- **Code:** JetBrains Mono — beautiful monospace
- **Numbers/Stats:** Tabular figures for alignment

### Micro-interactions

- Agent status pulse (subtle, professional)
- Code line highlight on agent edit
- Smooth panel transitions
- Progress bar fills
- Button hover states with subtle glow

---

## New Components

1. **ProjectCard** — Project overview card for dashboard
2. **ProjectWizard** — Multi-step project creation
3. **TechStackSelector** — Visual tech stack picker
4. **AgentMarketplace** — Browse/purchase agents
5. **AgentWorkspace** — Main workspace (complete rebuild)
6. **MonacoEditor** — Code editor integration
7. **AgentPanel** — Left sidebar agent list
8. **AgentBrainPanel** — Right sidebar with agent thinking
9. **TerminalPanel** — Bottom logs/terminal
10. **FileTree** — File browser for repository
11. **DiffViewer** — Enhanced diff visualization
12. **AgentDetailDrawer** — Slide-in agent details

---

## Technical Implementation

### New Dependencies
- `@monaco-editor/react` — Code editor
- `react-diff-viewer-continued` — Better diff display
- `@xterm/xterm` — Terminal emulator (optional)

### State Management
- Extend WorkforceContext with Project state
- Add ProjectContext for project-specific data
- Add EditorContext for Monaco state

### File Structure
```
src/
├── pages/
│   ├── Projects.tsx           (new home)
│   ├── NewProject.tsx         (wizard)
│   ├── ProjectWorkspace.tsx   (main workspace)
│   └── AgentMarketplace.tsx   (purchase agents)
├── components/
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectWizard.tsx
│   │   └── TechStackSelector.tsx
│   ├── workspace/
│   │   ├── AgentPanel.tsx
│   │   ├── CodeEditor.tsx
│   │   ├── AgentBrainPanel.tsx
│   │   ├── TerminalPanel.tsx
│   │   ├── FileTree.tsx
│   │   └── DiffViewer.tsx
│   └── marketplace/
│       └── AgentMarketplaceCard.tsx
├── contexts/
│   └── ProjectContext.tsx
└── types/
    └── project.ts
```

---

## Human-in-the-Loop Features

1. **Real-time code editing** — User can edit alongside agents
2. **Inline approval** — Accept/reject individual changes
3. **Feedback loop** — Comment on agent decisions
4. **Override controls** — Pause agent, take manual control
5. **Version control** — Rollback to any previous state
6. **Conflict resolution** — When human and agent edit same file

---

## Summary

This redesign transforms the platform from an "agent management dashboard" into a **collaborative AI development environment** where:

- Projects are the central organizing concept
- Agents are team members assigned to projects
- Users watch agents work in real-time with full code visibility
- Humans maintain complete control with edit capabilities
- The UI feels like a premium, modern IDE — not a dashboard

