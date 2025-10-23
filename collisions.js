export function checkCollisions(celestialObjects, scene, callbacks = {}) {
  const { onObjectsMerged, onObjectRemoved } = callbacks;

  for (let i = celestialObjects.length - 1; i >= 0; i--) {
    const objectA = celestialObjects[i];
    for (let j = i - 1; j >= 0; j--) {
      const objectB = celestialObjects[j];
      const distance = objectA.position.distanceTo(objectB.position);
      if (distance > objectA.radius + objectB.radius) {
        continue;
      }

      const primary = objectA.mass >= objectB.mass ? objectA : objectB;
      const secondary = primary === objectA ? objectB : objectA;

      primary.absorb(secondary);

      if (scene && secondary.mesh) {
        scene.remove(secondary.mesh);
        if (secondary.mesh.geometry) {
          secondary.mesh.geometry.dispose();
        }
        if (secondary.mesh.material && typeof secondary.mesh.material.dispose === 'function') {
          secondary.mesh.material.dispose();
        }
      }

      const removalIndex = secondary === objectA ? i : j;
      celestialObjects.splice(removalIndex, 1);

      if (typeof onObjectRemoved === 'function') {
        onObjectRemoved(secondary);
      }
      if (typeof onObjectsMerged === 'function') {
        onObjectsMerged(primary, secondary);
      }

      if (secondary === objectA) {
        break;
      }
    }
  }
}
