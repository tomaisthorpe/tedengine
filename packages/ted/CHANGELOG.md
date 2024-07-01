# @tedengine/ted

## 0.8.0

### Minor Changes

- 4421cf4: Fix get resource return signature missing undefined
- f8aeeb5: Add basic touch handling
- 71a205a: Add destroy method to components
- 89096a8: Add 2D physics mode

### Patch Changes

- 0b5713a: Update dependencies

## 0.7.0

### Minor Changes

- 1ce84c7: Replace Cannon physics with Rapier

### Patch Changes

- 1a49dcf: Fix various type issues

## 0.6.0

### Minor Changes

- 3f350bc: Remove world space from mouse events
- a136ff6: Add bounds to fixed axis camera controller
- d1567e5: Add `crisp-edges` image rendering mode
- 4aa22f5: Add configurable gravity
- f09fe41: Add configuable filter on canvases
- 1279900: Add engine to game state constructor
- 05a2472: Move projection matrix to camera
- 32cedee: Add clipToWorldSpace in cameras

### Patch Changes

- 42372cd: Fix projection matrix not using rendering size
- c60a5ea: Fix box collider height/depth mixed up
- 3edf75f: Fix mouse px/py using incorrect canvas size

## 0.5.1

### Patch Changes

- 48aff65: Fix infinitely resizing container due to `display:grid`

## 0.5.0

### Minor Changes

- e6c4873: Add fullscreen option in the UI
- ef6d5f4: Add support for auto aspect ratio
- d08e962: Add remove actor from world
- fbd8670: Add configurable rendering size
- 418a865: Add configurable fixed aspect ratio to game

## 0.4.1

### Patch Changes

- 137c67c: Fix destroy causing exception on engine ports
- 5588c60: Output workers in /workers/ dir

## 0.4.0

### Minor Changes

- 16d0d3c: Add worldX/Y to mouse events
- deb28bb: Add lerp for camera translation and rotation
- d85edd0: Renamed top down camera controller to fixed axis
- d534599: Rename lookAt to moveTo to match implementation
- 08679b1: Add simple deadzone on fixed axis controller
- 2425556: Remove mouse/keyboard event listeners on teardown
- 536d608: Add "look at" method to transform
- 2014832: Refactor base camera to use vec3 instead of numbers
- f615bb3: Move component mass to phyiscs options
- ab0cc4d: Add simple top down camera controller
- 2e3fefc: Add support for camera controllers
- 02d27b9: Add follow component camera controller
- adee6b4: Change top down camera to fixed axis
- d9e6f3c: Allow updating mass after body register

### Patch Changes

- f77fbd4: Rename addRelay to setRelay to match behaviour
- a82921c: Fix rotation on top down camera controller
- d0efc71: Simplify fixed axis camera controller
- f336756: Bump dependencies

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
