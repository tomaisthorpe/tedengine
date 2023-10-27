/* eslint-disable no-restricted-globals */
import TCannonWorld from './cannon-world';
import type {
  TPhysicsInMessageWorldSetup,
  TPhysicsOutMessageInit,
  TPhysicsOutMessageWorldCreated,
  TPhysicsOutMessageSimulateDone,
  TPhysicsInMessageSimulateStep,
} from './messages';
import { TPhysicsMessageTypes } from './messages';
import type { TPhysicsWorld } from './physics-world';
import { TPhysicsStateChangeType } from './state-changes';
import type { TPhysicsStateChange } from './state-changes';

// const world = new TAmmoWorld() as TPhysicsWorld;
const world = new TCannonWorld() as TPhysicsWorld;

const channel = new MessageChannel();
const enginePort = channel.port1;

enginePort.onmessage = async (event: MessageEvent) => {
  const { data } = event;
  switch (data.type) {
    case TPhysicsMessageTypes.WORLD_SETUP: {
      await world.create((data as TPhysicsInMessageWorldSetup).config);
      const message: TPhysicsOutMessageWorldCreated = {
        type: TPhysicsMessageTypes.WORLD_CREATED,
      };
      enginePort.postMessage(message);
      break;
    }
    case TPhysicsMessageTypes.SIMULATE_STEP: {
      const now = performance.now();
      const stepMessage = data as TPhysicsInMessageSimulateStep;

      for (const body of stepMessage.newBodies) {
        world.addBody(
          body.uuid,
          body.collider,
          body.translation,
          body.rotation,
          body.mass,
          body.options
        );
      }

      // Apply the state changes
      applyStateChanges(world, stepMessage.stateChanges);

      const worldState = world.step(stepMessage.delta);

      const message: TPhysicsOutMessageSimulateDone = {
        type: TPhysicsMessageTypes.SIMULATE_DONE,
        ...worldState,
        stepElapsedTime: performance.now() - now,
      };
      enginePort.postMessage(message);
      break;
    }
  }
};

function applyStateChanges(
  world: TPhysicsWorld,
  stateChanges: TPhysicsStateChange[]
) {
  for (const stateChange of stateChanges) {
    switch (stateChange.type) {
      case TPhysicsStateChangeType.APPLY_CENTRAL_FORCE:
        world.applyCentralForce(stateChange.uuid, stateChange.force);
        break;
      case TPhysicsStateChangeType.APPLY_CENTRAL_IMPULSE:
        world.applyCentralImpulse(stateChange.uuid, stateChange.impulse);
        break;
      case TPhysicsStateChangeType.UPDATE_BODY_OPTIONS:
        world.updateBodyOptions(stateChange.uuid, stateChange.options);
        break;
      case TPhysicsStateChangeType.UPDATE_TRANSFORM:
        world.updateTransform(
          stateChange.uuid,
          stateChange.translation,
          stateChange.rotation
        );
        break;
    }
  }
}

// Everything is setup, let the game world know
const initMessage: TPhysicsOutMessageInit = { type: TPhysicsMessageTypes.INIT };
self.postMessage(initMessage, [channel.port2] as any);
