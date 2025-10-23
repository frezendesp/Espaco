import { Vector3 } from 'three';

export const G = 0.1;

const MIN_DISTANCE_SQ = 0.0001;

export function updatePhysics(celestialObjects, dt) {
  if (!Array.isArray(celestialObjects) || celestialObjects.length === 0) {
    return;
  }

  const accelerations = celestialObjects.map(() => new Vector3());
  const offset = new Vector3();
  const direction = new Vector3();

  for (let i = 0; i < celestialObjects.length; i++) {
    const objectA = celestialObjects[i];
    if (!objectA || objectA.mass <= 0) {
      continue;
    }

    for (let j = i + 1; j < celestialObjects.length; j++) {
      const objectB = celestialObjects[j];
      if (!objectB || objectB.mass <= 0) {
        continue;
      }

      offset.subVectors(objectB.position, objectA.position);
      const distanceSq = Math.max(offset.lengthSq(), MIN_DISTANCE_SQ);
      const distance = Math.sqrt(distanceSq);
      direction.copy(offset).multiplyScalar(1 / distance);

      const forceMagnitude = (G * objectA.mass * objectB.mass) / distanceSq;
      const accelA = forceMagnitude / objectA.mass;
      const accelB = forceMagnitude / objectB.mass;

      accelerations[i].addScaledVector(direction, accelA);
      accelerations[j].addScaledVector(direction, -accelB);
    }
  }

  for (let index = 0; index < celestialObjects.length; index++) {
    const object = celestialObjects[index];
    if (!object || object.mass <= 0) {
      continue;
    }

    object.velocity.addScaledVector(accelerations[index], dt);
    object.updatePosition(dt);
  }
}
