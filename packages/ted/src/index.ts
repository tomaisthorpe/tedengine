import TActorComponent from './actor-components/actor-component';
import type { TActorComponentWithOnUpdate } from './actor-components/actor-component';
import TBoxComponent from './actor-components/box-component';
import TMeshComponent from './actor-components/mesh-component';
import TPlaneComponent from './actor-components/plane-component';
import TRotatingComponent from './actor-components/rotating-component';
import TSceneComponent from './actor-components/scene-component';
import TSphereComponent from './actor-components/sphere-component';
import TSpriteComponent, {
  TOriginPoint,
  TSpriteLayer,
} from './actor-components/sprite-component';
import TTexturedMeshComponent from './actor-components/textured-mesh-component';
import TTilemapComponent from './actor-components/tilemap-component';
import type {
  TTileset,
  TTilesetConfig,
} from './actor-components/tilemap-component';
import TAudio from './audio/audio';
import TSound from './audio/sound';
import TBaseCamera from './cameras/base-camera';
import type { ICamera } from './cameras/camera';
import TCameraComponent from './cameras/camera-component';
import { getDefaultCameraView } from './cameras/camera-view';
import type { TCameraView } from './cameras/camera-view';
import TOrbitCamera from './cameras/orbit-camera';
import TOrthographicCamera from './cameras/orthographic-camera';
import TPerspectiveCamera from './cameras/perspective-camera';
import TActor from './core/actor';
import type { TActorWithOnUpdate } from './core/actor';
import TEventQueue from './core/event-queue';
import type { TEvent } from './core/event-queue';
import TGameState from './core/game-state';
import type {
  TGameStateWithOnUpdate,
  TGameStateWithOnCreate,
  TGameStateWithOnEnter,
  TGameStateWithOnLeave,
  TGameStateWithOnResume,
} from './core/game-state';
import TGameStateManager from './core/game-state-manager';
import TLevel from './core/level';
import type { TMessageTypesCore, TMessageEventRelay } from './core/messages';
import TPawn from './core/pawn';
import TResourceManager from './core/resource-manager';
import TResourcePack from './core/resource-pack';
import type { TResourcePackConfig } from './core/resource-pack';
import TDebugPanel from './debug/debug-panel';
import type { TConfig } from './engine/config';
import TEngine from './engine/engine';
import type { TPostMessageFunc } from './engine/engine';
import TFred from './fred/fred';
import { TProjectionType } from './graphics';
import TCanvas from './graphics/canvas';
import TImage from './graphics/image';
import type IMaterial from './graphics/material';
import TMesh from './graphics/mesh';
import TTexture, { TTextureFilter } from './graphics/texture';
import TTilemap from './graphics/tilemap';
import type { TGridTile, TTilemapLayer, TTilesetDef } from './graphics/tilemap';
import TController from './input/controller';
import type {
  TEventTypesInput,
  TKeyUpEvent,
  TKeyDownEvent,
  TMouseUpEvent,
  TMouseDownEvent,
  TMouseMoveEvent,
  TActionPressedEvent,
  TActionReleasedEvent,
} from './input/events';
import TKeyboard from './input/keyboard';
import TMouse from './input/mouse';
import TSimpleController from './input/simple-controller';
import TTransform from './math/transform';
import { TColliderType } from './physics/colliders';
import type { TColliderConfig, ICollider } from './physics/colliders';
import TBoxCollider from './physics/colliders/box-collider';
import type { TBoxColliderConfig } from './physics/colliders/box-collider';
import TPlaneCollider from './physics/colliders/plane-collider';
import type { TPlaneColliderConfig } from './physics/colliders/plane-collider';
import TSphereCollider from './physics/colliders/sphere-collider';
import type { TSphereColliderConfig } from './physics/colliders/sphere-collider';
import TWorld from './physics/world';
import TProgram from './renderer/program';
import TGame from './ui/components/Game';
import type { TGameContextData, TEngineContextData } from './ui/context';
import { useGameContext, useEngineContext, useEventQueue } from './ui/hooks';

export { TAudio, TSound };

export {
  TActor,
  TEngine,
  TFred,
  TEventQueue,
  TPawn,
  TResourceManager,
  TResourcePack,
  TGameState,
  TGameStateManager,
  TLevel,
};

export type {
  TConfig,
  TResourcePackConfig,
  TPostMessageFunc,
  TEvent,
  TMessageTypesCore,
  TMessageEventRelay,
  TActorWithOnUpdate,
  TActorComponentWithOnUpdate,
  TGameStateWithOnUpdate,
  TGameStateWithOnCreate,
  TGameStateWithOnEnter,
  TGameStateWithOnLeave,
  TGameStateWithOnResume,
};

export {
  TActorComponent,
  TBoxComponent,
  TSphereComponent,
  TPlaneComponent,
  TMeshComponent,
  TRotatingComponent,
  TSceneComponent,
  TSpriteComponent,
  TOriginPoint,
  TSpriteLayer,
  TTexturedMeshComponent,
  TTilemapComponent,
};
export type { TTileset, TTilesetConfig };

export { TDebugPanel };

export {
  TProjectionType,
  TMesh,
  TProgram,
  TCanvas,
  TImage,
  TTexture,
  TTextureFilter,
  TTilemap,
};
export type { IMaterial, TGridTile, TTilemapLayer, TTilesetDef };

export {
  TBaseCamera,
  TPerspectiveCamera,
  TOrthographicCamera,
  TOrbitCamera,
  TCameraComponent,
  getDefaultCameraView,
};
export type { TCameraView, ICamera };

export {
  TActionPressedEvent,
  TActionReleasedEvent,
  TController,
  TSimpleController,
  TKeyboard,
  TMouseMoveEvent,
  TMouseUpEvent,
  TMouseDownEvent,
  TMouse,
};

export type { TEventTypesInput as TInputEventType, TKeyUpEvent, TKeyDownEvent };

export { TTransform };

export { TWorld };

export { TColliderType, TBoxCollider, TPlaneCollider, TSphereCollider };
export type {
  ICollider,
  TColliderConfig,
  TBoxColliderConfig,
  TPlaneColliderConfig,
  TSphereColliderConfig,
};

export { TGame, useGameContext, useEngineContext, useEventQueue };

export type { TGameContextData, TEngineContextData };
