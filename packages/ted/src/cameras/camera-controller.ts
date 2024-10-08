import type TEngine from '../engine/engine';
import type TBaseCamera from './base-camera';

export default interface ICameraController {
  onUpdate(camera: TBaseCamera, engine: TEngine, delta: number): Promise<void>;
}
