// Advanced AI Simulation Engine v2.0
// Generates hyper-realistic code changes, multi-agent collaboration, and sophisticated diffs

import type { AgentChange, DiffLine, ProjectFile } from "@/types/project";

// ============================================================================
// REALISTIC CODE GENERATION PATTERNS
// ============================================================================

const codePatterns = {
  // React Component Patterns
  reactComponents: {
    hooks: [
      { 
        original: `const [data, setData] = useState([]);`,
        improved: `const [data, setData] = useState<DataItem[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);`,
        explanation: "Added TypeScript generics and loading/error states for robust data handling"
      },
      {
        original: `useEffect(() => {
  fetchData();
}, []);`,
        improved: `const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['data', filters],
  queryFn: () => fetchData(filters),
  staleTime: 5 * 60 * 1000,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});`,
        explanation: "Replaced manual useEffect with React Query for automatic caching, retries, and background updates"
      },
      {
        original: `const handleClick = () => {
  doSomething();
};`,
        improved: `const handleClick = useCallback(
  (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    doSomething();
    analytics.track('button_clicked', { action: 'submit' });
  },
  [doSomething]
);`,
        explanation: "Memoized callback with proper event typing and analytics tracking"
      },
    ],
    forms: [
      {
        original: `<input 
  type="text" 
  value={value} 
  onChange={(e) => setValue(e.target.value)} 
/>`,
        improved: `<Controller
  name="fieldName"
  control={control}
  rules={{
    required: 'This field is required',
    minLength: { value: 3, message: 'Minimum 3 characters' },
    pattern: { value: /^[a-zA-Z]+$/, message: 'Only letters allowed' }
  }}
  render={({ field, fieldState }) => (
    <div className="space-y-1">
      <Input
        {...field}
        className={cn(fieldState.error && 'border-destructive')}
        aria-invalid={!!fieldState.error}
        aria-describedby={fieldState.error ? 'field-error' : undefined}
      />
      {fieldState.error && (
        <p id="field-error" className="text-sm text-destructive">
          {fieldState.error.message}
        </p>
      )}
    </div>
  )}
/>`,
        explanation: "Implemented react-hook-form Controller with validation, accessibility, and error states"
      },
    ],
    dataDisplay: [
      {
        original: `{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}`,
        improved: `<AnimatePresence mode="popLayout">
  {items.length === 0 ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <EmptyState 
        icon={<InboxIcon />}
        title="No items found"
        description="Get started by creating your first item"
        action={<Button onClick={onCreate}>Create Item</Button>}
      />
    </motion.div>
  ) : (
    <motion.ul 
      className="divide-y divide-border"
      layout
    >
      {items.map((item, index) => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ delay: index * 0.05 }}
          layout
        >
          <ItemCard item={item} onEdit={onEdit} onDelete={onDelete} />
        </motion.li>
      ))}
    </motion.ul>
  )}
</AnimatePresence>`,
        explanation: "Added animated list with empty state, staggered animations, and layout transitions"
      },
    ],
  },

  // TypeScript Patterns
  typescript: {
    types: [
      {
        original: `interface User {
  id: string;
  name: string;
  email: string;
}`,
        improved: `interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User extends BaseEntity {
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  preferences: UserPreferences;
}

type UserRole = 'admin' | 'moderator' | 'user' | 'guest';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  language: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
}

// Type guards
function isAdmin(user: User): user is User & { role: 'admin' } {
  return user.role === 'admin';
}`,
        explanation: "Extended with base entity, preferences, nested types, and type guards"
      },
    ],
    utilities: [
      {
        original: `function formatDate(date: Date): string {
  return date.toLocaleDateString();
}`,
        improved: `import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';

type DateFormatStyle = 'relative' | 'absolute' | 'smart';

export function formatDate(
  date: Date | string | number,
  style: DateFormatStyle = 'smart',
  options?: { locale?: Locale; includeTime?: boolean }
): string {
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    console.warn('Invalid date provided to formatDate:', date);
    return 'Invalid date';
  }

  const timeFormat = options?.includeTime ? ' HH:mm' : '';

  switch (style) {
    case 'relative':
      return formatDistanceToNow(parsedDate, { 
        addSuffix: true,
        locale: options?.locale 
      });
    
    case 'absolute':
      return format(parsedDate, \`MMM d, yyyy\${timeFormat}\`, { 
        locale: options?.locale 
      });
    
    case 'smart':
    default:
      if (isToday(parsedDate)) {
        return format(parsedDate, \`'Today'\${timeFormat ? ' at' + timeFormat : ''}\`);
      }
      if (isYesterday(parsedDate)) {
        return format(parsedDate, \`'Yesterday'\${timeFormat ? ' at' + timeFormat : ''}\`);
      }
      if (isThisWeek(parsedDate)) {
        return format(parsedDate, \`EEEE\${timeFormat}\`);
      }
      return format(parsedDate, \`MMM d\${timeFormat}\`);
  }
}`,
        explanation: "Implemented smart date formatting with multiple styles, localization support, and validation"
      },
    ],
  },

  // API Patterns
  api: {
    fetching: [
      {
        original: `async function getUsers() {
  const response = await fetch('/api/users');
  return response.json();
}`,
        improved: `import { z } from 'zod';

// Schema validation
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.string().datetime().transform(s => new Date(s)),
});

const UsersResponseSchema = z.object({
  data: z.array(UserSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

type User = z.infer<typeof UserSchema>;
type UsersResponse = z.infer<typeof UsersResponseSchema>;

interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export async function getUsers(params: GetUsersParams = {}): Promise<UsersResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const response = await fetch(\`/api/users?\${searchParams}\`, {
    headers: {
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, error.message);
  }

  const data = await response.json();
  return UsersResponseSchema.parse(data);
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}`,
        explanation: "Added Zod schema validation, typed parameters, pagination, sorting, timeout, and error handling"
      },
    ],
    mutations: [
      {
        original: `async function createUser(data) {
  await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}`,
        improved: `import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CreateUserInput {
  email: string;
  name: string;
  role?: UserRole;
}

async function createUserApi(input: CreateUserInput): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create user');
  }

  return response.json();
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserApi,
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData(['users']);

      // Optimistically update
      queryClient.setQueryData(['users'], (old: UsersResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: [{ ...newUser, id: 'temp-id', createdAt: new Date() }, ...old.data],
        };
      });

      return { previousUsers };
    },
    onSuccess: (user) => {
      toast.success('User created successfully', {
        description: \`\${user.name} has been added to the team\`,
        action: {
          label: 'View',
          onClick: () => window.location.href = \`/users/\${user.id}\`,
        },
      });
    },
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      toast.error('Failed to create user', {
        description: err.message,
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}`,
        explanation: "Implemented React Query mutation with optimistic updates, rollback, and toast notifications"
      },
    ],
  },

  // CSS/Styling Patterns
  styling: {
    animations: [
      {
        original: `.card {
  transition: all 0.3s;
}`,
        improved: `.card {
  @apply relative overflow-hidden transition-all duration-300 ease-out;
  transform: translateZ(0); /* GPU acceleration */
}

.card::before {
  content: '';
  @apply absolute inset-0 opacity-0 transition-opacity duration-300;
  background: radial-gradient(
    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    hsl(var(--primary) / 0.15),
    transparent 40%
  );
}

.card:hover {
  @apply -translate-y-1 shadow-lg shadow-primary/10;
}

.card:hover::before {
  @apply opacity-100;
}

/* Skeleton loading state */
.card.loading {
  @apply animate-pulse;
  pointer-events: none;
}

.card.loading > * {
  @apply invisible;
}

.card.loading::after {
  content: '';
  @apply absolute inset-4;
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 0%,
    hsl(var(--muted-foreground) / 0.1) 50%,
    hsl(var(--muted)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: inherit;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}`,
        explanation: "Added mouse-following gradient, GPU acceleration, skeleton loading, and shimmer animation"
      },
    ],
  },
};

