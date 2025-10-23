let simState;
let dom = {};
let callbacks = {};
let updateObjectSelectImpl = () => {};
let refreshSelectedObjectControlsImpl = () => {};
let updateSimulationStatusImpl = () => {};
let updateTimeScaleDisplayImpl = () => {};

function cacheDomReferences() {
  dom = {
    createStarBtn: document.getElementById('create-star-btn'),
    starXInput: document.getElementById('star-x'),
    starYInput: document.getElementById('star-y'),
    starZInput: document.getElementById('star-z'),
    starMassInput: document.getElementById('star-mass'),
    objectSelect: document.getElementById('object-select'),
    selectedObjectControls: document.getElementById('selected-object-controls'),
    selectedObjectName: document.getElementById('selected-object-name'),
    objectMassInput: document.getElementById('object-mass'),
    updateMassBtn: document.getElementById('update-mass-btn'),
    objectVelocityXInput: document.getElementById('object-velocity-x'),
    objectVelocityYInput: document.getElementById('object-velocity-y'),
    objectVelocityZInput: document.getElementById('object-velocity-z'),
    updateVelocityBtn: document.getElementById('update-velocity-btn'),
    numPlanetsInput: document.getElementById('num-planets'),
    planetMassInput: document.getElementById('planet-mass'),
    planetOrbitRadiusInput: document.getElementById('planet-orbit-radius'),
    addPlanetsBtn: document.getElementById('add-planets-btn'),
    viewTopBtn: document.getElementById('view-top-btn'),
    viewSideBtn: document.getElementById('view-side-btn'),
    viewAngledBtn: document.getElementById('view-angled-btn'),
    simulationStatus: document.getElementById('simulation-status'),
    togglePauseBtn: document.getElementById('toggle-pause-btn'),
    timeScaleInput: document.getElementById('time-scale'),
    timeScaleValue: document.getElementById('time-scale-value')
  };
}

function setupCreateStarListener() {
  dom.createStarBtn.addEventListener('click', () => {
    const mass = Math.max(parseFloat(dom.starMassInput.value) || 0, 0.1);
    const position = {
      x: parseFloat(dom.starXInput.value) || 0,
      y: parseFloat(dom.starYInput.value) || 0,
      z: parseFloat(dom.starZInput.value) || 0
    };

    callbacks.onCreateStar?.({ mass, position });
  });
}

function setupAddPlanetsListener() {
  dom.addPlanetsBtn.addEventListener('click', () => {
    if (!simState.selectedObject || simState.selectedObject.type !== 'star') {
      window.alert('Selecione uma estrela para adicionar planetas.');
      return;
    }

    const count = Math.max(parseInt(dom.numPlanetsInput.value, 10) || 0, 1);
    const planetMass = Math.max(parseFloat(dom.planetMassInput.value) || 0, 0.1);
    const orbitRadius = Math.max(parseFloat(dom.planetOrbitRadiusInput.value) || 0, 5);

    callbacks.onAddPlanets?.({ count, planetMass, orbitRadius });
  });
}

function setupSelectionListener() {
  dom.objectSelect.addEventListener('change', (event) => {
    const selectedId = Number.parseInt(event.target.value, 10);
    callbacks.onSelectObject?.(Number.isNaN(selectedId) ? null : selectedId);
  });
}

function setupMassListener() {
  dom.updateMassBtn.addEventListener('click', () => {
    if (!simState.selectedObject) {
      return;
    }
    const newMass = Math.max(parseFloat(dom.objectMassInput.value) || 0, 0.1);
    callbacks.onUpdateMass?.(newMass);
  });
}

function setupVelocityListener() {
  dom.updateVelocityBtn.addEventListener('click', () => {
    if (!simState.selectedObject) {
      return;
    }

    const velocity = {
      x: parseFloat(dom.objectVelocityXInput.value) || 0,
      y: parseFloat(dom.objectVelocityYInput.value) || 0,
      z: parseFloat(dom.objectVelocityZInput.value) || 0
    };

    callbacks.onUpdateVelocity?.(velocity);
  });
}

function setupCameraListeners() {
  dom.viewTopBtn.addEventListener('click', () => callbacks.onCameraPreset?.('top'));
  dom.viewSideBtn.addEventListener('click', () => callbacks.onCameraPreset?.('side'));
  dom.viewAngledBtn.addEventListener('click', () => callbacks.onCameraPreset?.('angled'));
}

