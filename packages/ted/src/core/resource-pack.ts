import TTSound from '../audio/sound';
import type TEngine from '../engine/engine';
import TColorMaterial from '../graphics/color-material';
import TImage from '../graphics/image';
import TMesh from '../graphics/mesh';
import TTexture from '../graphics/texture';
import TTilemap from '../graphics/tilemap';
import type { IAsset, IJobAsset } from './resource-manager';

export interface TResourcePackConfig {
  meshes?: string[];
  materials?: string[];
  images?: string[];
  textures?: string[];
  sounds?: string[];
  tilemaps?: string[];
}

export default class TResourcePack {
  public resources: TResourcePackConfig;

  constructor(
    private engine: TEngine,
    ...configs: TResourcePackConfig[]
  ) {
    // Merge all configs into one
    this.resources = configs.reduce(
      (reducedConfig, config) => {
        if (config.meshes) {
          reducedConfig.meshes!.push(...config.meshes);
        }

        if (config.materials) {
          reducedConfig.materials!.push(...config.materials);
        }

        if (config.images) {
          reducedConfig.images!.push(...config.images);
        }

        if (config.textures) {
          reducedConfig.textures!.push(...config.textures);
        }

        if (config.sounds) {
          reducedConfig.sounds!.push(...config.sounds);
        }

        if (config.tilemaps) {
          reducedConfig.tilemaps!.push(...config.tilemaps);
        }

        return reducedConfig;
      },
      {
        meshes: [],
        materials: [],
        images: [],
        textures: [],
        sounds: [],
        tilemaps: [],
      },
    );
  }

  /**
   * Load everything in the resource pack, promise resolves once loaded.
   */
  public async load(): Promise<void> {
    const resourceTypes: {
      [key: string]: { new (): IJobAsset | IAsset };
    } = {
      meshes: TMesh,
      materials: TColorMaterial,
      images: TImage,
      textures: TTexture,
      sounds: TTSound,
      tilemaps: TTilemap,
    };

    for (const resourceType in resourceTypes) {
      for (const resource of this.resources[
        resourceType as keyof TResourcePackConfig
      ] || []) {
        await this.engine.resources.load(resourceTypes[resourceType], resource);
      }
    }
  }
}