// ============================================================================
// AGENT THINKING PATTERNS (More realistic AI behavior)
// ============================================================================

const agentBehaviors = {
  analysis: {
    thoughts: [
      "🔍 Scanning project structure and identifying dependencies...",
      "📊 Analyzing bundle size impact of current implementation...",
      "🔗 Mapping component dependency graph...",
      "🎯 Identifying performance bottlenecks in render cycle...",
      "📝 Reviewing TypeScript strict mode compliance...",
      "🔒 Checking for security vulnerabilities in dependencies...",
      "♿ Auditing accessibility compliance (WCAG 2.1 AA)...",
      "📱 Analyzing responsive design breakpoints...",
      "🧪 Reviewing test coverage gaps...",
      "⚡ Identifying candidates for code splitting...",
    ],
    details: [
      "Found 3 components re-rendering unnecessarily on parent state change",
      "Detected missing error boundary in critical user flow",
      "Bundle analysis: lodash contributing 70kb (consider tree-shaking)",
      "TypeScript: 12 implicit 'any' types detected",
      "Accessibility: 5 images missing alt attributes",
    ],
  },
  planning: {
    thoughts: [
      "📋 Generating implementation roadmap...",
      "🏗️ Designing component architecture for scalability...",
      "🔄 Planning state management strategy...",
      "📐 Mapping data flow and API contracts...",
      "🧩 Identifying reusable component patterns...",
      "📊 Estimating implementation complexity...",
      "🛡️ Planning error handling strategy...",
      "⚙️ Designing configuration and environment setup...",
    ],
    details: [
      "Proposed: Extract shared logic into custom hooks",
      "Recommendation: Implement compound component pattern",
      "Estimated: 8 files to modify, 3 new files to create",
      "Risk assessment: Medium - touching core authentication flow",
    ],
  },
  implementation: {
    thoughts: [
      "✨ Implementing optimized component structure...",
      "🔧 Refactoring for better separation of concerns...",
      "🎨 Applying consistent styling patterns...",
      "📦 Extracting reusable utility functions...",
      "🔌 Implementing API integration layer...",
      "🧪 Adding unit test coverage...",
      "📝 Updating TypeScript interfaces...",
      "⚡ Optimizing re-render performance with useMemo...",
      "🔐 Implementing input sanitization...",
      "🌐 Adding internationalization support...",
    ],
    details: [
      "Created useDebounce hook for search input optimization",
      "Wrapped expensive computation in useMemo (50% render reduction)",
      "Added React.memo to 3 list item components",
      "Implemented error boundary with retry functionality",
    ],
  },
  validation: {
    thoughts: [
      "✅ Running TypeScript compiler checks...",
      "🧪 Executing unit test suite...",
      "🔍 Running ESLint with strict rules...",
      "📊 Measuring bundle size impact...",
      "♿ Validating accessibility compliance...",
      "🎯 Checking performance benchmarks...",
      "🔒 Running security audit...",
      "📱 Testing responsive breakpoints...",
    ],
    details: [
      "TypeScript: 0 errors, 2 warnings (unused variables)",
      "Tests: 47/48 passed (1 snapshot updated)",
      "Bundle size: +2.3kb gzipped (within budget)",
      "Lighthouse: Performance 94, Accessibility 100",
    ],
  },
};

