import type TEngine from '../engine/engine';
import type TWorld from '../core/world';
import { ECSWorldBridge } from './ecs-world-bridge';

/**
 * Integrates the ECS architecture with the existing engine
 */
export class ECSEngineIntegration {
  private engine: TEngine;
  private worldBridge?: ECSWorldBridge;
  private useECS: boolean = false;

  constructor(engine: TEngine) {
    this.engine = engine;
  }

  /**
   * Enable the ECS architecture
   */
  public enableECS(): void {
    if (!this.worldBridge) {
      this.worldBridge = new ECSWorldBridge(this.engine);
    }

    this.useECS = true;

    // Convert the current world to ECS if it exists
    if (this.engine.activeWorld) {
      this.worldBridge.setTEDWorld(this.engine.activeWorld);
      this.worldBridge.convertWorldToECS();
    }
  }

  /**
   * Disable the ECS architecture
   */
  public disableECS(): void {
    this.useECS = false;
  }

  /**
   * Check if ECS is enabled
   */
  public isECSEnabled(): boolean {
    return this.useECS;
  }

  /**
   * Get the ECS world bridge
   */
  public getWorldBridge(): ECSWorldBridge | undefined {
    return this.worldBridge;
  }

  /**
   * Update the ECS world
   * @param delta Time since last update
   */
  public update(delta: number): void {
    if (!this.useECS || !this.worldBridge) {
      return;
    }

    this.worldBridge.update(delta);
  }

  /**
   * Set the active world
   * @param world The active world
   */
  public setActiveWorld(world: TWorld): void {
    if (!this.useECS || !this.worldBridge) {
      return;
    }

    this.worldBridge.setTEDWorld(world);
    this.worldBridge.convertWorldToECS();
  }
}
