// ui.js

// Importar o que é necessário
import * as THREE from 'three'; // Precisa importar THREE aqui para usar Vector3, etc.
import { CelestialObject } from './celestialObjects.js'; // !!! Importar a classe CelestialObject do seu arquivo celestialObjects.js !!!

// Variáveis de referência dos elementos da UI (serão preenchidas por getElementById dentro de setupUIEventListeners)
let createStarBtn, starXInput, starYInput, starZInput, starMassInput;
let objectSelect, selectedObjectControls, selectedObjectName, objectMassInput, updateMassBtn;
let objectVelocityXInput, objectVelocityYInput, objectVelocityZInput, updateVelocityBtn;
let numPlanetsInput, planetMassInput, planetOrbitRadiusInput, addPlanetsBtn;
let viewTopBtn, viewSideBtn, viewAngledBtn;
let canvasContainer;

// Referências às variáveis principais da simulação (serão preenchidas pelos parâmetros passados de main.js)
let celestialObjectsRef; // Referência para o array principal de objetos celestes
let selectedObjectRef; // Referência para o objeto atualmente selecionado
let nextObjectIdRef; // Referência para o contador de IDs
let sceneRef; // Referência para a cena Three.js
let cameraRef; // Referência para a câmera Three.js
let controlsRef; // Referência para os OrbitControls
const G = 0.1; // Constante gravitacional (pode ser definida aqui ou importada de physics.js)


