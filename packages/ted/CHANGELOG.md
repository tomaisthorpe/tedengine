# @tedengine/ted

## 0.3.1

### Patch Changes

- Bump to fix published version

## 0.3.0

### Minor Changes

- 5b7cf76: Add query line method to physics world
- 4e02ef4: Add actor on world add callback
- 983f717: New physics bodies are now sent with simulate step
- 8d99d50: Add ability to set volume on sound
- de146de: Add ability to set physics body options, starting with fixed rotation
- 12311cc: Fix 'leave' triggered on game state push
- 97feac7: Add indent level for debug value rows
- b876e12: Remove use of null from engine
- 917fdd6: Add on collider callbacks for collision classes
- d6410ae: Add query area to physics world
- 2608530: Add trigger option to components
- 1230808: Introduce transform updates to physics
- d594f63: Refactor engine to accept worker scope instead of post message func
- e511f54: Add set linear and angular velocity
- 40accc3: Add setQuaterion to scene component
- 4fcd0c6: Add query options to physics world to allow for querying for specific collision classes
- 59debd9: Measure world and physics update times
- 19f7eb1: Physics state changes are now queued and sent with physics simulate step
- 64272c0: Merge world and level together
- afcf542: Add ability to set physics body type
- db17f08: Add to set friction on components
- f42a9bd: Add error message when context is lost
- 2b234c8: Add ability to add custom collision classes
- 171912a: Add set linear and angular damping
- e167989: Add query line method to world

### Patch Changes

- 39292c1: Fix engine starting next frame before previous is finished
- eba962e: Moved physics worker to physics folder
- 48bf8e5: Fix non-strict comparisons
- 0693330: Fix loading and error messages not matching canvas size
- fcd2d72: Bump dependies with npm audit
- eef7611: Ensure game and physics workers stop on page change
- 5076773: Bump vunerable dependencies with npm audit
- ec7f01c: Prevent state changes being sent to physics worker when no collider set

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
