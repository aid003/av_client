# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Telegram Mini App** that serves as a visual CRM and automation platform for Avito (Russian classifieds marketplace). Built with Next.js 16, React 19, and TypeScript, it features a visual flow-based sales script editor, AI-powered chat automation, and multi-tenant architecture.

**Key Technologies:**
- Next.js 16.0.7 with App Router
- React 19.2.0 with React Compiler enabled
- TypeScript 5
- Tailwind CSS 4
- Zustand for state management
- XYFlow (React Flow) for visual script editor
- Telegram Mini App SDK (@tma.js/sdk-react)
- Radix UI component library

## Development Commands

```bash
# Development server (HTTP)
npm run dev

# Development server with HTTPS (for testing Telegram Mini App)
npm run dev:https

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

**Development URLs:**
- Local development: http://localhost:3000
- API backend (production): https://auto-answer-avt.ru
- API backend (dev, commented out): http://localhost:8000

## Architecture - Feature-Sliced Design (FSD)

The codebase follows strict Feature-Sliced Design with clear layer separation:

### Directory Structure

```
src/
├── app/              # Next.js App Router pages (leads, chats, ads, avito, etc.)
├── entities/         # Domain entities (11 entities: lead, sales-script, avito-ad, etc.)
├── features/         # Feature modules (24 features: create-lead, script-editor, etc.)
├── widgets/          # Composite UI components (12 widgets: leads-list, script-editor, etc.)
└── shared/           # Shared infrastructure
    ├── api/          # API client with retry logic and security validation
    ├── providers/    # React providers (Telegram, Auth, Theme, Notifications)
    ├── ui/           # Reusable UI components (Radix-based)
    ├── hooks/        # Custom React hooks
    └── lib/          # Utilities, types, and auth store
```

### Layer Dependencies (Top-Down)

- **App** → can import from all layers
- **Widgets** → can import from Features, Entities, Shared
- **Features** → can import from Entities, Shared
- **Entities** → can import from Shared only
- **Shared** → no dependencies on upper layers

### Entity Structure Pattern

Each entity follows this structure:
```
entities/<entity-name>/
├── api/              # API functions (CRUD operations)
├── model/            # Zustand store, types, constants
├── ui/               # Entity-specific UI components
└── lib/              # Entity utilities
```

Example: `src/entities/sales-script/` contains all sales script domain logic.

## Authentication Flow

1. **TelegramProvider** initializes Telegram SDK and extracts `initData`
2. **AuthProxy** (`src/shared/providers/AuthProxy.tsx`):
   - Authenticates via `/api/auth/telegram` endpoint with `initData`
   - Stores auth data in Zustand: `useAuthStore`
   - Returns: `{ tenant: {...}, user: {...} }`
   - Handles blocked users (403 status)
3. All pages use `useTelegramAuth()` hook to access auth state

**Important:** This is a Telegram-only authentication system. No traditional login/password flow exists.

## API Integration Patterns

### Centralized API Client

**Location:** `src/shared/api/client.ts`

The `ApiClient` class provides:
- Automatic retry with exponential backoff
- 30-second timeout
- Security validation (blocks dangerous patterns)
- Error normalization
- Methods: `get`, `post`, `put`, `patch`, `delete`

### Usage Pattern

```typescript
// In entity API files (e.g., src/entities/lead/api/leads.ts)
import { apiClient } from '@/shared/api';

