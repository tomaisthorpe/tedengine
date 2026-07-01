import { TJobContextTypes } from '../jobs/context-types';
import type { TJobManager } from '../jobs/job-manager';
import type { TRenderJobContext, TJobConfig } from '../jobs/jobs';
import { TProgram, type TShaderProgramDescriptor } from './program';
import type { TPaletteIndex } from './renderable-mesh';
import { TRenderableMesh } from './renderable-mesh';
import type { TTextureOptions } from './renderable-texture';
import { TRenderableTexture } from './renderable-texture';

export const RendererJobLoadProgram: TJobConfig<
  TJobContextTypes.Renderer,
  string,
  string
> = {
  name: 'load_program',
  requiredContext: TJobContextTypes.Renderer,
};

export const RendererJobLoadShader: TJobConfig<
  TJobContextTypes.Renderer,
  TShaderProgramDescriptor,
  string
> = {
  name: 'load_shader',
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
    uvs?: number[];
  },
  string
> = {
  name: 'load_mesh',
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
    RendererJobLoadShader,
    async (ctx: TRenderJobContext, shader: TShaderProgramDescriptor) => {
      const program = TProgram.fromDescriptor(shader);
      const gl = ctx.renderer.context();

      program.compile(gl);
      program.setupAttributes(gl, {
        required: shader.attributes?.required ?? [],
        optional: shader.attributes?.optional ?? [],
      });

      for (const block of shader.uniformBlocks ?? []) {
        program.setupUniformBlock(
          block.name,
          block.bindingPoint,
          block.uniforms,
        );
      }

      program.validateUniforms(
        shader.uniforms
          ?.filter((uniform) => uniform.required !== false)
          .map((uniform) => uniform.name) ?? [],
      );

      if (!program.uuid) {
        throw new Error('Shader program UUID not set after loading');
      }

      ctx.renderer.registerProgram(program);

      return program.uuid;
    },
  );

  jobManager.registerJob(
    RendererJobLoadProgram,
    async (ctx: TRenderJobContext, shaderLocation: string) => {
      const program = await ctx.resourceManager.load<TProgram>(
        TProgram,
        shaderLocation,
      );

      if (!program.uuid) {
        throw new Error('Program UUID not set after loading');
      }

      if (!ctx.renderer.hasProgram(program.uuid)) {
        program.compile(ctx.renderer.context());
        ctx.renderer.registerProgram(program);
      }

      return program.uuid;
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
        uvs,
      }: {
        positions: number[];
        normals: number[];
        indexes: number[];
        colors: number[];
        paletteIndex: TPaletteIndex;
        uvs?: number[];
      },
    ) => {
      const mesh = new TRenderableMesh();
      mesh.positions = positions;
      mesh.normals = normals;
      mesh.indexes = indexes;
      mesh.colors = colors;
      mesh.palette = paletteIndex;
      mesh.uvs = uvs ?? [];

      ctx.renderer.registerMesh(mesh);

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
