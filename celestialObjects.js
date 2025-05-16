// Importar o THREE para usar classes 3D e matemáticas
import * as THREE from 'three'; // Importar do Three.js

// Mover a definição completa da classe CelestialObject para cá
export class CelestialObject {
    constructor(type, name, mass, radius, color, initialPosition = { x: 0, y: 0, z: 0 }, initialVelocity = { x: 0, y: 0, z: 0 }) {
        // (Mover o código completo do construtor para cá)
        this.id = -1; // Será definido em main.js
        this.type = type;
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.position = new THREE.Vector3(initialPosition.x, initialPosition.y, initialPosition.z);
        this.velocity = new THREE.Vector3(initialVelocity.x, initialVelocity.y, initialVelocity.z);
        this.mesh = null;
        this.color = color;

        this.createMesh(); // Chamar método interno
    }

    createMesh() {
        // (Mover o corpo completo da função createMesh para cá)
         const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
         const material = new THREE.MeshBasicMaterial({ color: this.color });
         if (this.type === 'star') {
              material.color.setHex(this.color);
         }
         this.mesh = new THREE.Mesh(geometry, material);
         this.mesh.position.copy(this.position);
    }

    updatePosition(dt) {
        // (Mover o corpo completo da função updatePosition para cá)
         this.position.add(this.velocity.clone().multiplyScalar(dt));
         // A atualização do mesh é feita separadamente, talvez no main.js ou em updatePhysics revisada
         // this.mesh.position.copy(this.position); // Esta linha pode ser removida daqui
    }
    // Pode adicionar outros métodos aqui, como updateMeshPosition(dt)
     updateMeshPosition() {
         if (this.mesh) {
             this.mesh.position.copy(this.position);
         }
     }
}