function setupSimulationControls() {
  dom.togglePauseBtn.addEventListener('click', () => {
    callbacks.onTogglePause?.();
  });

  dom.timeScaleInput.addEventListener('input', (event) => {
    const value = Number.parseFloat(event.target.value);
    const clamped = Number.isFinite(value) ? Math.min(Math.max(value, 0.1), 5) : 1;
    callbacks.onTimeScaleChange?.(clamped);
  });
}

function buildUpdateObjectSelect() {
  updateObjectSelectImpl = (selectedId = simState.selectedObject?.id ?? null) => {
    const { objectSelect } = dom;
    const previousValue = objectSelect.value;
    objectSelect.innerHTML = '<option value="">-- Selecione --</option>';

    simState.celestialObjects.forEach((object) => {
      const option = document.createElement('option');
      option.value = object.id;
      option.textContent = `${object.name} (${object.type})`;
      objectSelect.appendChild(option);
    });

    const finalValue = selectedId ?? previousValue;
    if (finalValue) {
      objectSelect.value = String(finalValue);
    }
  };
}

function buildRefreshSelectedControls() {
  refreshSelectedObjectControlsImpl = () => {
    const { selectedObject } = simState;

    if (!selectedObject) {
      dom.selectedObjectControls.style.display = 'none';
      dom.selectedObjectName.textContent = '';
      dom.objectMassInput.value = '';
      dom.objectVelocityXInput.value = '';
      dom.objectVelocityYInput.value = '';
      dom.objectVelocityZInput.value = '';
      dom.objectSelect.value = '';
      return;
    }

    dom.selectedObjectControls.style.display = 'block';
    dom.selectedObjectName.textContent = selectedObject.name;
    dom.objectMassInput.value = selectedObject.mass.toFixed(2);
    dom.objectVelocityXInput.value = selectedObject.velocity.x.toFixed(2);
    dom.objectVelocityYInput.value = selectedObject.velocity.y.toFixed(2);
    dom.objectVelocityZInput.value = selectedObject.velocity.z.toFixed(2);
    dom.objectSelect.value = String(selectedObject.id);
  };
}

function buildSimulationStatusUpdaters() {
  updateSimulationStatusImpl = (isPaused = false) => {
    dom.simulationStatus.textContent = isPaused ? 'Pausada' : 'Em execução';
    dom.togglePauseBtn.textContent = isPaused ? 'Retomar' : 'Pausar';
  };

  updateTimeScaleDisplayImpl = (timeScale = 1) => {
    dom.timeScaleValue.textContent = `${timeScale.toFixed(1)}x`;
    dom.timeScaleInput.value = timeScale;
  };
}

export function setupUIEventListeners(options) {
  simState = options.simState;
  callbacks = {
    onCreateStar: options.onCreateStar,
    onAddPlanets: options.onAddPlanets,
    onSelectObject: options.onSelectObject,
    onUpdateMass: options.onUpdateMass,
    onUpdateVelocity: options.onUpdateVelocity,
    onCameraPreset: options.onCameraPreset,
    onTogglePause: options.onTogglePause,
    onTimeScaleChange: options.onTimeScaleChange
  };

  cacheDomReferences();
  buildUpdateObjectSelect();
  buildRefreshSelectedControls();
  buildSimulationStatusUpdaters();
  setupCreateStarListener();
  setupAddPlanetsListener();
  setupSelectionListener();
  setupMassListener();
  setupVelocityListener();
  setupCameraListeners();
  setupSimulationControls();

  updateObjectSelectImpl();
  refreshSelectedObjectControlsImpl();
  updateSimulationStatusImpl(simState.isPaused);
  updateTimeScaleDisplayImpl(simState.timeScale);
}

export function updateObjectSelect(selectedId) {
  updateObjectSelectImpl(selectedId);
}

export function refreshSelectedObjectControls() {
  refreshSelectedObjectControlsImpl();
}

export function updateSimulationStatus(isPaused) {
  updateSimulationStatusImpl(isPaused);
}

export function updateTimeScaleDisplay(timeScale) {
  updateTimeScaleDisplayImpl(timeScale);
}