// --- Função para inicializar todos os event listeners e obter referências da UI ---
// Esta função é chamada uma vez a partir de main.js, passando as referências necessárias do estado principal da simulação.
export function setupUIEventListeners(celestialObjects, selectedObject, nextObjectId, scene, camera, controls) {
    // --- 1. Obter Referências aos Elementos HTML (Mover todos os document.getElementById para esta seção) ---
    createStarBtn = document.getElementById('create-star-btn');
    starXInput = document.getElementById('star-x');
    starYInput = document.getElementById('star-y');
    starZInput = document.getElementById('star-z');
    starMassInput = document.getElementById('star-mass');
    objectSelect = document.getElementById('object-select');
    selectedObjectControls = document.getElementById('selected-object-controls');
    selectedObjectName = document.getElementById('selected-object-name');
    objectMassInput = document.getElementById('object-mass');
    updateMassBtn = document.getElementById('update-mass-btn');
    objectVelocityXInput = document.getElementById('object-velocity-x');
    objectVelocityYInput = document.getElementById('object-velocity-y');
    objectVelocityZInput = document.getElementById('object-velocity-z');
    updateVelocityBtn = document.getElementById('update-velocity-btn');
    numPlanetsInput = document.getElementById('num-planets');
    planetMassInput = document.getElementById('planet-mass');
    planetOrbitRadiusInput = document.getElementById('planet-orbit-radius');
    addPlanetsBtn = document.getElementById('add-planets-btn');
    viewTopBtn = document.getElementById('view-top-btn');
    viewSideBtn = document.getElementById('view-side-btn');
    viewAngledBtn = document.getElementById('view-angled-btn');
    canvasContainer = document.getElementById('canvas-container');


    // --- 2. Atribuir Referências das Variáveis Principais da Simulação (passadas de main.js) ---
    celestialObjectsRef = celestialObjects;
    selectedObjectRef = selectedObject; // selectedObject será atualizado DENTRO desta função UI
    nextObjectIdRef = nextObjectId; // nextObjectId será incrementado DENTRO desta função UI
    sceneRef = scene;
    cameraRef = camera;
    controlsRef = controls;


    // --- 3. Event Listeners (Copiar e colar a lógica completa dos botões daqui) ---

    // Evento: Botão Criar Estrela clicado
    createStarBtn.addEventListener('click', () => {
        const x = parseFloat(starXInput.value) || 0;
        const y = parseFloat(starYInput.value) || 0;
        const z = parseFloat(starZInput.value) || 0;
        const mass = parseFloat(starMassInput.value) || 1000;
        const radius = Math.cbrt(mass) * 0.5;
        const color = 0xffff00;

        // !!! Usa a classe CelestialObject IMPORTADA de celestialObjects.js !!!
        const star = new CelestialObject('star', null, mass, radius, color, { x, y, z });
        star.id = nextObjectIdRef++; // Usar a referência do ID e incrementar AQUI em ui.js
        star.name = star.name || `star-${star.id}`;

        celestialObjectsRef.push(star); // Adicionar à lista principal (usar referência passada)
        sceneRef.add(star.mesh); // Adicionar à cena principal (usar referência passada)

        updateObjectSelect(); // Chamar função que atualiza o dropdown (definida abaixo ou importada)
        console.log(`Estrela criada: ${star.name} em (${x}, ${y}, ${z}) com massa ${mass}`);
    });


    // Evento: Botão Adicionar Planetas clicado
    addPlanetsBtn.addEventListener('click', () => {
         // Verifica se um objeto está selecionado e é uma estrela (usar selectedObjectRef)
         if (selectedObjectRef && selectedObjectRef.type === 'star') {
             const numPlanets = parseInt(numPlanetsInput.value) || 5;
             const planetMass = parseFloat(planetMassInput.value) || 1;
             const orbitRadius = parseFloat(planetOrbitRadiusInput.value) || 50;

             if (numPlanets <= 0 || isNaN(numPlanets) || planetMass <= 0 || isNaN(planetMass) || orbitRadius <= 0 || isNaN(orbitRadius)) {
                 alert("Valores para adicionar planetas inválidos.");
                 return;
             }

             const star = selectedObjectRef; // Usar referência
             const starMass = star.mass;
             // G está acessível aqui (definido ou importado)

             for (let i = 0; i < numPlanets; i++) {
                 // Lógica de cálculo de posição e velocidade inicial (usa THREE)
                 const phi = Math.random() * Math.PI * 2;
                 const theta = Math.acos((Math.random() * 2) - 1);

                 const initialPosX = star.position.x + orbitRadius * Math.sin(theta) * Math.cos(phi);
                 const initialPosY = star.position.y + orbitRadius * Math.sin(theta) * Math.sin(phi);
                 const initialPosZ = star.position.z + orbitRadius * Math.cos(theta);

                 const positionVector = new THREE.Vector3(initialPosX, initialPosY, initialPosZ);
                 const starToPlanetVector = positionVector.clone().sub(star.position);
                 const orbitalSpeed = Math.sqrt((G * starMass) / starToPlanetVector.length());

                 let initialVelocity = new THREE.Vector3(-starToPlanetVector.y, starToPlanetVector.x, 0).normalize().multiplyScalar(orbitalSpeed);

                  // Lógica opcional para órbitas mais variadas (usa THREE)
                  const up = new THREE.Vector3(0, 1, 0);
                  let axis = up.clone().cross(starToPlanetVector).normalize();
                  if (axis.length() === 0) {
                      axis = new THREE.Vector3(1, 0, 0);
                  }
                  initialVelocity = axis.cross(starToPlanetVector).normalize().multiplyScalar(orbitalSpeed);


                 const planetRadius = Math.cbrt(planetMass) * 0.2;
                 const planetColor = Math.random() * 0xffffff;

                 // !!! Usa a classe CelestialObject IMPORTADA !!!
                  const planet = new CelestialObject('planet', null, planetMass, planetRadius, planetColor,
                      { x: initialPosX, y: initialPosY, z: initialPosZ },
                      { x: initialVelocity.x, y: initialVelocity.y, z: initialVelocity.z }
                  );

                 planet.id = nextObjectIdRef++; // Usar referência e incrementar AQUI
                 planet.name = planet.name || `planet-${planet.id}`;

                 celestialObjectsRef.push(planet); // Adicionar à lista principal (usar referência)
                 sceneRef.add(planet.mesh); // Adicionar à cena principal (usar referência)

             } // Fim do loop for
             updateObjectSelect(); // Atualizar dropdown
             console.log(`${numPlanetas} planetas adicionados ao redor de ${star.name}.`);
         } else {
             alert("Por favor, selecione uma estrela para adicionar planetas.");
         }
     });


     // --- Mover TODOS os outros event listeners para cá ---
     // Evento: Seleção de Objeto mudou
      objectSelect.addEventListener('change', (event) => {
          const objectId = parseInt(event.target.value);
          selectedObjectRef = celestialObjectsRef.find(obj => obj.id === objectId) || null; // !!! Atualizar selectedObjectRef AQUI !!!

          if (selectedObjectRef) {
              selectedObjectControls.style.display = 'block';
              selectedObjectName.textContent = selectedObjectRef.name;
              objectMassInput.value = selectedObjectRef.mass;
              objectVelocityXInput.value = selectedObjectRef.velocity.x.toFixed(2);
              objectVelocityYInput.value = selectedObjectRef.velocity.y.toFixed(2);
              objectVelocityZInput.value = selectedObjectRef.velocity.z.toFixed(2);
          } else {
              selectedObjectControls.style.display = 'none';
          }
          // TODO: Chamar função para atualizar UI de objeto selecionado (se houver)
      });

      // Evento: Botões de Controle de Câmera (usando cameraRef e controlsRef)
       viewTopBtn.addEventListener('click', () => {
           cameraRef.position.set(0, 200, 0);
           cameraRef.lookAt(0, 0, 0);
           if (controlsRef) { controlsRef.target.set(0, 0, 0); controlsRef.update(); }
       });
       viewSideBtn.addEventListener('click', () => {
           cameraRef.position.set(200, 0, 0);
           cameraRef.lookAt(0, 0, 0);
           if (controlsRef) { controlsRef.target.set(0, 0, 0); controlsRef.update(); }
       });
       viewAngledBtn.addEventListener('click', () => {
           cameraRef.position.set(150, 100, 150);
           cameraRef.lookAt(0, 0, 0);
           if (controlsRef) { controlsRef.target.set(0, 0, 0); controlsRef.update(); }
       });

       // TODO: Mover os listeners update mass e update velocity para cá
    } // Fim da função setupUIEventListeners


    // --- Função Auxiliar da UI ---
    // Mover a lógica da função updateObjectSelect para cá (se ela não estiver já)
    // Esta função atualiza o dropdown e é chamada após adicionar/remover objetos
    // Ela usa as referências globais (como celestialObjectsRef, objectSelect, etc.)
     function updateObjectSelect() {
         if (!objectSelect || !celestialObjectsRef) return;
         objectSelect.innerHTML = '<option value="">-- Selecione --</option>';
         celestialObjectsRef.forEach(obj => {
             const option = document.createElement('option');
             option.value = obj.id;
             option.textContent = `${obj.name} (${obj.type})`;
             objectSelect.appendChild(option);
         });
         // Tenta manter o objeto selecionado após a atualização
         // Se o objeto selecionado ainda existe na lista
         if (selectedObjectRef && celestialObjectsRef.find(obj => obj.id === selectedObjectRef.id)) {
              objectSelect.value = selectedObjectRef.id;
              // Opcional: Recarregar UI do objeto selecionado se a massa/velocidade mudou
              // if(selectedObjectControls.style.display !== 'none') {
              //     selectedObjectName.textContent = selectedObjectRef.name;
              //     objectMassInput.value = selectedObjectRef.mass;
              //     objectVelocityXInput.value = selectedObjectRef.velocity.x.toFixed(2);
              //     objectVelocityYInput.value = selectedObjectRef.velocity.y.toFixed(2);
              //     objectVelocityZInput.value = selectedObjectRef.velocity.z.toFixed(2);
              // }
         } else {
             // Se o objeto selecionado não existe mais (ex: colidiu), resetar UI
             objectSelect.value = "";
             if(selectedObjectControls) selectedObjectControls.style.display = 'none';
             selectedObjectRef = null; // Importante resetar a referência
         }
     }


    // --- Exportar funções que precisam ser chamadas de fora (principalmente de main.js) ---
    // setupUIEventListeners precisa ser chamado uma vez por main.js na inicialização
    // updateObjectSelect pode ser chamado de main.js (ex: após colisão detectada em checkCollisions)
    export { setupUIEventListeners, updateObjectSelect };

    ```

**No seu arquivo `main.js`:**

Certifique-se de que `main.js`:
1.  Importa a função `setupUIEventListeners` e `updateObjectSelect` de `./ui.js`.
2.  Ainda contém as variáveis principais da simulação: `celestialObjects = []`, `selectedObject = null`, `nextObjectId = 0`, `scene`, `camera`, `renderer`, `controls`, `G`.
3.  Chama a função `setupUIEventListeners` **uma vez** dentro de `init3DScene()`, **passando todas essas variáveis como parâmetros**.

```javascript
// main.js

