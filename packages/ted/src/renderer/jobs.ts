import { TJobContextTypes } from '../jobs/context-types';
import type TJobManager from '../jobs/job-manager';
import type { TRenderJobContext, TJobConfig } from '../jobs/jobs';
import TProgram from './program';
import type { TPaletteIndex } from './renderable-mesh';
import TRenderableMesh from './renderable-mesh';
import type { TTextureOptions } from './renderable-texture';
import TRenderableTexture from './renderable-texture';
import TRenderableTexturedMesh from './renderable-textured-mesh';

export const RendererJobLoadProgram: TJobConfig<
  TJobContextTypes.Renderer,
  string,
  string
> = {
  name: 'load_program',
  requiredContext: TJobContextTypes.Renderer,
};

export const RendererJobLoadMeshFromUrl: TJobConfig<
  TJobContextTypes.Renderer,
  string,
  string
> = {
  name: 'load_mesh_from_url',
  requiredContext: TJobContextTypes.Renderer,
};

export const RendererJobLoadMesh: TJobConfig<
  TJobContextTypes.Renderer,
  {
    positions: number[];
    normals: number[];
    indexes: number[];
    colors: number[];
    paletteIndex: TPaletteIndex;
  },
  string
> = {
  name: 'load_mesh',
  requiredContext: TJobContextTypes.Renderer,
};

export const RendererJobLoadTexturedMeshFromUrl: TJobConfig<
  TJobContextTypes.Renderer,
  string,
  string
> = {
  name: 'load_textured_mesh_from_url',
  requiredContext: TJobContextTypes.Renderer,
};

export const RendererJobLoadTexturedMesh: TJobConfig<
  TJobContextTypes.Renderer,
  {
    positions: number[];
    normals: number[];
    indexes: number[];
    uvs: number[];
  },
  string
> = {
  name: 'load_textured_mesh',
  requiredContext: TJobContextTypes.Renderer,
};

export const RendererJobLoadTextureFromImageBitmap: TJobConfig<
  TJobContextTypes.Renderer,
  { image: ImageBitmap; config?: TTextureOptions },
  string
> = {
  name: 'load_texture_from_imagebitmap',
  requiredContext: TJobContextTypes.Renderer,
};

export function registerRendererJobs(jobManager: TJobManager) {
  jobManager.registerJob(
    RendererJobLoadProgram,
    async (ctx: TRenderJobContext, shaderLocation: string) => {
      const program = await ctx.resourceManager.load<TProgram>(
        TProgram,
        shaderLocation,
      );

      if (!ctx.renderer.hasProgram(program.uuid!)) {
        program.compile(ctx.renderer.context());
        ctx.renderer.registerProgram(program);
      }

      return program.uuid!;
    },
  );

  jobManager.registerJob(
    RendererJobLoadMeshFromUrl,
    async (ctx: TRenderJobContext, meshLocation: string) => {
      const mesh = await ctx.resourceManager.load<TRenderableMesh>(
        TRenderableMesh,
        meshLocation,
      );

      if (!ctx.renderer.hasMesh(mesh.uuid)) {
        ctx.renderer.registerMesh(mesh);
      }

      return mesh.uuid;
    },
  );

  jobManager.registerJob(
    RendererJobLoadMesh,
    async (
      ctx: TRenderJobContext,
      {
        positions,
        normals,
        indexes,
        colors,
        paletteIndex,
      }: {
        positions: number[];
        normals: number[];
        indexes: number[];
        colors: number[];
        paletteIndex: TPaletteIndex;
      },
    ) => {
      const mesh = new TRenderableMesh();
      mesh.positions = positions;
      mesh.normals = normals;
      mesh.indexes = indexes;
      mesh.colors = colors;
      mesh.palette = paletteIndex;

      ctx.renderer.registerMesh(mesh);

      return mesh.uuid;
    },
  );

  jobManager.registerJob(
    RendererJobLoadTexturedMeshFromUrl,
    async (ctx: TRenderJobContext, meshLocation: string) => {
      const mesh = await ctx.resourceManager.load<TRenderableTexturedMesh>(
        TRenderableTexturedMesh,
        meshLocation,
      );

      if (!ctx.renderer.hasTexturedMesh(mesh.uuid)) {
        ctx.renderer.registerTexturedMesh(mesh);
      }

      return mesh.uuid;
    },
  );

  jobManager.registerJob(
    RendererJobLoadTexturedMesh,
    async (
      ctx: TRenderJobContext,
      {
        positions,
        normals,
        indexes,
        uvs,
      }: {
        positions: number[];
        normals: number[];
        indexes: number[];
        uvs: number[];
      },
    ) => {
      const mesh = new TRenderableTexturedMesh();
      mesh.positions = positions;
      mesh.normals = normals;
      mesh.indexes = indexes;
      mesh.uvs = uvs;

      ctx.renderer.registerTexturedMesh(mesh);

      return mesh.uuid;
    },
  );

  jobManager.registerJob(
    RendererJobLoadTextureFromImageBitmap,
    async (
      ctx: TRenderJobContext,
      { image, config }: { image: ImageBitmap; config?: TTextureOptions },
    ) => {
      const texture = new TRenderableTexture();
      texture.load(ctx.renderer.context(), image, config);
      ctx.renderer.registerTexture(texture);
      return texture.uuid;
    },
  );
}
