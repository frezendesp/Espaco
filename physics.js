// Importar o que for necessário
// import * as THREE from 'three'; // Se usar classes do THREE aqui

const G = 0.1; // Constante Gravitacional (valor ajustado para a simulação)
// Exportar G se necessário em outros lugares
// export { G };

// Mover o corpo completo da função updatePhysics para cá
// Precisará receber celestialObjects e dt como parâmetros
export function updatePhysics(celestialObjects, dt) {
    // TODO: Implementar a lógica de física N-body completa aqui (todos atraem todos)
    celestialObjects.forEach(object => {
        // Lógica atual que itera sobre planetas e força de estrelas (precisa generalizar)
        if (object.type === 'planet') { // Esta condição vai sumir para física N-body
            let totalForceX = 0;
            let totalForceY = 0;
            let totalForceZ = 0;

            // Calcula a força gravitacional de TODOS os OUTROS objetos
            celestialObjects.forEach(otherObject => {
                if (object !== otherObject) { // Não calcular força de um objeto em si mesmo
                    const dx = otherObject.position.x - object.position.x;
                    const dy = otherObject.position.y - object.position.y;
                    const dz = otherObject.position.z - object.position.z;
                    const distanceSq = dx * dx + dy * dy + dz * dz;
                    const distance = Math.sqrt(distanceSq);

                    // Evita forças extremas ou divisão por zero
                    if (distance > object.radius + otherObject.radius) { // Apenas se não estiverem "colidindo" visualmente
                        const forceMagnitude = (G * object.mass * otherObject.mass) / distanceSq;

                        // Componentes da força
                        totalForceX += forceMagnitude * (dx / distance);
                        totalForceY += forceMagnitude * (dy / distance);
                        totalForceZ += forceMagnitude * (dz / distance);
                    }
                    // TODO: Lidar com objetos muito próximos ou colidindo de forma mais robusta
                }
            });

            // Calcula aceleração (a = F/m)
            const accelerationX = totalForceX / object.mass;
            const accelerationY = totalForceY / object.mass;
            const accelerationZ = totalForceZ / object.mass;

            // Atualiza velocidade (v = v + a * dt)
            object.velocity.x += accelerationX * dt;
            object.velocity.y += accelerationY * dt;
            object.velocity.z += accelerationZ * dt;

            // A atualização da posição está na classe CelestialObject
            // object.updatePosition(dt);
        }
        // TODO: Remover a condição 'if (object.type === 'planet')' e aplicar a força/atualização a TODOS os objetos
    });
     // Nota: A atualização da posição object.updatePosition(dt); precisa ser chamada para TODOS os objetos APÓS calcularmos as forças para TODOS
     // Uma forma comum é primeiro calcular todas as forças e acelerações em um loop, armazená-las, e depois em outro loop, atualizar velocidades e posições.
}