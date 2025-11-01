/* eslint-disable no-restricted-globals */
import { TJobContextTypes } from '../jobs/context-types';
import { TJobManager } from '../jobs/job-manager';
import type { TJobsMessageRelay } from '../jobs/messages';
import { TMessageTypesJobs } from '../jobs/messages';
import { registerPhysicsJobs } from './jobs';
import type { TPhysicsOutMessageInit } from './messages';
import { TPhysicsMessageTypes } from './messages';
import { TRapier3DWorld } from './rapier3d-world';

const world = new TRapier3DWorld();

const channel = new MessageChannel();
const enginePort = channel.port1;
const jobs = new TJobManager([TJobContextTypes.Physics]);
jobs.additionalContext = {
  world,
};

registerPhysicsJobs(jobs);

enginePort.onmessage = async (event: MessageEvent) => {
  const { data } = event;
  switch (data.type) {
    case TMessageTypesJobs.RELAY: {
      const relayMessage = data as TJobsMessageRelay;

      void jobs.doRelayedJob(relayMessage.wrappedJob, enginePort);
      break;
    }
  }
};

// Everything is setup, let the game world know
const initMessage: TPhysicsOutMessageInit = { type: TPhysicsMessageTypes.INIT };
self.postMessage(initMessage, [channel.port2] as [Transferable]);
