import { describe, expect, it } from 'vitest';
import { TPostProcessingEffect } from './effect';
import { TGrayscalePostProcessingEffect } from './effects/grayscale';
import { TPostProcessingStack } from './stack';

class LoadedEffect extends TPostProcessingEffect {
  constructor(uuid: string) {
    super();
    this.uuid = uuid;
  }
}

class LoadedGrayscaleEffect extends TGrayscalePostProcessingEffect {
  constructor() {
    super();
    this.uuid = 'grayscale';
  }
}

describe('TPostProcessingStack', () => {
  it('serialises enabled effects in stack order', () => {
    const first = new LoadedEffect('first');
    const second = new LoadedEffect('second');
    const stack = new TPostProcessingStack();

    stack.add(first);
    stack.add(second);
    stack.move(second, 0);

    expect(stack.serialise().map(({ uuid }) => uuid)).toEqual([
      'second',
      'first',
    ]);
  });

  it('omits disabled and removed effects', () => {
    const enabled = new LoadedEffect('enabled');
    const disabled = new LoadedEffect('disabled');
    disabled.enabled = false;
    const stack = new TPostProcessingStack();

    stack.add(enabled);
    stack.add(disabled);
    expect(stack.serialise()).toHaveLength(1);

    stack.remove(enabled);
    expect(stack.serialise()).toEqual([]);
  });
});

describe('TGrayscalePostProcessingEffect', () => {
  it('clamps intensity and serialises it as a uniform', () => {
    const effect = new LoadedGrayscaleEffect();
    effect.intensity = 2;

    expect(effect.intensity).toBe(1);

    effect.intensity = -1;
    expect(effect.intensity).toBe(0);
    expect(effect.serialise()?.uniforms).toEqual({ uIntensity: 0 });
  });
});