// ============================================================================
// REALISTIC FILE CHANGE SCENARIOS
// ============================================================================

interface ChangeScenario {
  name: string;
  description: string;
  category: "performance" | "accessibility" | "security" | "ux" | "refactoring" | "feature" | "bugfix";
  files: {
    path: string;
    changeType: "create" | "modify" | "delete";
    purpose: string;
  }[];
  diffTemplate: () => DiffLine[];
}

const changeScenarios: ChangeScenario[] = [
  {
    name: "Implement React Query data fetching",
    description: "Replace useEffect fetch pattern with React Query for better caching and error handling",
    category: "performance",
    files: [
      { path: "src/hooks/useUsers.ts", changeType: "create", purpose: "Custom hook for user data fetching" },
      { path: "src/components/UserList.tsx", changeType: "modify", purpose: "Integrate new data hook" },
      { path: "src/lib/api/users.ts", changeType: "create", purpose: "API functions with Zod validation" },
    ],
    diffTemplate: () => generateReactQueryDiff(),
  },
  {
    name: "Add form validation with react-hook-form",
    description: "Implement robust form validation with Zod schema and accessible error messages",
    category: "ux",
    files: [
      { path: "src/components/forms/LoginForm.tsx", changeType: "modify", purpose: "Add validation logic" },
      { path: "src/lib/validations/auth.ts", changeType: "create", purpose: "Zod schemas for auth forms" },
    ],
    diffTemplate: () => generateFormValidationDiff(),
  },
  {
    name: "Implement optimistic updates",
    description: "Add optimistic UI updates for better perceived performance on mutations",
    category: "ux",
    files: [
      { path: "src/hooks/useTodos.ts", changeType: "modify", purpose: "Add optimistic update logic" },
      { path: "src/components/TodoItem.tsx", changeType: "modify", purpose: "Handle optimistic state" },
    ],
    diffTemplate: () => generateOptimisticUpdateDiff(),
  },
  {
    name: "Add loading skeletons",
    description: "Replace loading spinners with content-shaped skeleton loaders",
    category: "ux",
    files: [
      { path: "src/components/skeletons/CardSkeleton.tsx", changeType: "create", purpose: "Reusable skeleton component" },
      { path: "src/components/Dashboard.tsx", changeType: "modify", purpose: "Integrate skeleton loading" },
    ],
    diffTemplate: () => generateSkeletonDiff(),
  },
  {
    name: "Implement error boundaries",
    description: "Add error boundaries with retry functionality and error reporting",
    category: "bugfix",
    files: [
      { path: "src/components/ErrorBoundary.tsx", changeType: "create", purpose: "Error boundary component" },
      { path: "src/App.tsx", changeType: "modify", purpose: "Wrap routes with error boundary" },
    ],
    diffTemplate: () => generateErrorBoundaryDiff(),
  },
  {
    name: "Add keyboard navigation",
    description: "Implement keyboard shortcuts and focus management for accessibility",
    category: "accessibility",
    files: [
      { path: "src/hooks/useKeyboardNav.ts", changeType: "create", purpose: "Keyboard navigation hook" },
      { path: "src/components/Menu.tsx", changeType: "modify", purpose: "Add keyboard support" },
    ],
    diffTemplate: () => generateKeyboardNavDiff(),
  },
  {
    name: "Implement infinite scroll",
    description: "Add infinite scroll with intersection observer for better performance",
    category: "performance",
    files: [
      { path: "src/hooks/useInfiniteScroll.ts", changeType: "create", purpose: "Infinite scroll hook" },
      { path: "src/components/FeedList.tsx", changeType: "modify", purpose: "Integrate infinite loading" },
    ],
    diffTemplate: () => generateInfiniteScrollDiff(),
  },
  {
    name: "Add animation with Framer Motion",
    description: "Implement smooth page transitions and micro-interactions",
    category: "ux",
    files: [
      { path: "src/components/PageTransition.tsx", changeType: "create", purpose: "Page transition wrapper" },
      { path: "src/components/ui/AnimatedButton.tsx", changeType: "create", purpose: "Animated button component" },
    ],
    diffTemplate: () => generateAnimationDiff(),
  },
];

