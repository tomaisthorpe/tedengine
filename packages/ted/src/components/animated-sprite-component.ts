import type TWorld from '../core/world';
import { TComponent } from '../ecs/component';
import type { TECS } from '../ecs/ecs';
import type TECSQuery from '../ecs/query';
import { TSystem, TSystemPriority } from '../ecs/system';
import type TEngine from '../engine/engine';
import TSpriteComponent from './sprite-component';

export interface TSpriteSheetOptions {
  frameCount: number;
  frameRate: number;

  /**
   * The step to increment the frame by each update.
   * Use minus to animate backwards.
   */
  step?: number;
}

export default class TAnimatedSpriteComponent extends TComponent {
  public frame = 0;
  public paused = false;
  public timeSinceLastFrame = 0;
  public instanceUVs?: number[];

  constructor(
    public frameRate: number,
    public frameCount: number,
    public step = 1,
  ) {
    super();
  }
}

export class TAnimatedSpriteSystem extends TSystem {
  public readonly priority: number = TSystemPriority.Update;
  
  private query: TECSQuery;

  public constructor(ecs: TECS) {
    super();

    // @todo should you progress entities without should render
    this.query = ecs.createQuery([TSpriteComponent, TAnimatedSpriteComponent]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
    delta: number,
  ): Promise<void> {
    const animatedSprites = this.query.execute();

    for (const entity of animatedSprites) {
      const components = ecs.getComponents(entity);

      if (!components) continue;

      const animatedSprite = components.get(TAnimatedSpriteComponent);

      animatedSprite.timeSinceLastFrame += delta;

      if (!animatedSprite.instanceUVs) {
        this.updateUVs(animatedSprite);
        continue;
      }

      if (animatedSprite.paused) continue;

      if (animatedSprite.timeSinceLastFrame > 1 / animatedSprite.frameRate) {
        animatedSprite.timeSinceLastFrame = 0;
        animatedSprite.frame =
          (animatedSprite.frame + animatedSprite.step) %
          animatedSprite.frameCount;

        if (animatedSprite.frame < 0) {
          animatedSprite.frame = animatedSprite.frameCount - 1;
        }

        this.updateUVs(animatedSprite);
      }
    }
  }

  private updateUVs(animatedSprite: TAnimatedSpriteComponent): void {
    const startX = animatedSprite.frame * (1 / animatedSprite.frameCount);
    const endX = startX + 1 / animatedSprite.frameCount;

    animatedSprite.instanceUVs = [startX, 1, startX, 0, endX, 1, endX, 0];
  }
}
