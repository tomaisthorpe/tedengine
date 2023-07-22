import TTSound from '../audio/sound';
import type TEngine from '../engine/engine';
import TColorMaterial from '../graphics/color-material';
import TImage from '../graphics/image';
import TMesh from '../graphics/mesh';
import TTexture from '../graphics/texture';
import TTilemap from '../graphics/tilemap';

export interface TResourcePackConfig {
  meshes?: string[];
  materials?: string[];
  images?: string[];
  textures?: string[];
  sounds?: string[];
  tilemaps?: string[];
}

export default class TResourcePack {
  private resources: TResourcePackConfig;

  constructor(private engine: TEngine, ...configs: TResourcePackConfig[]) {
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
      }
    );
  }

  /**
   * Load everything in the resource pack, promise resolves once loaded.
   */
  public async load(): Promise<void> {
    for (const mesh of this.resources.meshes || []) {
      await this.engine.resources.load<TMesh>(TMesh, mesh);
    }

    for (const materials of this.resources.materials || []) {
      await this.engine.resources.load<TColorMaterial>(
        TColorMaterial,
        materials
      );
    }

    for (const image of this.resources.images || []) {
      await this.engine.resources.load<TImage>(TImage, image);
    }

    for (const texture of this.resources.textures || []) {
      await this.engine.resources.load<TTexture>(TTexture, texture);
    }

    for (const sound of this.resources.sounds || []) {
      await this.engine.resources.load<TTSound>(TTSound, sound);
    }

    for (const tilemap of this.resources.tilemaps || []) {
      await this.engine.resources.load<TTilemap>(TTilemap, tilemap);
    }
  }
}