// ============================================================================
// DIFF GENERATORS
// ============================================================================

function generateReactQueryDiff(): DiffLine[] {
  return [
    { lineNumber: 1, type: "removed", content: "import { useState, useEffect } from 'react';" },
    { lineNumber: 1, type: "added", content: "import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';" },
    { lineNumber: 2, type: "added", content: "import { toast } from 'sonner';" },
    { lineNumber: 3, type: "unchanged", content: "" },
    { lineNumber: 4, type: "removed", content: "const [users, setUsers] = useState([]);" },
    { lineNumber: 5, type: "removed", content: "const [loading, setLoading] = useState(true);" },
    { lineNumber: 6, type: "removed", content: "const [error, setError] = useState(null);" },
    { lineNumber: 7, type: "removed", content: "" },
    { lineNumber: 8, type: "removed", content: "useEffect(() => {" },
    { lineNumber: 9, type: "removed", content: "  fetch('/api/users')" },
    { lineNumber: 10, type: "removed", content: "    .then(res => res.json())" },
    { lineNumber: 11, type: "removed", content: "    .then(data => {" },
    { lineNumber: 12, type: "removed", content: "      setUsers(data);" },
    { lineNumber: 13, type: "removed", content: "      setLoading(false);" },
    { lineNumber: 14, type: "removed", content: "    });" },
    { lineNumber: 15, type: "removed", content: "}, []);" },
    { lineNumber: 4, type: "added", content: "const { data: users = [], isLoading, error, refetch } = useQuery({" },
    { lineNumber: 5, type: "added", content: "  queryKey: ['users']," },
    { lineNumber: 6, type: "added", content: "  queryFn: async () => {" },
    { lineNumber: 7, type: "added", content: "    const response = await fetch('/api/users');" },
    { lineNumber: 8, type: "added", content: "    if (!response.ok) throw new Error('Failed to fetch users');" },
    { lineNumber: 9, type: "added", content: "    return response.json();" },
    { lineNumber: 10, type: "added", content: "  }," },
    { lineNumber: 11, type: "added", content: "  staleTime: 5 * 60 * 1000," },
    { lineNumber: 12, type: "added", content: "  retry: 3," },
    { lineNumber: 13, type: "added", content: "});" },
  ];
}

