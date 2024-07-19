/* eslint-disable no-restricted-globals */
import { TJobContextTypes } from '../jobs/context-types';
import TJobManager from '../jobs/job-manager';
import type { TJobsMessageRelay } from '../jobs/messages';
import { TMessageTypesJobs } from '../jobs/messages';
import type {
  TPhysicsInMessageWorldSetup,
  TPhysicsOutMessageInit,
  TPhysicsOutMessageWorldCreated,
  TPhysicsOutMessageSimulateDone,
  TPhysicsInMessageSimulateStep,
} from './messages';
import { TPhysicsMessageTypes } from './messages';
import type { TPhysicsWorld } from './physics-world';
import TRapier3DWorld from './rapier3d-world';
import { TPhysicsStateChangeType } from './state-changes';
import type { TPhysicsStateChange } from './state-changes';

// const world = new TAmmoWorld() as TPhysicsWorld;
const world = new TRapier3DWorld();

const channel = new MessageChannel();
const enginePort = channel.port1;
const jobs = new TJobManager([TJobContextTypes.Physics]);
jobs.additionalContext = {
  world,
};

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

      // Remove bodies before adding new ones to prevent re-adding the same body
      for (const body of stepMessage.removeBodies) {
        world.removeBody(body.uuid);
      }

      for (const body of stepMessage.newBodies) {
        world.addBody(
          body.uuid,
          body.collider,
          body.translation,
          body.rotation,
          body.options,
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
    case TMessageTypesJobs.RELAY: {
      const relayMessage = data as TJobsMessageRelay;

      jobs.doRelayedJob(relayMessage.wrappedJob, enginePort);
      break;
    }
  }
};

function applyStateChanges(
  world: TPhysicsWorld,
  stateChanges: TPhysicsStateChange[],
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
          stateChange.rotation,
        );
        break;
    }
  }
}

// Everything is setup, let the game world know
const initMessage: TPhysicsOutMessageInit = { type: TPhysicsMessageTypes.INIT };
self.postMessage(initMessage, [channel.port2] as any);
