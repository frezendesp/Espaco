// Import Three.js (já no HTML via CDN)

// Variáveis globais para Three.js: scene, camera, renderer
// Variáveis globais para simulação: celestialObjects = [], selectedObject = null
// Constante gravitacional G

// --- Funções de Inicialização ---
function init3DScene() {
    // Configura scene, camera, renderer
    // Adiciona luzes
    // Adiciona e dimensiona o canvas ao canvas-container
    // Inicia o loop de animação: animate()
}

// --- Loop de Animação ---
function animate() {
    requestAnimationFrame(animate);

    updatePhysics(); // Calcula as novas posições e velocidades
    update3DObjects(); // Atualiza os meshes 3D na cena
    checkCollisions(); // Verifica e lida com colisões

    renderer.render(scene, camera); // Renderiza a cena
}

// --- Simulação Física ---
function updatePhysics() {
    const dt = 0.1; // Intervalo de tempo (pode precisar ajustar)

    // Para cada objeto no celestialObjects (planetas):
    celestialObjects.forEach(object => {
        if (object.type === 'planet') {
            let totalForceX = 0;
            let totalForceY = 0;
            let totalForceZ = 0;

            // Calcula a força gravitacional das estrelas sobre este planeta
            celestialObjects.forEach(otherObject => {
                if (otherObject.type === 'star') {
                    const dx = otherObject.position.x - object.position.x;
                    const dy = otherObject.position.y - object.position.y;
                    const dz = otherObject.position.z - object.position.z;
                    const distanceSq = dx*dx + dy*dy + dz*dz;
                    const distance = Math.sqrt(distanceSq);

                    // Evita divisão por zero se objetos estiverem exatamente na mesma posição
                    if (distance > 0.01) { // Usar um pequeno epsilon
                        const forceMagnitude = (G * object.mass * otherObject.mass) / distanceSq;

                        // Componentes da força
                        totalForceX += forceMagnitude * (dx / distance);
                        totalForceY += forceMagnitude * (dy / distance);
                        totalForceZ += forceMagnitude * (dz / distance);
                    }
                }
            });

            // Atualiza aceleração (a = F/m)
            const accelerationX = totalForceX / object.mass;
            const accelerationY = totalForceY / object.mass;
            const accelerationZ = totalForceZ / object.mass;

            // Atualiza velocidade (v = v + a * dt)
            object.velocity.x += accelerationX * dt;
            object.velocity.y += accelerationY * dt;
            object.velocity.z += accelerationZ * dt;

            // Atualiza posição (p = p + v * dt)
            object.position.x += object.velocity.x * dt;
            object.position.y += object.velocity.y * dt;
            object.position.z += object.velocity.z * dt;
        }
        // Estrelas podem não precisar de cálculo de força gravitacional de planetas para uma simulação inicial
        // Mas se quisermos que elas se movam devido à atração planetária, adicionar lógica aqui.
    });
}

// --- Atualizar 3D ---
function update3DObjects() {
    celestialObjects.forEach(object => {
        // Atualiza a posição do mesh 3D com a posição calculada na física
        object.mesh.position.copy(object.position);
    });
}

// --- Detecção de Colisão ---
function checkCollisions() {
    // Para cada planeta:
    // Verificar distância para cada estrela:
    // if (distance < planet.radius + star.radius) {
    //    // Remover planeta da lista celestialObjects e da cena Three.js
    // }
}

// --- Manipulação UI (Event Listeners) ---
// Adicionar listeners aos botões e select no sidebar:
// - create-star-btn -> chamar função para criar estrela, adicionar à lista e cena, atualizar select
// - object-select -> atualizar selectedObject, mostrar/esconder selected-object-controls, preencher inputs
// - update-mass-btn -> atualizar selectedObject.mass
// - update-velocity-btn -> atualizar selectedObject.velocity
// - add-planets-btn -> se selectedObject for uma estrela, gerar planetas, adicionar à lista e cena, atualizar select


// --- Funções Auxiliares ---
// function createStar(x, y, z, mass) -> retorna um objeto { type: 'star', position, velocity, mass, radius, mesh }
// function createPlanet(star, numPlanets, avgRadius, planetMass) -> cria numPlanets planetas ao redor da estrela, retorna array de objetos { type: 'planet', position, velocity, mass, radius, mesh } com velocidade orbital inicial
// function updateObjectSelect() -> popula o dropdown object-select com os nomes/IDs dos objetos em celestialObjects

// --- Iniciar ---
init3DScene();