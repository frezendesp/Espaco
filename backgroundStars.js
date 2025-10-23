import * as THREE from 'three';

export function createBackgroundStars(scene, { count = 1500, radius = 800 } = {}) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const distance = radius * Math.cbrt(Math.random());

    const index = i * 3;
    positions[index] = distance * Math.sin(phi) * Math.cos(theta);
    positions[index + 1] = distance * Math.cos(phi);
    positions[index + 2] = distance * Math.sin(phi) * Math.sin(theta);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.4,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85
  });

  const stars = new THREE.Points(geometry, material);
  stars.name = 'background-stars';
  scene.add(stars);
  return stars;
}

export function updateBackgroundStars(stars, dt) {
  if (!stars) {
    return;
  }
  stars.rotation.y += 0.02 * dt;
}
