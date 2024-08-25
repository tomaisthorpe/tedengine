import type TActor from '../core/actor';
import type TEngine from '../engine/engine';
import type { TPhysicsBodyOptions } from '../physics/physics-world';
import type { TSerializedSpriteInstance } from '../renderer/frame-params';
import type { TActorComponentWithOnUpdate } from './actor-component';
import TSpriteComponent, {
  TOriginPoint,
  TSpriteLayer,
} from './sprite-component';

export interface TSpriteSheetOptions {
  frameCount: number;
  frameRate: number;

  /**
   * The step to increment the frame by each update.
   * Use minus to animate backwards.
   */
  step?: number;
}

export default class TAnimatedSpriteComponent
  extends TSpriteComponent
  implements TActorComponentWithOnUpdate
{
  public frame = 0;
  public paused = false;

  /**
   * The step to increment the frame by each update.
   * Use minus to animate backwards.
   */
  public step = 1;
  public frameRate: number;
  public frameCount: number;

  private time = 0;

  constructor(
    engine: TEngine,
    actor: TActor,
    width: number,
    height: number,
    origin = TOriginPoint.Center,
    layer = TSpriteLayer.Foreground_0,
    spriteSheetOptions: TSpriteSheetOptions,
    bodyOptions?: TPhysicsBodyOptions,
  ) {
    super(engine, actor, width, height, origin, layer, bodyOptions);

    this.frameRate = spriteSheetOptions.frameRate;
    this.frameCount = spriteSheetOptions.frameCount;

    if (spriteSheetOptions.step) {
      this.step = spriteSheetOptions.step;
    }
  }

  public async onUpdate(_: TEngine, delta: number): Promise<void> {
    if (this.paused) return;

    this.time += delta;
    if (this.time > 1 / this.frameRate) {
      this.time = 0;
      this.frame = (this.frame + this.step) % this.frameCount;

      if (this.frame < 0) {
        this.frame = this.frameCount - 1;
      }
    }
  }

  public getRenderTask(): TSerializedSpriteInstance | undefined {
    const task = super.getRenderTask();
    if (!task) {
      return undefined;
    }

    const startX = this.frame * (1 / this.frameCount);
    const endX = startX + 1 / this.frameCount;

    task.material.options.instanceUVs = [
      startX,
      0,
      startX,
      1,
      endX,
      0,
      endX,
      1,
    ];

    return task;
  }

  public toggleAnimation(): void {
    this.paused = !this.paused;
  }

  public pauseAnimation(): void {
    this.paused = true;
  }

  public resumeAnimation(): void {
    this.paused = false;
  }
}
