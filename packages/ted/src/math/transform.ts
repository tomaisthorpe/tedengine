import { mat4, quat, vec3 } from 'gl-matrix';

/**
 * A transform describes an option in 3D space
 */

export class TTransform {
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

  /**
   * Adjusts the rotation so it is looking towards a given position.
   *
   * This method calculates the direction from the current position to the target position,
   * then calculates the right and up vectors based on this direction.
   * Finally, it creates a rotation quaternion from these vectors and sets the rotation to this quaternion.
   *
   * @param target - The target position as a vec3
   */
  public lookAt(target: vec3) {
    const direction = vec3.subtract(vec3.create(), this.translation, target);
    vec3.normalize(direction, direction);

    const up = vec3.fromValues(0, 1, 0);
    const right = vec3.cross(vec3.create(), up, direction);
    vec3.normalize(right, right);

    const newUp = vec3.cross(vec3.create(), direction, right);
    vec3.normalize(newUp, newUp);

    this.rotation = quat.fromMat3(quat.create(), [
      right[0],
      right[1],
      right[2],
      newUp[0],
      newUp[1],
      newUp[2],
      direction[0],
      direction[1],
      direction[2],
    ]);
  }
}
