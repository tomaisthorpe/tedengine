# CLAUDE.md - LLM Onboarding Guide for TED Engine

This file helps LLMs quickly understand the TED game engine architecture and codebase structure.

## Quick Architecture Overview

**TED** is a WebGL2-based game engine built with TypeScript, designed for rapid game jam development.

### Multi-Threaded Architecture

The engine runs on **3 separate threads** communicating via MessageChannel:

1. **Engine Worker** (`packages/ted/src/engine/engine.ts`)
   - Runs game logic, ECS systems, and world updates
   - Executes at 60 FPS (16.67ms per frame)
   - Generates render tasks and sends to Fred

2. **Fred (Main Thread)** (`packages/ted/src/fred/fred.ts`)
   - Handles WebGL2 rendering (must be on main thread)
   - Manages audio playback (Howler.js)
   - Owns the HTML canvas element

3. **Physics Worker** (`packages/ted/src/physics/worker.ts`)
   - Runs Rapier3D physics simulation
   - Communicates physics state changes back to engine

**Why this architecture?**
- WebGL must run on main thread (can't use OffscreenCanvas everywhere yet)
- Physics runs independently to avoid blocking game logic
- Game logic separated from rendering for better performance

## Bootstrap Sequence

Understanding startup is critical:

```
1. Worker creates TEngine instance
   ↓
2. Engine sends BOOTSTRAP message to main thread
   ↓
3. Main thread creates TFred instance
   ↓
4. Fred creates canvas, initializes WebGL2
   ↓
5. Fred sends READY message to Engine
   ↓
6. Engine loads game states
   ↓
7. Engine starts 60 FPS update loop
```

**Key files:**
- Engine side: `packages/ted/src/engine/engine.ts` (constructor + triggerBootstrap)
- Main thread: `packages/ted/src/ui/components/Game.tsx` (React wrapper)
- Fred: `packages/ted/src/fred/fred.ts` (bootstrap method)

## File Organization Map

### Core Engine (`packages/ted/src/`)

```
engine/
├── engine.ts              # Main engine class, game loop, state management
├── engine-system.ts       # Base class for engine-level systems
├── config.ts              # Engine configuration types
└── messages.ts            # Engine ↔ Fred message types

core/                      # ECS Foundation
├── world.ts               # Entity/Component/System manager
├── component.ts           # Component base class and container
├── system.ts              # System base class with priorities
├── bundle.ts              # Reusable component collections
├── entity-query.ts        # Efficient component queries
├── event-queue.ts         # Event system for decoupling
├── game-state.ts          # Game state with lifecycle hooks
├── game-state-manager.ts  # State stack (switch/push/pop)
└── resource-manager.ts    # Asset loading and caching

renderer/                  # WebGL Rendering (Fred side)
├── renderer.ts            # Main WebGL2 renderer
├── program.ts             # WebGL program base class
├── color-program.ts       # Solid color rendering
├── textured-program.ts    # Textured mesh rendering
├── renderable-mesh.ts     # GPU mesh representation
├── frame-params.ts        # Per-frame rendering data
├── uniform-manager.ts     # Shader uniform management
└── jobs.ts                # Renderer-side job handlers

physics/                   # Physics Integration
├── physics-system.ts      # Engine-side physics system
├── physics-world.ts       # Physics interface
├── rapier3d-world.ts      # Rapier implementation
├── rigid-body-component.ts # Physics component
├── colliders.ts           # Collision geometry config
├── worker.ts              # Physics worker setup
└── jobs.ts                # Physics job messages

graphics/                  # Mesh and Material Definitions
├── mesh.ts                # 3D geometry
├── textured-mesh.ts       # Textured 3D geometry
├── texture.ts             # Texture handling
├── material.ts            # Color/textured materials
├── mesh-load-system.ts    # OBJ/MTL file loading
├── render-tasks-system.ts # Generates render commands
└── tilemap.ts             # Tileset support

components/                # Entity Components
├── types.ts               # Transform, visibility, mesh components
├── sprite-component.ts    # 2D sprites with layers
├── animated-sprite-component.ts # Sprite animation
├── global-transform.ts    # Transform hierarchy system
├── particles-component.ts # Particle effects
├── camera-component.ts    # Camera configuration
└── tilemap-component.ts   # Tilemap rendering

input/                     # Input Handling
├── input-manager.ts       # Unified input handling
├── keyboard.ts            # Keyboard input
├── mouse.ts / mouse-input.ts # Mouse handling
├── touch.ts               # Touch input
├── player-input.ts        # Game input abstraction
└── events.ts              # Input event types

audio/                     # Audio System (runs on Fred thread)
├── audio.ts               # Sound management
├── sound.ts               # Individual sound
└── jobs.ts                # Audio loading jobs

ui/                        # React Integration
├── context.ts             # 5 React Context providers
├── hooks.ts               # useGameContext, useEventQueue, etc.
└── components/
    ├── Game.tsx           # Main wrapper component
    ├── DebugPanel.tsx     # Debug overlay
    └── ... (other UI components)

fred/                      # Main Thread (Renderer + Audio)
├── fred.ts                # Main thread controller
├── browser.ts             # Browser capability detection
└── events.ts              # Window events

jobs/                      # Cross-Thread Task System
├── job-manager.ts         # Job routing and execution
├── jobs.ts                # Job type definitions
├── context-types.ts       # Engine/Renderer/Audio/Physics
└── messages.ts            # Job relay messages
```

### Example Games (`apps/docs/src/examples/`)

```
examples/
├── game-states.ts         # Complete multi-state game example
├── 3d/                    # 3D rendering examples
├── 2d/                    # 2D sprite examples
├── ecs/                   # ECS pattern examples
└── ui/                    # React UI integration examples
```

## Critical Entry Points

When exploring the codebase, start with these files:

1. **`packages/ted/src/engine/engine.ts`** - Main engine class
   - Constructor: Initialize engine
   - `update()`: 60 FPS game loop
   - `load()`: Game state registration
   - `start()`: Begin game loop

2. **`packages/ted/src/core/world.ts`** - ECS implementation
   - `createEntity()`: Create entities
   - `addComponent()`: Attach components
   - `createQuery()`: Query entities by components
   - `addSystem()`: Register systems

3. **`packages/ted/src/ui/components/Game.tsx`** - React wrapper
   - Creates TFred instance
   - Sets up Context providers
   - Manages engine lifecycle

4. **`apps/docs/src/examples/game-states.ts`** - Complete working example
   - Shows full game structure
   - Demonstrates best practices

## Entity Component System (ECS)

### Entities
Simple numeric IDs (auto-incrementing integers)

### Components
Data-only classes extending `TComponent`:
```typescript
class HealthComponent extends TComponent {
  constructor(public hp: number = 100) {
    super();
  }
}
```

**Built-in Components:**
- `TTransformComponent` - Position, rotation, scale
- `TGlobalTransformComponent` - World-space transform
- `TVisibilityComponent` - Show/hide entities
- `TSpriteComponent` - 2D sprites with layers
- `TMeshComponent` - 3D mesh reference
- `TMaterialComponent` - Color/texture material
- `TTextureComponent` - Texture reference
- `TRigidBodyComponent` - Physics body
- `TCameraComponent` - Camera configuration
- `TActiveCameraComponent` - Marks active camera

### Component Bundles
Pre-configured component sets:
```typescript
// Common bundle
TTransformBundle = [TTransformComponent, TGlobalTransformComponent]

// Override defaults
TTransformBundle.with(new TTransformComponent(customTransform))
```

### Systems
Behavior that operates on entities:
```typescript
class MySystem extends TSystem {
  private query: TEntityQuery;

  constructor(world: TWorld) {
    super();
    this.query = world.createQuery([TTransformComponent, MyComponent]);
  }

  public async update(engine: TEngine, world: TWorld, delta: number) {
    const entities = this.query.execute();
    for (const entity of entities) {
      const transform = world.getComponent(entity, TTransformComponent);
      // Update logic here
    }
  }
}
```

**System Priorities:**
- `First` - Runs before everything
- `PreUpdate` - Before main update
- `Update` - Main game logic (default)
- `PostUpdate` - After main update
- `Last` - Runs after everything

### Component Queries
Efficient entity filtering:
```typescript
const query = world.createQuery([
  TTransformComponent,
  TSpriteComponent,
  // Returns only entities with ALL these components
]);

const entities = query.execute();
```

## Game States

Game states manage different screens/levels with lifecycle hooks:

```typescript
class MyGameState extends TGameState {
  public async onCreate(engine: TEngine) {
    // Load assets
    const rp = new TResourcePack(engine, {
      textures: [myTexture],
    });
    await rp.load();

    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    // Create entities and systems
    const entity = this.world.createEntity([
      TTransformBundle.with(...),
      new TSpriteComponent(...),
    ]);

    this.world.addSystem(new MySystem(this.world));
  }

  public async onUpdate(engine: TEngine, delta: number) {
    // Per-frame game state logic (optional)
  }

  public async onEnter(engine: TEngine, args?: any) {
    // Called when state becomes active (after push/switch)
  }

  public async onLeave(engine: TEngine) {
    // Called when state becomes inactive
  }

  public async onResume(engine: TEngine) {
    // Called when returning from a pushed state
  }
}
```

**State Management:**
```typescript
// Switch to different state (destroys current)
engine.gameStateManager.switch('menu');

// Push state on stack (keeps current in background)
engine.gameStateManager.push('pause', { score: 100 });

// Pop state (returns to previous)
engine.gameStateManager.pop();
```

## React Integration

The engine has bidirectional communication with React UI:

### Engine → React (Update UI)
```typescript
// In game state or system
this.engine.updateGameContext({
  health: 100,
  score: 50,
  lives: 3
});
```

### React → Engine (Handle UI Events)
```typescript
const GameUI = () => {
  const gameContext = useGameContext();
  const events = useEventQueue();

  return (
    <div>
      <p>Health: {gameContext.health}</p>
      <button onClick={() => events?.broadcast({ type: 'PAUSE_GAME' })}>
        Pause
      </button>
    </div>
  );
};
```

### Engine Listens for React Events
```typescript
// In game state
this.events.addListener('PAUSE_GAME', () => {
  this.engine.gameStateManager.push('pause');
});
```

### Available React Hooks
- `useGameContext()` - Access custom game data
- `useEventQueue()` - Broadcast events to engine
- `useFred()` - Access audio/canvas
- `useEngineContext()` - Loading state
- `useUIContext()` - Screen size/scaling

## Minimal Game Example

```typescript
// game-worker.ts
import { TEngine, TGameState, TTransformBundle, TTransformComponent, TTransform } from '@tedengine/ted';

class MyGame extends TGameState {
  public async onCreate(engine: TEngine) {
    this.onReady(engine);
  }

  public onReady(engine: TEngine) {
    // Create a simple entity
    const entity = this.world.createEntity([
      TTransformBundle.with(
        new TTransformComponent(
          new TTransform([0, 0, 0], [0, 0, 0], [1, 1, 1])
        )
      ),
    ]);
  }
}

const config = {
  states: { game: MyGame },
  defaultState: 'game',
};

new TEngine(config, self as DedicatedWorkerGlobalScope);
```

```typescript
// main.tsx
import { TGame } from '@tedengine/ted';

function App() {
  return (
    <TGame
      game={new Worker(new URL('./game-worker.ts', import.meta.url))}
    />
  );
}
```

## Game Loop (60 FPS)

Each frame (every ~16.67ms):
```
1. Process event queues
2. Update input manager
3. Run engine systems (priority ordered)
4. Update active game state
   ├─ Update world systems
   ├─ Step physics simulation
   ├─ Update transform hierarchies
   └─ Generate render tasks
5. Collect render parameters (camera, lighting, tasks)
6. Send frame params to Fred
```

Fred processes in parallel:
```
1. Clear WebGL context
2. Setup uniform buffers (lighting, matrices)
3. Render each task (meshes, sprites, debug)
4. Present to screen
```

## Common Gotchas

1. **Examples run as Workers**
   ```typescript
   // Note the Worker URL import pattern
   <TGame game={new Worker(new URL('@examples/game.ts', import.meta.url))} />
   ```

2. **OffscreenCanvas Required**
   - Browser must support OffscreenCanvas
   - Checked in `TBrowser` class: `packages/ted/src/fred/browser.ts`

3. **Components are Data-Only**
   - No methods on components
   - All behavior goes in Systems

4. **Systems Run in Priority Order**
   - Set priority explicitly if order matters
   - Default is `Update` priority

5. **Transform Hierarchy**
   - Always use both `TTransformComponent` and `TGlobalTransformComponent`
   - `TGlobalTransformSystem` computes world-space transforms

6. **Physics Runs Async**
   - Physics updates happen in worker
   - State synced back to engine each frame

7. **Sprite Layers**
   - 15 sprite layers for Z-ordering
   - `Background_0-4`, `Midground_0-4`, `Foreground_0-4`

## Monorepo Structure

- **NX-based monorepo** (v22.0.1)
- **Vite** for building (ES + CJS output)
- **Packages:**
  - `packages/ted` - Engine library
  - `apps/docs` - Docusaurus documentation

### Common Commands
```bash
# Build engine library
npx nx build ted

# Run documentation site locally
npx nx serve docs

# Run tests
npx nx test ted

# Lint
npx nx lint ted
```

## Message Passing Architecture

The engine uses MessageChannel for thread communication:

### Engine → Fred
```typescript
// packages/ted/src/engine/messages.ts
TEngineMessageBootstrap   // Initialize Fred
TEngineMessageFrameParams // Send render data
TEngineMessageUpdateGameContext // Update React UI
```

### Fred → Engine
```typescript
TFredMessageReady         // Fred is ready
TFredMessageEvent         // Forward events from React
```

### Job System
Cross-thread async tasks routed by context:
- `TJobContextEngine` - Jobs handled by engine
- `TJobContextRenderer` - Jobs handled by Fred
- `TJobContextAudio` - Audio jobs (on Fred thread)
- `TJobContextPhysics` - Jobs handled by physics worker

## Physics Integration

```typescript
import { TRigidBodyComponent } from '@tedengine/ted';

// Create physics entity
const entity = this.world.createEntity([
  TTransformBundle.with(...),
  new TRigidBodyComponent(
    { type: 'dynamic', mass: 1 },           // Physics options
    { type: 'box', hx: 0.5, hy: 0.5 }      // Collider config
  ),
]);

// Apply forces
world.applyCentralForce(entity, vec3.fromValues(10, 0, 0));

// Raycasting
const result = await world.queryLine(from, to);
```

## Audio System (Runs on Fred Thread)

```typescript
// Load sound
const sound = await engine.resources.load(soundUrl, TSound);

// Play
sound.play();

// Volume
sound.setVolume(0.5);

// Loop
sound.setLoop(true);

// Mute
sound.setMute(true);
```

## Debug Panel

Built-in debug panel with collapsible sections:
```typescript
// In game state
this.engine.debugPanel?.addRow({
  label: 'Player Health',
  value: () => this.playerHealth,
});

this.engine.debugPanel?.addRow({
  type: 'button',
  label: 'Reset Game',
  onClick: () => this.reset(),
});
```

## Key Dependencies

- **Rendering:** WebGL2 (custom implementation)
- **Physics:** Rapier3D (@dimforge/rapier3d-compat)
- **Audio:** Howler.js
- **Math:** gl-matrix
- **React:** React 19 (for UI overlay)
- **Styling:** styled-components

## Project Status

The engine is in **active development**. Features are missing, things are broken, breaking changes will happen frequently.

See the README roadmap for current priorities.
