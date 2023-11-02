export function createPhysicsWorker() {
  return new Worker(new URL('./worker.ts', import.meta.url));
}
