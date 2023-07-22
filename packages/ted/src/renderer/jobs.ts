import { TJobContextTypes } from '../jobs/context-types';
import type { TJobConfigs, TRenderJobContext } from '../jobs/jobs';
import TProgram from './program';
import type { TPaletteIndex } from './renderable-mesh';
import TRenderableMesh from './renderable-mesh';
import TRenderableTexture from './renderable-texture';
import TRenderableTexturedMesh from './renderable-textured-mesh';

export const RendererJobs: TJobConfigs = {
  load_program: {
    requiredContext: TJobContextTypes.Renderer,
    func: async (ctx: TRenderJobContext, shaderLocation: string) => {
      const program = await ctx.resourceManager.load<TProgram>(
        TProgram,
        shaderLocation
      );

      if (!ctx.renderer.hasProgram(program.uuid!)) {
        program.compile(ctx.renderer.context());
        ctx.renderer.registerProgram(program);
      }

      return program.uuid;
    },
  },
  load_mesh_from_url: {
    requiredContext: TJobContextTypes.Renderer,
    func: async (ctx: TRenderJobContext, meshLocation: string) => {
      const mesh = await ctx.resourceManager.load<TRenderableMesh>(
        TRenderableMesh,
        meshLocation
      );

      if (!ctx.renderer.hasMesh(mesh.uuid)) {
        ctx.renderer.registerMesh(mesh);
      }

      return mesh.uuid;
    },
  },
  load_mesh: {
    requiredContext: TJobContextTypes.Renderer,
    func: async (
      ctx: TRenderJobContext,
      positions: number[],
      normals: number[],
      indexes: number[],
      colors: number[],
      paletteIndex: TPaletteIndex
    ) => {
      // todo: ensure resource manager knows this mesh is loaded?
      const mesh = new TRenderableMesh();
      mesh.positions = positions;
      mesh.normals = normals;
      mesh.indexes = indexes;
      mesh.colors = colors;
      mesh.palette = paletteIndex;

      ctx.renderer.registerMesh(mesh);

      return mesh.uuid;
    },
  },
  load_textured_mesh: {
    requiredContext: TJobContextTypes.Renderer,
    func: async (
      ctx: TRenderJobContext,
      positions: number[],
      normals: number[],
      indexes: number[],
      uvs: number[]
    ) => {
      // todo: ensure resource manager knows this mesh is loaded?
      const mesh = new TRenderableTexturedMesh();
      mesh.positions = positions;
      mesh.normals = normals;
      mesh.indexes = indexes;
      mesh.uvs = uvs;

      ctx.renderer.registerTexturedMesh(mesh);

      return mesh.uuid;
    },
  },
  load_texture_from_imagebitmap: {
    requiredContext: TJobContextTypes.Renderer,
    func: async (ctx: TRenderJobContext, image: ImageBitmap) => {
      const texture = new TRenderableTexture();
      texture.load(ctx.renderer.context(), image);

      ctx.renderer.registerTexture(texture);

      return texture.uuid;
    },
  },
};
