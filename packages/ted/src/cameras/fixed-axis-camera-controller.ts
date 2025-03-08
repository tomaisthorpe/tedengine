import { vec3, quat } from 'gl-matrix';
import type TEngine from '../engine/engine';
import { TComponent } from '../ecs/component';
import type { TECS } from '../ecs/ecs';
import { TSystem } from '../ecs/system';
import type TECSQuery from '../ecs/query';
import { TCameraComponent } from './camera-component';
import { TActiveCameraComponent } from './camera-component';
import { TTransformComponent } from '../components';
import { TRigidBodyComponent } from '../physics/rigid-body-component';
import type TWorld from '../core/world';

export class TFixedAxisCameraComponent extends TComponent {
  public distance = 0;
  public axis = 'z';
  public deadzone = 0;
  public bounds?: { min: vec3; max: vec3 };
  public leadFactor = 0;
  public maxLead = 0;
  public lerpFactor = 1;

  constructor(config?: {
    distance?: number;
    axis?: string;
    deadzone?: number;
    bounds?: { min: vec3; max: vec3 };
    leadFactor?: number;
    maxLead?: number;
    lerpFactor?: number;
  }) {
    super();

    if (config?.distance !== undefined) {
      this.distance = config.distance;
    }

    if (config?.axis !== undefined) {
      this.axis = config.axis;
    }

    if (config?.deadzone !== undefined) {
      this.deadzone = config.deadzone;
    }

    if (config?.bounds !== undefined) {
      this.bounds = config.bounds;
    }

    if (config?.leadFactor !== undefined) {
      this.leadFactor = config.leadFactor;
    }

    if (config?.maxLead !== undefined) {
      this.maxLead = config.maxLead;
    }

    if (config?.lerpFactor !== undefined) {
      this.lerpFactor = config.lerpFactor;
    }
  }
}

export class TFixedAxisCameraTargetComponent extends TComponent {}

export class TFixedAxisCameraSystem extends TSystem {
  private activeCameraQuery: TECSQuery;
  private targetQuery: TECSQuery;
  private axisConfig: {
    [key: string]: {
      distance: [number, number, number];
      rotation: [number, number, number];
    };
  } = {
    x: { distance: [1, 0, 0], rotation: [0, 90, 0] },
    y: { distance: [0, 1, 0], rotation: [-90, 0, 0] },
    z: { distance: [0, 0, 1], rotation: [0, 0, 0] },
  };
  constructor(private ecs: TECS) {
    super();

    this.activeCameraQuery = ecs.createQuery([
      TCameraComponent,
      TActiveCameraComponent,
      TFixedAxisCameraComponent,
    ]);

    this.targetQuery = ecs.createQuery([
      TTransformComponent,
      TFixedAxisCameraTargetComponent,
      TRigidBodyComponent,
    ]);
  }

  public async update(
    engine: TEngine,
    world: TWorld,
    ecs: TECS,
    delta: number,
  ): Promise<void> {
    const entities = this.activeCameraQuery.execute();

    for (const entity of entities) {
      const camera = this.ecs.getComponents(entity)?.get(TCameraComponent);
      const cameraTransform = this.ecs
        .getComponents(entity)
        ?.get(TTransformComponent);
      const fixedAxisCamera = this.ecs
        .getComponents(entity)
        ?.get(TFixedAxisCameraComponent);
      if (!camera || !cameraTransform || !fixedAxisCamera) {
        continue;
      }

      const targets = this.targetQuery.execute();
      if (targets.length === 0) {
        continue;
      }

      const target = targets[0];

      const targetTransform = this.ecs
        .getComponents(target)
        ?.get(TTransformComponent);
      const targetRigidBody = this.ecs
        .getComponents(target)
        ?.get(TRigidBodyComponent);
      if (!targetTransform || !targetRigidBody) {
        continue;
      }

      const targetVelocity = targetRigidBody.physicsOptions.linearVelocity ?? [
        0, 0, 0,
      ];
      const velocity = vec3.scale(vec3.create(), targetVelocity, delta);

      // Calculate lead position with maximum lead
      const leadPosition = vec3.create();
      const leadVector = vec3.create();
      vec3.scale(leadVector, velocity, fixedAxisCamera.leadFactor);

      // Limit the lead vector to the maximum lead distance
      if (fixedAxisCamera.maxLead > 0) {
        const leadDistance = vec3.length(leadVector);
        if (leadDistance > fixedAxisCamera.maxLead) {
          vec3.scale(
            leadVector,
            leadVector,
            fixedAxisCamera.maxLead / leadDistance,
          );
        }
      }

      vec3.add(leadPosition, targetTransform.transform.translation, leadVector);

      const distance = vec3.multiply(
        vec3.create(),
        this.axisConfig[fixedAxisCamera.axis].distance,
        vec3.fromValues(
          fixedAxisCamera.distance,
          fixedAxisCamera.distance,
          fixedAxisCamera.distance,
        ),
      );

      const targetPosition = vec3.add(vec3.create(), leadPosition, distance);

      // Apply bounds to target position
      let outOfBounds = false;
      if (fixedAxisCamera.bounds) {
        const originalTarget = vec3.clone(targetPosition);
        vec3.max(targetPosition, targetPosition, fixedAxisCamera.bounds.min);
        vec3.min(targetPosition, targetPosition, fixedAxisCamera.bounds.max);
        outOfBounds = !vec3.equals(originalTarget, targetPosition);
      }

      // Apply deadzone
      const currentCameraPosition = cameraTransform.transform.translation;
      const distanceToTarget = vec3.distance(
        currentCameraPosition,
        targetPosition,
      );

      if (distanceToTarget > fixedAxisCamera.deadzone || outOfBounds) {
        const t = 1 - Math.pow(1 - fixedAxisCamera.lerpFactor, delta * 10);
        cameraTransform.transform.translation = this.lerpVector(
          currentCameraPosition,
          targetPosition,
          t,
        );

        const rotation = quat.fromEuler(
          quat.create(),
          ...this.axisConfig[fixedAxisCamera.axis].rotation,
        );
        cameraTransform.transform.rotation = rotation;
      }
    }
  }

  private lerpVector(current: vec3, target: vec3, t: number): vec3 {
    return vec3.lerp(vec3.create(), current, target, t);
  }
}
