// WebGL constants mock
export const WebGL2Constants = {
  FLOAT: 0x1406,
  ARRAY_BUFFER: 0x8892,
  ELEMENT_ARRAY_BUFFER: 0x8893,
  STATIC_DRAW: 0x88e4,
  DYNAMIC_DRAW: 0x88e8,
  VERTEX_SHADER: 0x8b31,
  FRAGMENT_SHADER: 0x8b30,
  COMPILE_STATUS: 0x8b81,
  LINK_STATUS: 0x8b82,
  COLOR_BUFFER_BIT: 0x4000,
  DEPTH_BUFFER_BIT: 0x0100,
  TRIANGLES: 0x0004,
  UNSIGNED_SHORT: 0x1403,
  UNSIGNED_INT: 0x1405,
} as const;

// Create a minimal mock of WebGL2RenderingContext
class WebGL2RenderingContextMock {
  static readonly FLOAT = WebGL2Constants.FLOAT;
  static readonly ARRAY_BUFFER = WebGL2Constants.ARRAY_BUFFER;
  static readonly ELEMENT_ARRAY_BUFFER = WebGL2Constants.ELEMENT_ARRAY_BUFFER;
  static readonly STATIC_DRAW = WebGL2Constants.STATIC_DRAW;
  static readonly DYNAMIC_DRAW = WebGL2Constants.DYNAMIC_DRAW;
  static readonly VERTEX_SHADER = WebGL2Constants.VERTEX_SHADER;
  static readonly FRAGMENT_SHADER = WebGL2Constants.FRAGMENT_SHADER;
  static readonly COMPILE_STATUS = WebGL2Constants.COMPILE_STATUS;
  static readonly LINK_STATUS = WebGL2Constants.LINK_STATUS;
  static readonly COLOR_BUFFER_BIT = WebGL2Constants.COLOR_BUFFER_BIT;
  static readonly DEPTH_BUFFER_BIT = WebGL2Constants.DEPTH_BUFFER_BIT;
  static readonly TRIANGLES = WebGL2Constants.TRIANGLES;
  static readonly UNSIGNED_SHORT = WebGL2Constants.UNSIGNED_SHORT;
  static readonly UNSIGNED_INT = WebGL2Constants.UNSIGNED_INT;

  createProgram() {
    return {};
  }
  createShader() {
    return {};
  }
  shaderSource() {}
  compileShader() {}
  attachShader() {}
  linkProgram() {}
  useProgram() {}
  getAttribLocation() {
    return 0;
  }
  getUniformLocation() {
    return {};
  }
  createBuffer() {
    return {};
  }
  bindBuffer() {}
  bufferData() {}
  enableVertexAttribArray() {}
  vertexAttribPointer() {}
  createVertexArray() {
    return {};
  }
  bindVertexArray() {}
  drawElements() {}
  drawArrays() {}
  viewport() {}
  clear() {}
  clearColor() {}
  getError() {
    return 0;
  }
}

// Set up the global mock if we're in a Node.js environment
if (typeof window === 'undefined') {
  (global as any).WebGL2RenderingContext = WebGL2RenderingContextMock;
  (global as any).HTMLCanvasElement = class {
    getContext() {
      return new WebGL2RenderingContextMock();
    }
  };
}