export async function getLeads(tenantId: string, params?: LeadListParams) {
  return apiClient.get<LeadListResponse>('/api/crm/leads', { tenantId, ...params });
}
```

### Multi-Tenant Architecture

All API calls include `tenantId` parameter from `authData.tenant.id`. Never make API calls without tenant context.

### Security Validation

The API client validates all requests for dangerous patterns:
- Shell commands (busybox, wget, curl, nc, bash, sh, cmd)
- Path traversal attempts (`../../`)
- Suspicious file paths (`/tmp/`, `/proc/`)
- SQL injection patterns
- Script injection attempts

Validation is applied to URLs, query parameters, and request bodies automatically.

## Visual Script Editor (XYFlow)

**Location:** `src/features/script-editor/`

### Node Types

The editor supports 6 block types for creating conversation flows:
- **START**: Entry point (exactly 1 required per script)
- **MESSAGE**: Send a text message
- **QUESTION**: Ask question and extract slot value
- **ROUTER**: Conditional branching (YES/NO/OTHER)
- **LLM_REPLY**: Generate AI-powered response
- **END**: Terminate conversation

### Script Editor Store

**Location:** `src/features/script-editor/model/store.ts` (897 lines)

The Zustand store manages:
- Nodes and edges (XYFlow state)
- Slots (variables extracted during conversation)
- LLM settings (models, prompts, temperature, max tokens)
- Validation state (errors/warnings)
- Dirty state tracking
- Converters between UI representation and server definition format

### Script Definition Format

```typescript
interface ScriptDefinition {
  version: number;
  meta: {
    slots: Record<string, SlotDefinition>;
    llm_settings: LLMSettings;
    read_timing: ReadTimingSettings;
  };
  blocks: ScriptBlock[];
  edges: ScriptEdge[];
}
```

### Keyboard Shortcuts

- **Ctrl+C**: Copy selected nodes
- **Ctrl+V**: Paste copied nodes
- **Ctrl+D**: Duplicate selected nodes
- **Delete**: Delete selected nodes/edges
- **Box select**: Drag to select multiple nodes

### Validation

Server-side validation endpoint: `/api/sales-scripts/validate`

Validates:
- Orphan blocks (not connected to flow)
- Missing START or END blocks
- Invalid slot references
- Unreachable nodes
- Invalid edge conditions

Validation errors/warnings are displayed visually on the canvas.

## State Management (Zustand)

Global stores:
- **Auth Store**: `src/shared/lib/store.ts` - User and tenant data
- **Script Editor Store**: `src/features/script-editor/model/store.ts` - Canvas state
- **Entity Stores**: Each entity has its own store for list/cache management

Pattern: Create slice → Create store → Export typed hooks

```typescript
// Entity store pattern
export const useSalesScriptsStore = create<SalesScriptsStore>((set) => ({
  scripts: [],
  isLoading: false,
  // ... store logic
}));
```

## Responsive Patterns

### Master-Detail UI

Pages like Leads (`src/app/leads/page.tsx`) use responsive patterns:
- **Mobile**: List view → Sheet (drawer) for detail view
- **Desktop**: Split pane with ResizablePanelGroup (list left, detail right)
- Detection via `useIsMobile()` hook

### Sidebar Behavior

- Collapsible sidebar managed by `<SidebarProvider>`
- Auto-collapse on specific pages (script editor, pages with detail views)
- Persistent state across navigation

## Theme System

Themes are managed via `ThemeProvider` (`src/shared/providers/ThemeProvider.tsx`):
- **Auto-sync with Telegram**: Inherits light/dark mode from Telegram app
- **Manual override**: Users can select light/dark/system modes
- Tailwind CSS classes: `dark:` prefix for dark mode styles

## Notification System

**NotificationPollingProvider** (`src/shared/providers/NotificationPollingProvider.tsx`):
- Polls `/api/notifications` endpoint every 60 seconds
- Displays count in sidebar notification bell
- No WebSocket connection required
- Only polls when authenticated

## Image Configuration

Images from Avito are allowed via Next.js image domains:
- `*.img.avito.st`
- `www.avito.st`
- `*.avito.st`

SVG CSP policy: `default-src 'self'; script-src 'none'; sandbox;`

Images are unoptimized (`unoptimized: true`) to support loading from private IPs.

## LLM Integration

Scripts support AI operations:
- **Generating replies**: LLM_REPLY blocks
- **Response classification**: ROUTER blocks (YES/NO/OTHER)
- **Slot extraction**: QUESTION blocks
- **Answer relevance checking**: Validation in chat flows
- **Question rephrasing**: Dynamic message generation

LLM settings are configurable per script:
- Default models for each operation type
- Custom system/user prompts
- Temperature and max tokens
- Response style (SHORT, NORMAL, DETAILED)

Metadata endpoint: `/api/llm/metadata` - Returns available models and their capabilities.

## Testing Telegram Integration

To test as a Telegram Mini App:

1. Use HTTPS in development: `npm run dev:https`
2. Test in Telegram app (mobile or desktop)
3. Access via bot that opens the Mini App
4. Eruda dev tools available in dev mode for mobile debugging

## Common Gotchas

1. **All pages are client components**: App Router pages use `'use client'` directive due to Telegram SDK and Zustand dependencies
2. **React Compiler enabled**: React 19 experimental compiler is active - be mindful of component memoization
3. **Tenant context required**: Never make API calls without including `tenantId` from auth store
4. **Security validation**: API client automatically validates requests - avoid patterns that look like shell commands
5. **Canvas state is complex**: The script editor store is 897 lines - use existing functions rather than modifying node/edge state directly
6. **Multi-provider stack**: Components must be wrapped in provider hierarchy (see `src/shared/providers/Providers.tsx`)

## Code Style

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use Radix UI for new components (already integrated)
- Follow Tailwind conventions for styling
- Use `cn()` utility from `src/shared/lib/utils.ts` for conditional classes
- Export types alongside implementations
- Keep entity logic within entity boundaries (FSD)

## API Endpoint Reference

Key endpoints:
```
POST   /api/auth/telegram              # Authenticate with Telegram initData
GET    /api/crm/leads                  # List leads
GET    /api/sales-scripts/             # List scripts
POST   /api/sales-scripts/             # Create script
GET    /api/sales-scripts/{id}         # Get script
PUT    /api/sales-scripts/{id}         # Update script
DELETE /api/sales-scripts/{id}         # Delete script
POST   /api/sales-scripts/validate     # Validate script definition
GET    /api/avito-ads/                 # List Avito ads
POST   /api/avito-ads/sync/            # Sync ads from Avito
GET    /api/llm/metadata               # Get LLM model info
GET    /api/notifications              # Poll notifications
```

All endpoints require tenant context (passed as query param or in body).
