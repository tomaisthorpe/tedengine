# @tedengine/ted

## 0.2.0

### Minor Changes

- 046a475: Add ability to change game size after bootstrap
- 7efb324: Add location of mouse clicks
- 94633ea: Add ability to provide game canvas size
- 0f4616f: Add draft of collision classes with Solid and NoCollide

### Patch Changes

- 062c6bc: Fix WebGL viewpoint size using document size instead of canvas size
- da2f643: Prevent mouse clicks triggering events outside of canvas
- 8955a01: Refactor physics worker communication to use Channel Message API
- 956ce20: Change window resize event to Resize Observer
- 26b4dcf: Refactor index exports to use export \* from
- 53884f9: Refactor Engine <> Fred communication to use Channel Message API
- ba182a2: Add collisions in internal physics simulate event

## 0.1.0

### Minor Changes

- 5a81878: Add alternative Cannon physics engine
- 1a1967a: Remove Ammo physics engine
- 2f83d86: Add mouse tracking to controller
- 9de3bf1: Add mouse position relative to canvas on mouse move

### Patch Changes

- 5bebeaa: Change to strict equals in controller
- 386d185: Remove onWorldUpdate callback from physics engines
- 9277c7c: Add interface for physics worlds

## 0.0.3

### Patch Changes

- Use globalThis instead of global in Worker

## 0.0.2

### Patch Changes

- Fix Ammo undefined this error
