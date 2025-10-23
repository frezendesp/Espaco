import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CelestialObject } from './celestialObjects.js';
import {
  setupUIEventListeners,
  updateObjectSelect,
  refreshSelectedObjectControls,
  updateSimulationStatus,
  updateTimeScaleDisplay
} from './ui.js';
import { updatePhysics, G } from './physics.js';
import { checkCollisions } from './collisions.js';
import { createBackgroundStars, updateBackgroundStars } from './backgroundStars.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(150, 120, 180);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 1200;

const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
scene.add(ambientLight);

const keyLight = new THREE.PointLight(0xffffff, 1.4, 0, 2);
keyLight.position.set(120, 150, 80);
scene.add(keyLight);

const simState = {
  celestialObjects: [],
  selectedObject: null,
  nextObjectId: 1,
  isPaused: false,
  timeScale: 1
};

let backgroundStars;
const clock = new THREE.Clock();

function getRadiusForObject(type, mass) {
  const base = Math.cbrt(Math.max(mass, 0.0001));
  if (type === 'star') {
    return base * 0.6;
  }
  return base * 0.25;
}

function registerObject(object, { select = false } = {}) {
  object.setId(simState.nextObjectId++);
  if (!object.name) {
    object.name = `${object.type}-${object.id}`;
  }

  scene.add(object.mesh);
  simState.celestialObjects.push(object);
  updateObjectSelect(select ? object.id : simState.selectedObject?.id ?? null);
}

function handleCreateStar({ position, mass }) {
  const star = new CelestialObject({
    type: 'star',
    name: '',
    mass,
    radius: getRadiusForObject('star', mass),
    color: 0xffdd55,
    position: new THREE.Vector3(position.x, position.y, position.z),
    velocity: new THREE.Vector3()
  });

  registerObject(star, { select: true });
  simState.selectedObject = star;
  refreshSelectedObjectControls();
}

function randomOrbitVelocity(star, position) {
  const relative = position.clone().sub(star.position);
  if (relative.lengthSq() === 0) {
    relative.set(0, 0, 1);
  }
  const orbitalSpeed = Math.sqrt((G * star.mass) / Math.max(relative.length(), 0.001));
  const axis = new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3().crossVectors(axis, relative).normalize();
  if (!Number.isFinite(tangent.lengthSq()) || tangent.lengthSq() === 0) {
    tangent.crossVectors(new THREE.Vector3(1, 0, 0), relative).normalize();
  }
  return tangent.multiplyScalar(orbitalSpeed);
}

function handleAddPlanets({ count, planetMass, orbitRadius }) {
  const star = simState.selectedObject;
  if (!star || star.type !== 'star') {
    return;
  }

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const offset = new THREE.Vector3(
      orbitRadius * Math.sin(phi) * Math.cos(theta),
      orbitRadius * Math.cos(phi),
      orbitRadius * Math.sin(phi) * Math.sin(theta)
    );
    const position = star.position.clone().add(offset);
    const velocity = randomOrbitVelocity(star, position);

    const planet = new CelestialObject({
      type: 'planet',
      name: '',
      mass: planetMass,
      radius: getRadiusForObject('planet', planetMass),
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5).getHex(),
      position,
      velocity
    });

    registerObject(planet);
  }

  refreshSelectedObjectControls();
}

function handleSelectObject(id) {
  if (id === null) {
    simState.selectedObject = null;
  } else {
    simState.selectedObject = simState.celestialObjects.find((object) => object.id === id) || null;
  }
  refreshSelectedObjectControls();
}

function handleUpdateMass(newMass) {
  if (!simState.selectedObject) {
    return;
  }
  simState.selectedObject.setMass(newMass);
  refreshSelectedObjectControls();
}

function handleUpdateVelocity(velocity) {
  if (!simState.selectedObject) {
    return;
  }
  simState.selectedObject.setVelocity(velocity);
  refreshSelectedObjectControls();
}

function handleTogglePause() {
  simState.isPaused = !simState.isPaused;
  updateSimulationStatus(simState.isPaused);
}

function handleTimeScaleChange(timeScale) {
  simState.timeScale = timeScale;
  updateTimeScaleDisplay(simState.timeScale);
}

function applyCameraPreset(preset) {
  switch (preset) {
    case 'top':
      camera.position.set(0, 400, 0.001);
      break;
    case 'side':
      camera.position.set(400, 0, 0.001);
      break;
    default:
      camera.position.set(150, 120, 180);
      break;
  }
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.update();
}

function removeObjectFromState(object) {
  if (simState.selectedObject && simState.selectedObject.id === object.id) {
    simState.selectedObject = null;
    refreshSelectedObjectControls();
  }
  updateObjectSelect(simState.selectedObject?.id ?? null);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  if (!container) {
    return;
  }
  const { clientWidth, clientHeight } = container;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight);
}

function init() {
  const container = document.getElementById('canvas-container');
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  backgroundStars = createBackgroundStars(scene);

  setupUIEventListeners({
    simState,
    onCreateStar: handleCreateStar,
    onAddPlanets: handleAddPlanets,
    onSelectObject: handleSelectObject,
    onUpdateMass: handleUpdateMass,
    onUpdateVelocity: handleUpdateVelocity,
    onCameraPreset: applyCameraPreset,
    onTogglePause: handleTogglePause,
    onTimeScaleChange: handleTimeScaleChange
  });

  window.addEventListener('resize', onWindowResize);
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const rawDt = Math.min(clock.getDelta(), 0.1);
  const effectiveDt = simState.isPaused ? 0 : rawDt * simState.timeScale;

  if (effectiveDt > 0) {
    updatePhysics(simState.celestialObjects, effectiveDt);
    checkCollisions(simState.celestialObjects, scene, {
      onObjectRemoved: removeObjectFromState,
      onObjectsMerged: () => refreshSelectedObjectControls()
    });
    simState.celestialObjects.forEach((object) => object.syncMesh());
  }

  updateBackgroundStars(backgroundStars, simState.isPaused ? 0 : effectiveDt);

  controls.update();
  renderer.render(scene, camera);
}

init();
