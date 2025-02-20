// Enum for uniform block binding points
export enum TUniformBlockBinding {
  Global = 0,
  Lighting = 1,
}

// Type for uniform location cache
export type TUniformLocationCache = {
  [key: string]: WebGLUniformLocation | null;
};

// Interface for uniform block info
export interface TUniformBlockInfo {
  index: number;
  size: number;
  uniforms: { [name: string]: number }; // Offset mapping
}

export class TUniformManager {
  private uniformLocationCache: TUniformLocationCache = {};
  private uniformBlockCache: Map<string, TUniformBlockInfo> = new Map();

  constructor(
    private gl: WebGL2RenderingContext,
    private program: WebGLProgram,
  ) {}

  /**
   * Gets a uniform location, using cached value if available
   */
  public getUniformLocation(name: string): WebGLUniformLocation | null {
    if (!(name in this.uniformLocationCache)) {
      this.uniformLocationCache[name] = this.gl.getUniformLocation(
        this.program,
        name,
      );
    }
    return this.uniformLocationCache[name];
  }

  /**
   * Sets up a uniform block with the given binding point and its uniforms
   */
  public setupUniformBlock(
    blockName: string,
    bindingPoint: TUniformBlockBinding,
    uniformNames?: string[],
  ): TUniformBlockInfo {
    const blockIndex = this.gl.getUniformBlockIndex(this.program, blockName);
    if (blockIndex === this.gl.INVALID_INDEX) {
      throw new Error(`Uniform block ${blockName} not found in program`);
    }

    // Get the size of the uniform block
    const blockSize = this.gl.getActiveUniformBlockParameter(
      this.program,
      blockIndex,
      this.gl.UNIFORM_BLOCK_DATA_SIZE,
    );

    // Bind the uniform block to the binding point
    this.gl.uniformBlockBinding(this.program, blockIndex, bindingPoint);

    const blockInfo: TUniformBlockInfo = {
      index: blockIndex,
      size: blockSize,
      uniforms: {},
    };

    // If uniform names are provided, get their offsets
    if (uniformNames && uniformNames.length > 0) {
      blockInfo.uniforms = this.getUniformBlockOffsets(blockName, uniformNames);
    }

    this.uniformBlockCache.set(blockName, blockInfo);
    return blockInfo;
  }

  /**
   * Gets uniform block information and offsets for the given uniforms
   */
  public getUniformBlockOffsets(
    blockName: string,
    uniformNames: string[],
  ): { [name: string]: number } {
    const indices = this.gl.getUniformIndices(this.program, uniformNames);
    if (!indices) {
      throw new Error(`Could not get uniform indices for block ${blockName}`);
    }

    const offsets = this.gl.getActiveUniforms(
      this.program,
      indices,
      this.gl.UNIFORM_OFFSET,
    );
    if (!offsets) {
      throw new Error(`Could not get uniform offsets for block ${blockName}`);
    }

    const offsetMap: { [name: string]: number } = {};
    uniformNames.forEach((name, i) => {
      offsetMap[name] = offsets[i];
    });

    return offsetMap;
  }

  /**
   * Validates that all required uniforms exist, excluding those in uniform blocks
   */
  public validateUniforms(
    requiredUniforms: string[],
    blockUniforms: string[] = [],
  ): void {
    // Filter out uniforms that are in blocks
    const nonBlockUniforms = requiredUniforms.filter(
      (name) => !blockUniforms.includes(name),
    );

    const missingUniforms = nonBlockUniforms.filter(
      (name) => this.getUniformLocation(name) === null,
    );

    if (missingUniforms.length > 0) {
      throw new Error(
        `Missing required uniforms: ${missingUniforms.join(', ')}`,
      );
    }
  }

  /**
   * Clear the cache when program is deleted
   */
  public clearCache(): void {
    this.uniformLocationCache = {};
    this.uniformBlockCache.clear();
  }
}