import * as THREE from 'three'; // Importações do Three.js e OrbitControls (como está funcionando)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// !!! Importar a função de setup da UI e a função updateObjectSelect de ui.js !!!
import { setupUIEventListeners, updateObjectSelect } from './ui.js';

// !!! Importar a classe CelestialObject de celestialObjects.js !!!
// (Se main.js precisar usar new CelestialObject() diretamente, se não, ui.js a importa)
import { CelestialObject } from './celestialObjects.js'; // Mantenha esta importação se outras partes de main.js a usarem


// --- Variáveis Globais Three.js ---
let scene, camera, renderer;
let controls;

// --- Variáveis Globais Simulação (Estas variáveis são o estado principal da simulação) ---
let celestialObjects = []; // Array principal de objetos celestes
let selectedObject = null; // Objeto selecionado (esta referência será atualizada em ui.js)
let nextObjectId = 0; // Contador de IDs (esta referência será incrementada em ui.js)
const G = 0.1; // Constante gravitacional (pode ir para physics.js depois)


// --- Funções de Inicialização ---
function init3DScene() {
    // ... código de configuração da cena, câmera, renderizador (obtendo canvasContainer aqui) ...
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 150;

    let tempCanvasContainer = document.getElementById('canvas-container'); // Precisa pegar a referência AQUI
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(tempCanvasContainer.clientWidth, tempCanvasContainer.clientHeight);
    tempCanvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    controls = new OrbitControls(camera, renderer.domElement); // Precisa da referência do renderer.domElement obtida AQUI
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxDistance = 500;


    // !!! Chamar a função de setup da UI, passando as variáveis principais como REFERÊNCIAS !!!
    // Quando setupUIEventListeners modifica selectedObjectRef ou nextObjectIdRef, ele está modificando 'selectedObject' e 'nextObjectId' definidos aqui.
    setupUIEventListeners(celestialObjects, selectedObject, nextObjectId, scene, camera, controls);


    // Evento de redimensionamento da janela - Pode ficar aqui ou mover para ui.js
    window.addEventListener('resize', onWindowResize, false);

    // Inicia o loop de animação
    animate();
}