function generateFormValidationDiff(): DiffLine[] {
  return [
    { lineNumber: 1, type: "added", content: "import { useForm } from 'react-hook-form';" },
    { lineNumber: 2, type: "added", content: "import { zodResolver } from '@hookform/resolvers/zod';" },
    { lineNumber: 3, type: "added", content: "import { z } from 'zod';" },
    { lineNumber: 4, type: "unchanged", content: "" },
    { lineNumber: 5, type: "added", content: "const loginSchema = z.object({" },
    { lineNumber: 6, type: "added", content: "  email: z.string().email('Please enter a valid email')," },
    { lineNumber: 7, type: "added", content: "  password: z.string()" },
    { lineNumber: 8, type: "added", content: "    .min(8, 'Password must be at least 8 characters')" },
    { lineNumber: 9, type: "added", content: "    .regex(/[A-Z]/, 'Password must contain uppercase letter')" },
    { lineNumber: 10, type: "added", content: "    .regex(/[0-9]/, 'Password must contain a number')," },
    { lineNumber: 11, type: "added", content: "});" },
    { lineNumber: 12, type: "unchanged", content: "" },
    { lineNumber: 13, type: "removed", content: "const [email, setEmail] = useState('');" },
    { lineNumber: 14, type: "removed", content: "const [password, setPassword] = useState('');" },
    { lineNumber: 13, type: "added", content: "const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({" },
    { lineNumber: 14, type: "added", content: "  resolver: zodResolver(loginSchema)," },
    { lineNumber: 15, type: "added", content: "});" },
  ];
}

function generateOptimisticUpdateDiff(): DiffLine[] {
  return [
    { lineNumber: 1, type: "added", content: "const queryClient = useQueryClient();" },
    { lineNumber: 2, type: "unchanged", content: "" },
    { lineNumber: 3, type: "added", content: "const toggleTodo = useMutation({" },
    { lineNumber: 4, type: "added", content: "  mutationFn: (id: string) => api.toggleTodo(id)," },
    { lineNumber: 5, type: "added", content: "  onMutate: async (todoId) => {" },
    { lineNumber: 6, type: "added", content: "    await queryClient.cancelQueries({ queryKey: ['todos'] });" },
    { lineNumber: 7, type: "added", content: "    const previous = queryClient.getQueryData(['todos']);" },
    { lineNumber: 8, type: "added", content: "    queryClient.setQueryData(['todos'], (old) =>" },
    { lineNumber: 9, type: "added", content: "      old.map(t => t.id === todoId ? { ...t, done: !t.done } : t)" },
    { lineNumber: 10, type: "added", content: "    );" },
    { lineNumber: 11, type: "added", content: "    return { previous };" },
    { lineNumber: 12, type: "added", content: "  }," },
    { lineNumber: 13, type: "added", content: "  onError: (err, _, context) => {" },
    { lineNumber: 14, type: "added", content: "    queryClient.setQueryData(['todos'], context.previous);" },
    { lineNumber: 15, type: "added", content: "    toast.error('Failed to update todo');" },
    { lineNumber: 16, type: "added", content: "  }," },
    { lineNumber: 17, type: "added", content: "});" },
  ];
}

function generateSkeletonDiff(): DiffLine[] {
  return [
    { lineNumber: 1, type: "added", content: "import { Skeleton } from '@/components/ui/skeleton';" },
    { lineNumber: 2, type: "unchanged", content: "" },
    { lineNumber: 3, type: "added", content: "function CardSkeleton() {" },
    { lineNumber: 4, type: "added", content: "  return (" },
    { lineNumber: 5, type: "added", content: "    <div className=\"p-6 rounded-xl border bg-card\">" },
    { lineNumber: 6, type: "added", content: "      <div className=\"flex items-center gap-4\">" },
    { lineNumber: 7, type: "added", content: "        <Skeleton className=\"h-12 w-12 rounded-full\" />" },
    { lineNumber: 8, type: "added", content: "        <div className=\"space-y-2 flex-1\">" },
    { lineNumber: 9, type: "added", content: "          <Skeleton className=\"h-4 w-1/3\" />" },
    { lineNumber: 10, type: "added", content: "          <Skeleton className=\"h-3 w-1/2\" />" },
    { lineNumber: 11, type: "added", content: "        </div>" },
    { lineNumber: 12, type: "added", content: "      </div>" },
    { lineNumber: 13, type: "added", content: "      <Skeleton className=\"h-20 w-full mt-4\" />" },
    { lineNumber: 14, type: "added", content: "    </div>" },
    { lineNumber: 15, type: "added", content: "  );" },
    { lineNumber: 16, type: "added", content: "}" },
  ];
}

