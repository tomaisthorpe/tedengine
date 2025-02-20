import { TUniformManager, TUniformBlockBinding } from './uniform-manager';

describe('TUniformManager', () => {
  let gl: WebGL2RenderingContext;
  let program: WebGLProgram;
  let uniformManager: TUniformManager;

  beforeEach(() => {
    // Mock WebGL context and program
    gl = {
      getUniformLocation: jest.fn(),
      getUniformBlockIndex: jest.fn(),
      getActiveUniformBlockParameter: jest.fn(),
      uniformBlockBinding: jest.fn(),
      getUniformIndices: jest.fn(),
      getActiveUniforms: jest.fn(),
      UNIFORM_BLOCK_DATA_SIZE: 'UNIFORM_BLOCK_DATA_SIZE',
      UNIFORM_OFFSET: 'UNIFORM_OFFSET',
      INVALID_INDEX: -1,
    } as unknown as WebGL2RenderingContext;

    program = {} as WebGLProgram;
    uniformManager = new TUniformManager(gl, program);
  });

  describe('getUniformLocation', () => {
    it('should get and cache uniform location', () => {
      const mockLocation = {} as WebGLUniformLocation;
      (gl.getUniformLocation as jest.Mock).mockReturnValue(mockLocation);

      const location1 = uniformManager.getUniformLocation('uTest');
      const location2 = uniformManager.getUniformLocation('uTest');

      expect(location1).toBe(mockLocation);
      expect(location2).toBe(mockLocation);
      expect(gl.getUniformLocation).toHaveBeenCalledTimes(1);
      expect(gl.getUniformLocation).toHaveBeenCalledWith(program, 'uTest');
    });

    it('should return null for non-existent uniform', () => {
      (gl.getUniformLocation as jest.Mock).mockReturnValue(null);

      const location = uniformManager.getUniformLocation('uNonExistent');

      expect(location).toBeNull();
    });
  });

  describe('setupUniformBlock', () => {
    it('should set up uniform block with binding point', () => {
      const blockIndex = 1;
      const blockSize = 256;
      (gl.getUniformBlockIndex as jest.Mock).mockReturnValue(blockIndex);
      (gl.getActiveUniformBlockParameter as jest.Mock).mockReturnValue(
        blockSize,
      );

      const blockInfo = uniformManager.setupUniformBlock(
        'Global',
        TUniformBlockBinding.Global,
      );

      expect(blockInfo).toEqual({
        index: blockIndex,
        size: blockSize,
        uniforms: {},
      });
      expect(gl.getUniformBlockIndex).toHaveBeenCalledWith(program, 'Global');
      expect(gl.uniformBlockBinding).toHaveBeenCalledWith(
        program,
        blockIndex,
        TUniformBlockBinding.Global,
      );
    });

    it('should throw error for invalid block', () => {
      (gl.getUniformBlockIndex as jest.Mock).mockReturnValue(gl.INVALID_INDEX);

      expect(() =>
        uniformManager.setupUniformBlock(
          'Invalid',
          TUniformBlockBinding.Global,
        ),
      ).toThrow('Uniform block Invalid not found in program');
    });

    it('should get uniform offsets when names are provided', () => {
      const blockIndex = 1;
      const blockSize = 256;
      const uniformIndices = [0, 1];
      const uniformOffsets = [0, 16];

      (gl.getUniformBlockIndex as jest.Mock).mockReturnValue(blockIndex);
      (gl.getActiveUniformBlockParameter as jest.Mock).mockReturnValue(
        blockSize,
      );
      (gl.getUniformIndices as jest.Mock).mockReturnValue(uniformIndices);
      (gl.getActiveUniforms as jest.Mock).mockReturnValue(uniformOffsets);

      const blockInfo = uniformManager.setupUniformBlock(
        'Global',
        TUniformBlockBinding.Global,
        ['uVar1', 'uVar2'],
      );

      expect(blockInfo.uniforms).toEqual({
        uVar1: 0,
        uVar2: 16,
      });
    });
  });

  describe('getUniformBlockOffsets', () => {
    it('should get offsets for uniform block members', () => {
      const uniformIndices = [0, 1, 2];
      const uniformOffsets = [0, 16, 32];
      (gl.getUniformIndices as jest.Mock).mockReturnValue(uniformIndices);
      (gl.getActiveUniforms as jest.Mock).mockReturnValue(uniformOffsets);

      const offsets = uniformManager.getUniformBlockOffsets('Global', [
        'uVar1',
        'uVar2',
        'uVar3',
      ]);

      expect(offsets).toEqual({
        uVar1: 0,
        uVar2: 16,
        uVar3: 32,
      });
    });

    it('should throw error when unable to get uniform indices', () => {
      (gl.getUniformIndices as jest.Mock).mockReturnValue(null);

      expect(() =>
        uniformManager.getUniformBlockOffsets('Global', ['uVar1']),
      ).toThrow('Could not get uniform indices for block Global');
    });

    it('should throw error when unable to get uniform offsets', () => {
      (gl.getUniformIndices as jest.Mock).mockReturnValue([0]);
      (gl.getActiveUniforms as jest.Mock).mockReturnValue(null);

      expect(() =>
        uniformManager.getUniformBlockOffsets('Global', ['uVar1']),
      ).toThrow('Could not get uniform offsets for block Global');
    });
  });

  describe('validateUniforms', () => {
    it('should validate required uniforms', () => {
      (gl.getUniformLocation as jest.Mock).mockReturnValue({});

      expect(() =>
        uniformManager.validateUniforms(['uTest1', 'uTest2']),
      ).not.toThrow();
    });

    it('should throw error for missing uniforms', () => {
      (gl.getUniformLocation as jest.Mock).mockReturnValue(null);

      expect(() =>
        uniformManager.validateUniforms(['uMissing1', 'uMissing2']),
      ).toThrow('Missing required uniforms: uMissing1, uMissing2');
    });

    it('should skip validation for block uniforms', () => {
      (gl.getUniformLocation as jest.Mock).mockReturnValue(null);

      expect(() =>
        uniformManager.validateUniforms(
          ['uBlock1', 'uBlock2', 'uNormal'],
          ['uBlock1', 'uBlock2'],
        ),
      ).toThrow('Missing required uniforms: uNormal');
    });
  });

  describe('clearCache', () => {
    it('should clear uniform location and block caches', () => {
      // Setup some cached values
      (gl.getUniformLocation as jest.Mock).mockReturnValue({});
      (gl.getUniformBlockIndex as jest.Mock).mockReturnValue(1);
      (gl.getActiveUniformBlockParameter as jest.Mock).mockReturnValue(256);

      uniformManager.getUniformLocation('uTest');
      uniformManager.setupUniformBlock('Global', TUniformBlockBinding.Global);

      uniformManager.clearCache();

      // Get location again to verify cache was cleared
      uniformManager.getUniformLocation('uTest');
      expect(gl.getUniformLocation).toHaveBeenCalledTimes(2);
    });
  });
});
