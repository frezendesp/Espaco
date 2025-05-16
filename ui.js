// ui.js

// Importar o que é necessário para a UI e para criar objetos (a classe CelestialObject)
import * as THREE from 'three'; // Para usar Vector3, etc. (se a lógica da UI usar)
import { CelestialObject } from './celestialObjects.js'; // Importar a classe CelestialObject

// Referências aos elementos da UI - Inicialmente nulas, serão obtidas na função setup
let createStarBtn, starXInput, starYInput, starZInput, starMassInput;
let objectSelect, selectedObjectControls, selectedObjectName, objectMassInput, updateMassBtn;
let objectVelocityXInput, objectVelocityYInput, objectVelocityZInput, updateVelocityBtn;
let numPlanetsInput, planetMassInput, planetOrbitRadiusInput, addPlanetsBtn; // Referência do addPlanetsBtn
let viewTopBtn, viewSideBtn, viewAngledBtn;
let canvasContainer;

// Referências às variáveis globais da simulação (serão passadas na inicialização por main.js)
let celestialObjectsRef, selectedObjectRef, nextObjectIdRef, sceneRef, cameraRef, controlsRef;
const G = 0.1; // Constante gravitacional (pode ser definida aqui ou importada de physics.js)


// Função para inicializar todos os event listeners e obter referências da UI
// Esta função será chamada uma vez a partir de main.js, passando as referências necessárias
export function setupUIEventListeners(celestialObjects, selectedObject, nextObjectId, scene, camera, controls) {
    // --- 1. Obter Referências aos Elementos HTML (Mover todos os document.getElementById para esta seção) ---
    createStarBtn = document.getElementById('create-star-btn');
    starXInput = document.getElementById('star-x');
    starYInput = document.getElementById('star-y'); // Esta é provavelmente a linha 26 no seu arquivo
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

    // --- Fim da Seção de Obtenção de Referências ---

    // Atribuir referências das variáveis principais da simulação passadas de main.js
    celestialObjectsRef = celestialObjects;
    selectedObjectRef = selectedObject; // Nota: selectedObject será atualizado POR AQUI, precisa ser uma referência que main.js veja
    nextObjectIdRef = nextObjectId; // Nota: nextObjectId será incrementado POR AQUI
    sceneRef = scene;
    cameraRef = camera;
    controlsRef = controls;


    // --- Event Listeners ---

    // Evento: Botão Criar Estrela clicado
    createStarBtn.addEventListener('click', () => {
        const x = parseFloat(starXInput.value) || 0;
        const y = parseFloat(starYInput.value) || 0;
        const z = parseFloat(starZInput.value) || 0;
        const mass = parseFloat(starMassInput.value) || 1000;
        const radius = Math.cbrt(mass) * 0.5;
        const color = 0xffff00;

        // Usa a classe CelestialObject IMPORTADA
        const star = new CelestialObject('star', null, mass, radius, color, { x, y, z });
        star.id = nextObjectIdRef++; // Atribuir ID usando a referência passada
        star.name = star.name || `star-${star.id}`; // Gerar nome se não fornecido

        celestialObjectsRef.push(star); // Adicionar à lista principal
        sceneRef.add(star.mesh); // Adicionar à cena principal

        updateObjectSelect(); // Atualizar dropdown (definido aqui ou exportado/importado)
        console.log(`Estrela criada: ${star.name} em (${x}, ${y}, ${z}) com massa ${mass}`);
    });


    // Evento: Botão Adicionar Planetas clicado
    addPlanetsBtn.addEventListener('click', () => { // ADICIONAR O EVENT LISTENER COMPLETO AQUI
         // Verifica se um objeto está selecionado e é uma estrela
         if (selectedObjectRef && selectedObjectRef.type === 'star') {
             const numPlanets = parseInt(numPlanetsInput.value) || 5;
             const planetMass = parseFloat(planetMassInput.value) || 1;
             const orbitRadius = parseFloat(planetOrbitRadiusInput.value) || 50;

             if (numPlanets <= 0 || isNaN(numPlanets) || planetMass <= 0 || isNaN(planetMass) || orbitRadius <= 0 || isNaN(orbitRadius)) {
                 alert("Valores para adicionar planetas inválidos.");
                 return;
             }

             const star = selectedObjectRef; // Usa a referência do objeto selecionado
             const starMass = star.mass;
             // G está acessível aqui (definido ou importado em ui.js)

             for (let i = 0; i < numPlanets; i++) {
                 // Lógica para calcular posição e velocidade inicial do planeta (usa THREE)
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

                 // Usa a classe CelestialObject IMPORTADA
                  const planet = new CelestialObject('planet', null, planetMass, planetRadius, planetColor,
                      { x: initialPosX, y: initialPosY, z: initialPosZ },
                      { x: initialVelocity.x, y: initialVelocity.y, z: initialVelocity.z }
                  );

                 planet.id = nextObjectIdRef++; // Atribuir ID usando a referência passada
                 planet.name = planet.name || `planet-${planet.id}`; // Gerar nome se não fornecido

                 celestialObjectsRef.push(planet); // Adicionar à lista principal
                 sceneRef.add(planet.mesh); // Adicionar à cena principal

             } // Fim do loop for
             updateObjectSelect(); // Atualizar dropdown
             console.log(`${numPlanetas} planetas adicionados ao redor de ${star.name}.`);
         } else {
             alert("Por favor, selecione uma estrela para adicionar planetas.");
         }
     });


     // Mover TODOS os outros event listeners para cá (select, update mass/velocity, camera views)
     // Exemplo: Evento Seleção de Objeto
      objectSelect.addEventListener('change', (event) => {
          const objectId = parseInt(event.target.value);
          selectedObjectRef = celestialObjectsRef.find(obj => obj.id === objectId) || null; // Atualizar selectedObjectRef

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
      });

      // Exemplo: Botões de Controle de Câmera (usando cameraRef e controlsRef)
       viewTopBtn.addEventListener('click', () => {
           cameraRef.position.set(0, 200, 0);
           cameraRef.lookAt(0, 0, 0);
           if (controlsRef) { controlsRef.target.set(0, 0, 0); controlsRef.update(); }
       });
       // ... outros listeners de câmera ...

       // TODO: Mover os listeners update mass e update velocity para cá
    }

    // Exportar a função de inicialização da UI para ser chamada por main.js
    export { setupUIEventListeners, updateObjectSelect }; // updateObjectSelect também pode ser chamado de fora (ex: após colisão)

    // TODO: Se updateObjectSelect precisar de acesso direto a selectedObjectControls, selectedObjectName,
    // ou outros elementos da UI que não são passados como parâmetros, talvez precise ajustar como as referências são gerenciadas.
    // Passar as referências no setup é geralmente mais limpo.