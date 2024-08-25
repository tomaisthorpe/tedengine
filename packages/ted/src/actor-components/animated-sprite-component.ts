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
}

export default class TAnimatedSpriteComponent
  extends TSpriteComponent
  implements TActorComponentWithOnUpdate
{
  public frame = 0;

  private time = 0;

  constructor(
    engine: TEngine,
    actor: TActor,
    width: number,
    height: number,
    origin = TOriginPoint.Center,
    layer = TSpriteLayer.Foreground_0,
    private spriteSheetOptions: TSpriteSheetOptions,
    bodyOptions?: TPhysicsBodyOptions,
  ) {
    super(engine, actor, width, height, origin, layer, bodyOptions);
  }

  public async onUpdate(_: TEngine, delta: number): Promise<void> {
    this.time += delta;
    if (this.time > 1 / this.spriteSheetOptions.frameRate) {
      this.time = 0;
      this.frame = (this.frame + 1) % this.spriteSheetOptions.frameCount;
    }
  }

  public getRenderTask(): TSerializedSpriteInstance | undefined {
    const task = super.getRenderTask();
    if (!task) {
      return undefined;
    }

    // @todo modify the instance UVs based on the frame
    const startX = this.frame * (1 / this.spriteSheetOptions.frameCount);
    const endX = startX + 1 / this.spriteSheetOptions.frameCount;

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
}
