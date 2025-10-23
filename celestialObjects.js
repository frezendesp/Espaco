import * as THREE from 'three';

function toVector3(source = { x: 0, y: 0, z: 0 }) {
  if (source instanceof THREE.Vector3) {
    return source.clone();
  }
  const { x = 0, y = 0, z = 0 } = source;
  return new THREE.Vector3(x, y, z);
}

export class CelestialObject {
  constructor({
    id = -1,
    type,
    name = '',
    mass,
    radius,
    color,
    position,
    velocity
  }) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.mass = mass;
    this.radius = radius;
    this.color = color;
    this.position = toVector3(position);
    this.velocity = toVector3(velocity);
    this.radiusScale = mass > 0 ? radius / Math.cbrt(mass) : 1;
    this.mesh = this.#createMesh();
  }

  #createMesh() {
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.type === 'star' ? this.color : 0x000000,
      emissiveIntensity: this.type === 'star' ? 0.6 : 0
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.position);
    mesh.userData.celestialId = this.id;
    return mesh;
  }

  setId(id) {
    this.id = id;
    if (this.mesh) {
      this.mesh.userData.celestialId = id;
    }
  }

  setRadius(radius) {
    if (radius <= 0) {
      return;
    }
    this.radius = radius;
    if (this.mass > 0) {
      this.radiusScale = this.radius / Math.cbrt(this.mass);
    }
    if (this.mesh) {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      this.mesh.geometry.dispose();
      this.mesh.geometry = geometry;
    }
  }

  setMass(mass) {
    if (mass <= 0) {
      return;
    }
    this.mass = mass;
    const updatedRadius = Math.cbrt(mass) * this.radiusScale;
    this.setRadius(updatedRadius);
  }

  setVelocity(velocity) {
    const { x = 0, y = 0, z = 0 } = velocity;
    this.velocity.set(x, y, z);
  }

  updatePosition(dt) {
    this.position.addScaledVector(this.velocity, dt);
    this.syncMesh();
  }

  syncMesh() {
    if (this.mesh) {
      this.mesh.position.copy(this.position);
    }
  }

  absorb(other) {
    const totalMass = this.mass + other.mass;
    if (totalMass <= 0) {
      return;
    }

    const newPosition = this.position
      .clone()
      .multiplyScalar(this.mass)
      .add(other.position.clone().multiplyScalar(other.mass))
      .divideScalar(totalMass);

    const newVelocity = this.velocity
      .clone()
      .multiplyScalar(this.mass)
      .add(other.velocity.clone().multiplyScalar(other.mass))
      .divideScalar(totalMass);

    this.position.copy(newPosition);
    this.setMass(totalMass);
    this.setVelocity(newVelocity);
    this.syncMesh();
  }
}
