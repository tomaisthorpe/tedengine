import { mat4, quat, vec3 } from 'gl-matrix';

/**
 * A transform describes an option in 3D space
 */

export default class TTransform {
  public translation: vec3;
  public rotation: quat;
  public scale: vec3;

  constructor(
    translation: vec3 | undefined = undefined,
    rotation: quat | undefined = undefined,
    scale: vec3 | undefined = undefined
  ) {
    if (translation === undefined) {
      this.translation = vec3.create();
    } else {
      this.translation = translation;
    }

    if (rotation === undefined) {
      this.rotation = quat.create();
    } else {
      this.rotation = rotation;
    }

    if (scale === undefined) {
      this.scale = vec3.fromValues(1, 1, 1);
    } else {
      this.scale = scale;
    }
  }

  /**
   * Gets matrix and applies scale
   *
   * @returns {mat4}
   */
  public getMatrix(): mat4 {
    const mat = mat4.fromRotationTranslationScale(
      mat4.create(),
      this.rotation,
      this.translation,
      this.scale
    );
    return mat;
  }

  /**
   * Adds one transform to another
   *
   * @param {TTransform}
   * @returns {TTransform} combined transform
   */
  public add(b: TTransform): TTransform {
    const mat = this.getUnscaledMatrix();
    const matB = b.getUnscaledMatrix();
    const matC = mat4.create();

    mat4.multiply(matC, mat, matB);

    const t = new TTransform(
      mat4.getTranslation(vec3.create(), matC),
      mat4.getRotation(quat.create(), matC),
      vec3.multiply(vec3.create(), this.scale, b.scale)
    );

    return t;
  }

  /**
   * Rotate about the X axis
   *
   * @param {number} angle (in radians)
   */
  public rotateX(angle: number) {
    quat.rotateX(this.rotation, this.rotation, angle);
  }

  /**
   * Rotate about the Y axis
   *
   * @param {number} angle (in radians)
   */
  public rotateY(angle: number) {
    quat.rotateY(this.rotation, this.rotation, angle);
  }

  /**
   * Rotate about the Z axis
   *
   * @param {number} angle (in radians)
   */
  public rotateZ(angle: number) {
    quat.rotateZ(this.rotation, this.rotation, angle);
  }

  /**
   * Gets the matrix representation of the translation and rotation
   *
   * @returns {mat4}
   */
  private getUnscaledMatrix(): mat4 {
    const mat = mat4.fromRotationTranslation(
      mat4.create(),
      this.rotation,
      this.translation
    );

    return mat;
  }
}
