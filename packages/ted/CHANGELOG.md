# @tedengine/ted

## 0.17.0

### Minor Changes

- b80c5e6: Added more linter rules around promises
- 72fb88d: Add config for clear color and loading screen
- fcc58c2: Add default texture options to game config
- a1caa3b: Add hierarchical segment timer
- 506bb68: Add segment timers for each system
- 60f0ddc: Update dependencies
- c312fbf: Add child debug rows
- c1d6597: Remember which debug sections/rows are expanded/collapsed
- 635c92f: Fix all remaining linter issues
- cd85cc6: Add `addSystems` method

## 0.16.1

### Patch Changes

- 1f91e0e: Ensure sounds stay muted when setting volume

## 0.16.0

### Minor Changes

- d6a40da: Add option to loop sounds
- 86cadee: Allow setting volume of already playing sounds

### Patch Changes

- 0fc2648: Fix renderable meshes not updating palette texture
- 14251c6: Add wrap options for textures

## 0.15.3

### Patch Changes

- f38ff7b: Fix textured meshes not using texture unit 0

## 0.15.2

### Patch Changes

- 384a708: Remove bodies after state changes
- 697cfb7: Clear input states on window blur
- 9c24a2d: Fix physics bodies not being removed
- d5ec3f6: Allow setting isTrigger to false during update body options
- 41d9aa6: Fix aspect ratio not working in fullscreen mode
- 646aa76: Export physics world types

## 0.15.1

### Patch Changes

- dd8a2ee: Export missing job types

## 0.15.0

### Minor Changes

- f5ca7a3: Correctly return undefined in resource manager
- f0a8587: Add ability to register jobs and improve job typing
- 26ade4a: Add defaults for UI contexts
- 18357e1: Relay jobs from UI all the way to the game state
- 1ef9e10: Update dependencies
- e689fdf: Add engine systems for persist systems

### Patch Changes

- 9d04af1: Update gl-matrix to 3.4.4

## 0.14.0

### Minor Changes

- 08bcf5b: Add bundles for creating entities with a set of components
- 943b3ad: Add bundle component overrides
- 19369fc: Remove unused update stats
- 12cd85e: Merge ECS into TWorld
- cafac80: Add transform bundle
- d671dab: Add global transforms
- 5cc2a54: Add support for double nested entities
- 10ac88d: Update dependencies
- 54017e1: Add subscriptions to queries
- 56cbfd0: Add required components field
- 75eced5: Add priority to systems
- b25a7a1: Change ShouldRender to VisibilityComponent
- e614020: Entity query now properly chains 'exclude'
- 0d67180: Add bundles to world create entity

### Patch Changes

- 0bef178: Fix game resizing incorrectly at low browser heights
- 1423153: Reduce z-index of debug panel

## 0.13.0

### Minor Changes

- b033ac5: Improved behaviour of the orbit camera
- 20d5c41: Add `getComponent` method
- e9a6981: Add excludes to entity queries
- f3195c5: Allow setting components when creating entity
- 32d163d: Move to ECS

### Patch Changes

- d287769: Prevent meshes being loaded multiple times if used across entities

## 0.12.0

### Minor Changes

- ef72d87: Add directional light color and intensity
- 8fc595e: Add pause/resume to particle component
- 91986c4: Add ambient light color
- 5f96006: Move ambient and directional light to uniform block
- 55ec1d9: Add loading UVs from obj files
- 3b43776: Allow changing ambient and directional light at runtime
- 1ffbd37: Refactor program attribute handling
- ec1f8b0: Add basic shadow mapping
- ee28e55: Refactor uniform handling
- 5175283: Add probe shader to query settings from GPU
- c571c14: Add framebuffers
- bdffa7b: Add color picker for debug rows
- 6ce5f3b: Use Howler for audio

### Patch Changes

- 734199a: Bump dependencies
- 30ed48c: Update instance UVs scaling to vec2
- fee265f: Fix textured mesh UV scaling
- f66a9ea: Update deps
- e4e93ac: Update deps
- fe44608: Remove some unnecessary code from color program
- 290482e: Fix input value bubble displaying under inputs

## 0.11.1

### Patch Changes

- 869b95a: Ensure debug panel is always on top
- 1c461be: Prevent axes getting stuck when changing state

## 0.11.0

### Minor Changes

- 5c782f1: Move to varying physics timestep
- b338423: Add linear and angular velocity to scene components
- eba13e4: Add particle system
- da766c5: Add color filter to particle system init and behaviours
- 14cfbb7: Add scale behaviour to particle system
- a97f15f: Add isDown to controllers
- 74cd4d5: Add force behaviour to particle system
- 93312c5: Add instance UV scaling
- 1ad2c48: Add physics scaling

### Patch Changes

- 542eb7d: Fix physics debug not being added as a render task

## 0.10.1

### Patch Changes

- 0f08b43: Fix rendering problems with textured meshes on some machines

## 0.10.0

### Minor Changes

- 8689535: Add color filters for textured components
- 1e60b27: Add tooltip on fullscreen button
- 88ee726: Update depdendencies
- 4309336: Add game state job manager
- 7c525d3: Add audio toggle to game controls
- 0ad8af7: Add config to show/hide fullscreen/audio toggles
- fb01f13: Ensure bounds are strictly kept for fixed axis camera controller
- 5d32162: Fullscreen button scales with rendering size
- d0d5425: Move camera lerp functionality to a base camera controller

### Patch Changes

- beeb945: Fix debug buttons modifying each others uuids
- 227102f: Set alpha to false on webgl2 context to improve blending

## 0.9.0

### Minor Changes

- 98d4346: Add simple actor pool with preallocation
- 46136d6: Check for WebGL2 and OffscreenCanvas support on bootstrap
- ea23c72: Add window blur/focus events
- 904cdca: Add pointer lock to controller
- d11e903: Reset controller axis values on window blur
- 2841262: Add draft segment timer
- 4069f03: Add proxy event queues
- 43c78c7: Add frame step option to animated sprite components
- 78b1ec8: Add movement using axes to simple controller
- b256b67: Add physics debug renderer
- 43f5ec3: Add top down input controller
- c9d72dc: Add colors to physics debug renderer
- df9daa5: Add ability to set texture filter in resource packs
- 03f7c7b: Add instance UVs for textured meshes
- 3569cca: Add getImageBitmap to TCanvas
- 132bc1c: Add child event queues
- 00115a6: Destroyed pools can no longer be used
- c8b6d39: Load resources within resource packs in parallel
- 3f3f55a: Add lead to fixed axis camera controller
- 46e00e0: Add method to toggle animation sprite
- 56c8c65: Add UI context for scaling info
- bdbb00c: Add acquired flag when actor has been acquired from pool
- 48cc046: Add max lead option to fixed axis controller
- 8bcbd75: Add game state event queue

### Patch Changes

- 63b37a1: Remove reset axis log
- b7cf58b: Fix 'fixedRotation' option not working correctly in 2d mode
- f3163b8: Don't allow actors to be released to pool more than once
- 718e27d: Fix adding multiple on enter collision listeners
- 3805dc6: Fix collision class ignores type
- e6e2310: Improve serialized material types
- bc5dc7f: Update segment timer section label to performance
- a2ff636: Delete collision listeners on remove actor
- 1f06ea2: Proxy queues now silently fail if no child queue available
- 1a29650: Fix deleted physics bodies causing unreachable error
- aed739f: Move physics communication to job system
- 791c181: Fix physics state changes causing panics after removing body
- 4cbdef4: Remove physics bodies before registering any new bodies
- b788b8f: Fix resources fetching multiple times when using jobs

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
