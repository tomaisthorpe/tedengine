import TResourcePack from './resource-pack';
import TMesh from '../graphics/mesh';
import TColorMaterial from '../graphics/color-material';
import TImage from '../graphics/image';
import TTexture from '../graphics/texture';
import TTSound from '../audio/sound';
import TTilemap from '../graphics/tilemap';

describe('TResourcePack', () => {
  let resourcePack: TResourcePack;
  let engine: any;

  beforeEach(() => {
    engine = { resources: { load: jest.fn() } } as any;
    resourcePack = new TResourcePack(
      engine,
      {
        meshes: ['mesh1'],
        texturedMeshes: ['textured1'],
        materials: ['material1'],
        images: ['image1'],
        textures: ['texture1'],
        sounds: ['sound1'],
        tilemaps: ['tilemap1'],
      },
      {
        meshes: ['mesh2'],
        texturedMeshes: ['textured2'],
        materials: ['material2'],
        images: ['image2'],
        textures: ['texture2'],
        sounds: ['sound2'],
        tilemaps: ['tilemap2'],
      },
      { meshes: ['mesh3'] },
    );
  });

  test('should merge all configs into one', () => {
    expect(resourcePack.resources).toEqual({
      meshes: ['mesh1', 'mesh2', 'mesh3'],
      texturedMeshes: ['textured1', 'textured2'],
      materials: ['material1', 'material2'],
      images: ['image1', 'image2'],
      textures: ['texture1', 'texture2'],
      sounds: ['sound1', 'sound2'],
      tilemaps: ['tilemap1', 'tilemap2'],
    });
  });

  test('should load all resources in the resource pack', async () => {
    const loadMock = jest.spyOn(engine.resources, 'load');

    await resourcePack.load();

    expect(loadMock).toHaveBeenCalledTimes(15);
    expect(loadMock).toHaveBeenCalledWith(TMesh, 'mesh1');
    expect(loadMock).toHaveBeenCalledWith(TMesh, 'mesh2');
    expect(loadMock).toHaveBeenCalledWith(TMesh, 'mesh3');
    expect(loadMock).toHaveBeenCalledWith(TColorMaterial, 'material1');
    expect(loadMock).toHaveBeenCalledWith(TColorMaterial, 'material2');
    expect(loadMock).toHaveBeenCalledWith(TImage, 'image1');
    expect(loadMock).toHaveBeenCalledWith(TImage, 'image2');
    expect(loadMock).toHaveBeenCalledWith(TTexture, 'texture1');
    expect(loadMock).toHaveBeenCalledWith(TTexture, 'texture2');
    expect(loadMock).toHaveBeenCalledWith(TTSound, 'sound1');
    expect(loadMock).toHaveBeenCalledWith(TTSound, 'sound2');
    expect(loadMock).toHaveBeenCalledWith(TTilemap, 'tilemap1');
    expect(loadMock).toHaveBeenCalledWith(TTilemap, 'tilemap2');
  });
});
