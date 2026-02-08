// Project-Centric AI Workforce Platform - Project Types

export interface TechStack {
  id: string;
  name: string;
  category: "language" | "framework" | "database" | "tool" | "styling";
  icon: string;
  color: string;
}

export interface ProjectFile {
  id: string;
  path: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: ProjectFile[];
  isModified?: boolean;
  modifiedBy?: "user" | "agent";
  lastModified?: Date;
}

export interface AgentChange {
  id: string;
  agentId: string;
  fileId: string;
  filePath: string;
  changeType: "create" | "modify" | "delete";
  originalContent?: string;
  newContent: string;
  diffLines: DiffLine[];
  status: "pending" | "approved" | "rejected";
  timestamp: Date;
  explanation: string;
}

export interface DiffLine {
  lineNumber: number;
  type: "added" | "removed" | "unchanged";
  content: string;
}

export interface Project {
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
  toolsStack: TechStack[];
  
  // Agents
  assignedAgentIds: string[];
  recommendedAgentIds: string[];
  
  // Files
  files: ProjectFile[];
  
  // Changes
  pendingChanges: AgentChange[];
  
  // Status
  status: "setup" | "active" | "paused" | "completed";
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

// Available tech stacks
export const frontendTechStacks: TechStack[] = [
  { id: "react", name: "React", category: "framework", icon: "⚛️", color: "text-cyan-400" },
  { id: "vue", name: "Vue.js", category: "framework", icon: "💚", color: "text-emerald-400" },
  { id: "angular", name: "Angular", category: "framework", icon: "🅰️", color: "text-red-400" },
  { id: "svelte", name: "Svelte", category: "framework", icon: "🔥", color: "text-orange-400" },
  { id: "nextjs", name: "Next.js", category: "framework", icon: "▲", color: "text-white" },
  { id: "typescript", name: "TypeScript", category: "language", icon: "📘", color: "text-blue-400" },
  { id: "javascript", name: "JavaScript", category: "language", icon: "📒", color: "text-yellow-400" },
  { id: "tailwind", name: "Tailwind CSS", category: "styling", icon: "🎨", color: "text-teal-400" },
  { id: "css-modules", name: "CSS Modules", category: "styling", icon: "📦", color: "text-purple-400" },
  { id: "styled", name: "Styled Components", category: "styling", icon: "💅", color: "text-pink-400" },
];

export const backendTechStacks: TechStack[] = [
  { id: "nodejs", name: "Node.js", category: "framework", icon: "🟢", color: "text-green-400" },
  { id: "python", name: "Python", category: "language", icon: "🐍", color: "text-yellow-400" },
  { id: "go", name: "Go", category: "language", icon: "🐹", color: "text-cyan-400" },
  { id: "rust", name: "Rust", category: "language", icon: "🦀", color: "text-orange-400" },
  { id: "express", name: "Express.js", category: "framework", icon: "🚂", color: "text-gray-400" },
  { id: "fastapi", name: "FastAPI", category: "framework", icon: "⚡", color: "text-teal-400" },
  { id: "nestjs", name: "NestJS", category: "framework", icon: "🐈", color: "text-red-400" },
  { id: "postgresql", name: "PostgreSQL", category: "database", icon: "🐘", color: "text-blue-400" },
  { id: "mongodb", name: "MongoDB", category: "database", icon: "🍃", color: "text-green-400" },
  { id: "redis", name: "Redis", category: "database", icon: "📕", color: "text-red-400" },
  { id: "supabase", name: "Supabase", category: "database", icon: "⚡", color: "text-emerald-400" },
];

export const toolsTechStacks: TechStack[] = [
  { id: "docker", name: "Docker", category: "tool", icon: "🐳", color: "text-blue-400" },
  { id: "kubernetes", name: "Kubernetes", category: "tool", icon: "☸️", color: "text-blue-500" },
  { id: "jest", name: "Jest", category: "tool", icon: "🃏", color: "text-red-400" },
  { id: "vitest", name: "Vitest", category: "tool", icon: "⚡", color: "text-yellow-400" },
  { id: "playwright", name: "Playwright", category: "tool", icon: "🎭", color: "text-green-400" },
  { id: "github-actions", name: "GitHub Actions", category: "tool", icon: "🔄", color: "text-gray-400" },
];

// Mock project files for demo
export const mockProjectFiles: ProjectFile[] = [
  {
    id: "folder-src",
    path: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "file-app",
        path: "src/App.tsx",
        name: "App.tsx",
        type: "file",
        language: "typescript",
        content: `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;`,
      },
      {
        id: "folder-components",
        path: "src/components",
        name: "components",
        type: "folder",
        children: [
          {
            id: "file-header",
            path: "src/components/Header.tsx",
            name: "Header.tsx",
            type: "file",
            language: "typescript",
            content: `import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <nav className="container mx-auto px-4 py-3">
        <Link to="/" className="font-bold text-xl">
          MyApp
        </Link>
      </nav>
    </header>
  );
}`,
          },
          {
            id: "file-button",
            path: "src/components/Button.tsx",
            name: "Button.tsx",
            type: "file",
            language: "typescript",
            content: `import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        variant === 'ghost' && 'hover:bg-muted',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}`,
          },
        ],
      },
      {
        id: "folder-pages",
        path: "src/pages",
        name: "pages",
        type: "folder",
        children: [
          {
            id: "file-dashboard",
            path: "src/pages/Dashboard.tsx",
            name: "Dashboard.tsx",
            type: "file",
            language: "typescript",
            content: `import React from 'react';

export function Dashboard() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 rounded-lg border bg-card">
          <h2 className="font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold">1,234</p>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <h2 className="font-semibold mb-2">Revenue</h2>
          <p className="text-3xl font-bold">$12,345</p>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <h2 className="font-semibold mb-2">Active Sessions</h2>
          <p className="text-3xl font-bold">89</p>
        </div>
      </div>
    </main>
  );
}`,
          },
          {
            id: "file-login",
            path: "src/pages/Login.tsx",
            name: "Login.tsx",
            type: "file",
            language: "typescript",
            content: `import React, { useState } from 'react';
import { Button } from '../components/Button';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication
    console.log('Login attempt:', { email, password });
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 rounded-lg border bg-card">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-background"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-background"
          />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </div>
      </form>
    </main>
  );
}`,
          },
        ],
      },
    ],
  },
  {
    id: "file-package",
    path: "package.json",
    name: "package.json",
    type: "file",
    language: "json",
    content: `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0"
  }
}`,
  },
];