function generateErrorBoundaryDiff(): DiffLine[] {
  return [
    { lineNumber: 1, type: "added", content: "import { Component, ReactNode } from 'react';" },
    { lineNumber: 2, type: "added", content: "import { AlertTriangle, RefreshCw } from 'lucide-react';" },
    { lineNumber: 3, type: "unchanged", content: "" },
    { lineNumber: 4, type: "added", content: "interface Props { children: ReactNode; fallback?: ReactNode; }" },
    { lineNumber: 5, type: "added", content: "interface State { hasError: boolean; error?: Error; }" },
    { lineNumber: 6, type: "unchanged", content: "" },
    { lineNumber: 7, type: "added", content: "export class ErrorBoundary extends Component<Props, State> {" },
    { lineNumber: 8, type: "added", content: "  state: State = { hasError: false };" },
    { lineNumber: 9, type: "unchanged", content: "" },
    { lineNumber: 10, type: "added", content: "  static getDerivedStateFromError(error: Error): State {" },
    { lineNumber: 11, type: "added", content: "    return { hasError: true, error };" },
    { lineNumber: 12, type: "added", content: "  }" },
    { lineNumber: 13, type: "unchanged", content: "" },
    { lineNumber: 14, type: "added", content: "  handleRetry = () => {" },
    { lineNumber: 15, type: "added", content: "    this.setState({ hasError: false, error: undefined });" },
    { lineNumber: 16, type: "added", content: "  };" },
    { lineNumber: 17, type: "unchanged", content: "" },
    { lineNumber: 18, type: "added", content: "  render() {" },
    { lineNumber: 19, type: "added", content: "    if (this.state.hasError) {" },
    { lineNumber: 20, type: "added", content: "      return this.props.fallback || <ErrorFallback onRetry={this.handleRetry} />;" },
    { lineNumber: 21, type: "added", content: "    }" },
    { lineNumber: 22, type: "added", content: "    return this.props.children;" },
    { lineNumber: 23, type: "added", content: "  }" },
    { lineNumber: 24, type: "added", content: "}" },
  ];
}

function generateKeyboardNavDiff(): DiffLine[] {
  return [
    { lineNumber: 1, type: "added", content: "import { useEffect, useCallback, useRef } from 'react';" },
    { lineNumber: 2, type: "unchanged", content: "" },
    { lineNumber: 3, type: "added", content: "export function useKeyboardNav<T extends HTMLElement>() {" },
    { lineNumber: 4, type: "added", content: "  const containerRef = useRef<T>(null);" },
    { lineNumber: 5, type: "added", content: "  const focusIndex = useRef(0);" },
    { lineNumber: 6, type: "unchanged", content: "" },
    { lineNumber: 7, type: "added", content: "  const handleKeyDown = useCallback((e: KeyboardEvent) => {" },
    { lineNumber: 8, type: "added", content: "    const items = containerRef.current?.querySelectorAll('[data-focusable]');" },
    { lineNumber: 9, type: "added", content: "    if (!items?.length) return;" },
    { lineNumber: 10, type: "unchanged", content: "" },
    { lineNumber: 11, type: "added", content: "    switch (e.key) {" },
    { lineNumber: 12, type: "added", content: "      case 'ArrowDown': case 'j':" },
    { lineNumber: 13, type: "added", content: "        e.preventDefault();" },
    { lineNumber: 14, type: "added", content: "        focusIndex.current = (focusIndex.current + 1) % items.length;" },
    { lineNumber: 15, type: "added", content: "        (items[focusIndex.current] as HTMLElement).focus();" },
    { lineNumber: 16, type: "added", content: "        break;" },
    { lineNumber: 17, type: "added", content: "      case 'ArrowUp': case 'k':" },
    { lineNumber: 18, type: "added", content: "        e.preventDefault();" },
    { lineNumber: 19, type: "added", content: "        focusIndex.current = (focusIndex.current - 1 + items.length) % items.length;" },
    { lineNumber: 20, type: "added", content: "        (items[focusIndex.current] as HTMLElement).focus();" },
    { lineNumber: 21, type: "added", content: "        break;" },
    { lineNumber: 22, type: "added", content: "    }" },
    { lineNumber: 23, type: "added", content: "  }, []);" },
    { lineNumber: 24, type: "unchanged", content: "" },
    { lineNumber: 25, type: "added", content: "  return { containerRef, handleKeyDown };" },
    { lineNumber: 26, type: "added", content: "}" },
  ];
}