function onWindowResize() {
    let tempCanvasContainer = document.getElementById('canvas-container'); // Precisa pegar a referência AQUI
    camera.aspect = tempCanvasContainer.clientWidth / tempCanvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(tempCanvasContainer.clientWidth, tempCanvasContainer.clientHeight);
}

// --- Loop de Animação ---
function animate() {
    requestAnimationFrame(animate);
    const dt = 0.1;

    // Chamar updatePhysics (se estiver em physics.js)
    // updatePhysics(celestialObjects, dt); // Passar a lista de objetos e dt

    // Chamar checkCollisions (se estiver em collisions.js)
    // checkCollisions(celestialObjects, scene, updateObjectSelect); // Passar objetos, cena, e a função de callback para atualizar a UI

    // Atualizar posição dos meshes APÓS a física (isso pode ser feito aqui ou em updatePhysics revisada)
    celestialObjects.forEach(obj => {
        if (obj.mesh) {
            obj.mesh.position.copy(obj.position);
        }
    });


    if (controls) controls.update();
    if (renderer && scene && camera) {
       renderer.render(scene, camera);
    }
}

// REMOVER updatePhysics, checkCollisions, CelestialObject, updateObjectSelect, e todos os event listeners que movemos para ui.js

// ... chamada final init3DScene()...
init3DScene();