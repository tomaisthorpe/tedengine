import type { TSerializedPostProcessingEffect } from '../../renderer/frame-params';
import type { TPostProcessingEffect } from './effect';

export class TPostProcessingStack {
  private effects: TPostProcessingEffect[] = [];

  public add(effect: TPostProcessingEffect) {
    if (!this.effects.includes(effect)) this.effects.push(effect);
  }

  public remove(effect: TPostProcessingEffect) {
    this.effects = this.effects.filter((candidate) => candidate !== effect);
  }

  public move(effect: TPostProcessingEffect, index: number) {
    this.remove(effect);
    this.effects.splice(
      Math.max(0, Math.min(index, this.effects.length)),
      0,
      effect,
    );
  }

  public clear() {
    this.effects = [];
  }

  public serialise(): TSerializedPostProcessingEffect[] {
    return this.effects.flatMap((effect) => {
      const serialised = effect.serialise();
      return serialised ? [serialised] : [];
    });
  }
}