function generateInfiniteScrollDiff(): DiffLine[] {
  return [
    { lineNumber: 1, type: "added", content: "import { useInfiniteQuery } from '@tanstack/react-query';" },
    { lineNumber: 2, type: "added", content: "import { useInView } from 'react-intersection-observer';" },
    { lineNumber: 3, type: "unchanged", content: "" },
    { lineNumber: 4, type: "added", content: "const { ref, inView } = useInView({ threshold: 0.5 });" },
    { lineNumber: 5, type: "unchanged", content: "" },
    { lineNumber: 6, type: "added", content: "const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({" },
    { lineNumber: 7, type: "added", content: "  queryKey: ['feed']," },
    { lineNumber: 8, type: "added", content: "  queryFn: ({ pageParam = 0 }) => fetchFeed({ cursor: pageParam })," },
    { lineNumber: 9, type: "added", content: "  getNextPageParam: (lastPage) => lastPage.nextCursor," },
    { lineNumber: 10, type: "added", content: "  initialPageParam: 0," },
    { lineNumber: 11, type: "added", content: "});" },
    { lineNumber: 12, type: "unchanged", content: "" },
    { lineNumber: 13, type: "added", content: "useEffect(() => {" },
    { lineNumber: 14, type: "added", content: "  if (inView && hasNextPage && !isFetchingNextPage) {" },
    { lineNumber: 15, type: "added", content: "    fetchNextPage();" },
    { lineNumber: 16, type: "added", content: "  }" },
    { lineNumber: 17, type: "added", content: "}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);" },
  ];
}

