import { describe, expect, it } from 'vitest';
import { TPostProcessingEffect } from './effect';
import { TGrayscalePostProcessingEffect } from './effects/grayscale';
import { TWobblePostProcessingEffect } from './effects/wobble';
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

class LoadedWobbleEffect extends TWobblePostProcessingEffect {
  constructor() {
    super();
    this.uuid = 'wobble';
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

describe('TWobblePostProcessingEffect', () => {
  it('serialises adjustable wave parameters', () => {
    const effect = new LoadedWobbleEffect();
    expect(effect.serialise()?.uniforms).toEqual({
      uAmplitude: 6,
      uFrequency: 3,
      uSpeed: 0.5,
    });

    effect.amplitude = 12;
    effect.frequency = 4;
    effect.speed = 1;
    expect(effect.serialise()?.uniforms).toEqual({
      uAmplitude: 12,
      uFrequency: 4,
      uSpeed: 1,
    });
  });
});
