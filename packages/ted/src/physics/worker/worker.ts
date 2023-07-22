/* eslint-disable no-restricted-globals */
import type { TPhysicsBody } from './dynamic-world';
import TDynamicWorld from './dynamic-world';
import type {
  TPhysicsInMessageRegisterBody,
  TPhysicsInMessageWorldSetup,
  TPhysicsOutMessageInit,
  TPhysicsOutMessageWorldCreated,
  TPhysicsOutMessageSimulateDone,
  TPhysicsInMessageSimulateStep,
  TPhysicsInMessageApplyCentralForce,
  TPhysicsInMessageApplyCentralImpulse,
} from './messages';
import { TPhysicsMessageTypes } from './messages';

const onWorldUpdate = (bodies: TPhysicsBody[]) => {
  const message: TPhysicsOutMessageSimulateDone = {
    type: TPhysicsMessageTypes.SIMULATE_DONE,
    bodies,
  };
  self.postMessage(message);
};

const world = new TDynamicWorld(onWorldUpdate);

self.onmessage = async (event: MessageEvent) => {
  const { data } = event;
  switch (data.type) {
    case TPhysicsMessageTypes.WORLD_SETUP: {
      await world.create((data as TPhysicsInMessageWorldSetup).config);
      const message: TPhysicsOutMessageWorldCreated = {
        type: TPhysicsMessageTypes.WORLD_CREATED,
      };
      self.postMessage(message);
      break;
    }
    case TPhysicsMessageTypes.SIMULATE_STEP: {
      const stepMessage = data as TPhysicsInMessageSimulateStep;
      world.simulateStep(stepMessage.delta);
      break;
    }
    case TPhysicsMessageTypes.REGISTER_BODY: {
      const registerMessage = data as TPhysicsInMessageRegisterBody;
      world.addBody(
        registerMessage.uuid,
        registerMessage.collider,
        registerMessage.translation,
        registerMessage.rotation,
        registerMessage.mass
      );
      break;
    }
    case TPhysicsMessageTypes.APPLY_CENTRAL_FORCE: {
      const message = data as TPhysicsInMessageApplyCentralForce;
      world.applyCentralForce(message.uuid, message.force);
      break;
    }
    case TPhysicsMessageTypes.APPLY_CENTRAL_IMPULSE: {
      const message = data as TPhysicsInMessageApplyCentralImpulse;
      world.applyCentralImpulse(message.uuid, message.impulse);
      break;
    }
  }
};

// Everything is setup, let the game world know
const initMessage: TPhysicsOutMessageInit = { type: TPhysicsMessageTypes.INIT };
self.postMessage(initMessage);