function generateAnimationDiff(): DiffLine[] {
  return [
    { lineNumber: 1, type: "added", content: "import { motion, AnimatePresence } from 'framer-motion';" },
    { lineNumber: 2, type: "unchanged", content: "" },
    { lineNumber: 3, type: "added", content: "const pageVariants = {" },
    { lineNumber: 4, type: "added", content: "  initial: { opacity: 0, y: 20 }," },
    { lineNumber: 5, type: "added", content: "  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }," },
    { lineNumber: 6, type: "added", content: "  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }," },
    { lineNumber: 7, type: "added", content: "};" },
    { lineNumber: 8, type: "unchanged", content: "" },
    { lineNumber: 9, type: "removed", content: "<div className=\"page-container\">" },
    { lineNumber: 9, type: "added", content: "<motion.div" },
    { lineNumber: 10, type: "added", content: "  variants={pageVariants}" },
    { lineNumber: 11, type: "added", content: "  initial=\"initial\"" },
    { lineNumber: 12, type: "added", content: "  animate=\"animate\"" },
    { lineNumber: 13, type: "added", content: "  exit=\"exit\"" },
    { lineNumber: 14, type: "added", content: "  className=\"page-container\"" },
    { lineNumber: 15, type: "added", content: ">" },
  ];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// MAIN EXPORTS
// ============================================================================

export function generateDiffLines(changeType: "create" | "modify" | "delete"): DiffLine[] {
  const scenario = randomItem(changeScenarios);
  return scenario.diffTemplate();
}

export function generateAgentChange(agentId: string): Omit<AgentChange, "id" | "timestamp" | "status"> {
  const scenario = randomItem(changeScenarios);
  const fileSpec = randomItem(scenario.files);
  
  return {
    agentId,
    fileId: `file-${Date.now()}`,
    filePath: fileSpec.path,
    changeType: fileSpec.changeType,
    originalContent: fileSpec.changeType !== "create" ? "// Original implementation..." : undefined,
    newContent: "// Improved implementation with best practices...",
    diffLines: scenario.diffTemplate(),
    explanation: scenario.description,
  };
}

export function generateTerminalLog(phase: "analysis" | "planning" | "implementation" | "validation"): {
  level: "info" | "warning" | "error" | "success" | "debug";
  message: string;
  agent?: string;
} {
  const behavior = agentBehaviors[phase];
  const isDetailLog = Math.random() > 0.7;
  
  const message = isDetailLog && behavior.details 
    ? randomItem(behavior.details)
    : randomItem(behavior.thoughts);
  
  const levels: Record<typeof phase, ("info" | "warning" | "error" | "success" | "debug")[]> = {
    analysis: ["info", "debug", "info"],
    planning: ["info", "info"],
    implementation: ["info", "success", "info"],
    validation: ["success", "info", "warning"],
  };
  
  const agents = [
    "Frontend Engineer",
    "Backend Engineer", 
    "QA Engineer",
    "Security Analyst",
    "Performance Optimizer",
    "Accessibility Auditor",
  ];
  
  return {
    level: randomItem(levels[phase]),
    message,
    agent: randomItem(agents),
  };
}

// ============================================================================
// ADVANCED SIMULATION ENGINE
// ============================================================================

interface SimulationTask {
  id: string;
  name: string;
  phase: "analysis" | "planning" | "implementation" | "validation";
  progress: number;
  status: "pending" | "running" | "completed" | "failed";
}

export class AISimulationEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private phase: "idle" | "analysis" | "planning" | "implementation" | "validation" = "idle";
  private stepCount = 0;
  private maxSteps = 25;
  private currentScenario: ChangeScenario | null = null;
  private tasksCompleted = 0;
  
  constructor(
    private onLog: (log: { level: "info" | "warning" | "error" | "success" | "debug"; message: string; agent?: string }) => void,
    private onChange: (change: Omit<AgentChange, "id" | "timestamp" | "status">) => void,
    private onProgress: (step: number, total: number, phase: string) => void,
    private agentId: string
  ) {}
  
  start() {
    if (this.intervalId) return;
    
    this.phase = "analysis";
    this.stepCount = 0;
    this.currentScenario = randomItem(changeScenarios);
    
    this.onLog({ 
      level: "info", 
      message: `🚀 Starting AI analysis: ${this.currentScenario.name}`, 
      agent: "System" 
    });
    
    this.intervalId = setInterval(() => {
      this.tick();
    }, randomInt(1200, 2500)); // Varied timing for realism
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.phase = "idle";
  }
  
  private tick() {
    this.stepCount++;
    
    // Phase transitions with varying lengths
    if (this.stepCount <= 5) {
      this.phase = "analysis";
    } else if (this.stepCount <= 10) {
      if (this.phase === "analysis") {
        this.onLog({ level: "success", message: "✓ Analysis complete. Moving to planning...", agent: "System" });
      }
      this.phase = "planning";
    } else if (this.stepCount <= 20) {
      if (this.phase === "planning") {
        this.onLog({ level: "success", message: "✓ Plan approved. Starting implementation...", agent: "System" });
      }
      this.phase = "implementation";
    } else {
      if (this.phase === "implementation") {
        this.onLog({ level: "info", message: "🔍 Running validation checks...", agent: "System" });
      }
      this.phase = "validation";
    }
    
    // Generate contextual log
    const log = generateTerminalLog(this.phase);
    this.onLog(log);
    
    // Generate changes during implementation
    if (this.phase === "implementation" && Math.random() > 0.5) {
      const change = this.generateContextualChange();
      this.onChange(change);
      
      this.onLog({
        level: "success",
        message: `📝 Generated: ${change.explanation.slice(0, 50)}...`,
        agent: log.agent,
      });
    }
    
    // Progress callback
    this.onProgress(this.stepCount, this.maxSteps, this.phase);
    
    // Cycle complete
    if (this.stepCount >= this.maxSteps) {
      this.tasksCompleted++;
      this.onLog({ 
        level: "success", 
        message: `✅ Cycle ${this.tasksCompleted} complete. Starting new analysis...`, 
        agent: "System" 
      });
      this.stepCount = 0;
      this.currentScenario = randomItem(changeScenarios);
      this.onLog({ 
        level: "info", 
        message: `🔄 New task: ${this.currentScenario.name}`, 
        agent: "System" 
      });
    }
  }
  
  private generateContextualChange(): Omit<AgentChange, "id" | "timestamp" | "status"> {
    if (!this.currentScenario) {
      return generateAgentChange(this.agentId);
    }
    
    const fileSpec = randomItem(this.currentScenario.files);
    
    return {
      agentId: this.agentId,
      fileId: `file-${Date.now()}`,
      filePath: fileSpec.path,
      changeType: fileSpec.changeType,
      originalContent: fileSpec.changeType !== "create" ? "// Original content..." : undefined,
      newContent: "// Optimized implementation...",
      diffLines: this.currentScenario.diffTemplate(),
      explanation: `${fileSpec.purpose} - ${this.currentScenario.description}`,
    };
  }
}

export type TerminalLogLevel = "info" | "warning" | "error" | "success" | "debug";
