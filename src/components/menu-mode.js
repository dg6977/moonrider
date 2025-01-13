const COLORS = require('../constants/colors.js');

const iconPositions = {
  classicvr: -0.6,
  punchvr: 0.87,
  ride2d: 0.87,
  ridevr: 0.15,
  viewer2d: 0.15
};

const modeMap = {
  classicvr: 'classic',
  punchvr: 'punch',
  ride2d: 'ride',
  ridevr: 'ride',
  viewer2d: 'viewer'
};

AFRAME.registerComponent('menu-mode', {
  schema: {
    colorScheme: {default: 'default'},
    hasVR: {default: false}
  },

  init: function () {
    this.el.addEventListener('click', evt => {
      const item = evt.target.closest('[data-mode]');
      const mode = item.dataset.mode;
      const name = item.dataset.name;
      this.el.sceneEl.emit('gamemode', mode, false);
      if (this.data.hasVR) {
        localStorage.setItem('gameMode', name);
      }
      this.setModeOption(name);
      this.recenter()
    });

    this.el.addEventListener("recenter", evt => {
      this.recenter()
    });
  },

  update: function () {
    if (this.data.hasVR) {
      this.setModeOption(localStorage.getItem('gameMode') || 'punchvr');
      this.recenter()
      this.el.sceneEl.emit('gamemode', modeMap[localStorage.getItem('gameMode') || 'punchvr']);
    } else {
      this.setModeOption('ride2d');
      this.recenter()
    }
  },

  setModeOption: function (name) {
    const modeEls = this.el.querySelectorAll('.modeItem');
    document.getElementById('modeIcon').object3D.position.y = iconPositions[name];

    for (let i = 0; i < modeEls.length; i++) {
      const modeEl = modeEls[i];
      const selected = modeEl.dataset.name === name;

      modeEl.emit(selected ? 'select' : 'deselect', null, false);

      const background = modeEl.querySelector('.modeBackground');
      background.emit(selected ? 'select' : 'deselect', null, false);
      background.setAttribute(
        'mixin',
        'modeBackgroundSelect' + (selected ? '' : ' modeBackgroundHover'));

      const thumb = modeEl.querySelector('.modeThumb');
      thumb.emit(selected ? 'select' : 'deselect', null, false);

      const title = modeEl.querySelector('.modeTitle');
      title.setAttribute(
        'text', 'color',
        selected ? COLORS.WHITE : COLORS.schemes[this.data.colorScheme].secondary);

      const instructions = modeEl.querySelector('.modeInstructions');
      instructions.setAttribute(
        'text', 'color',
        selected ? COLORS.WHITE : COLORS.schemes[this.data.colorScheme].primary);
    }
    console.log("dongkun/menu clicked");
    this.el.addEventListener('thumbstickdown', this.recenter);
    this.el.addEventListener('trackpaddown', this.recenter);
    
    this.el.sceneEl.emit('pausegame', null, false);
    this.el.emit('pausegame', null, false);

    this.el.sceneEl.emit('recenter', null, false);
    this.el.emit('recenter', null, false);
  },

  recenter: function () {
    var euler = new THREE.Euler();
    var matrix = new THREE.Matrix4();
    var rotationMatrix = new THREE.Matrix4();
    var translationMatrix = new THREE.Matrix4();
    console.log("dongkun/recenter called")
    // return function () {
      const el = this.el;
      // this.el.sceneEl.emit('pausegame', null, false);
      // this.el.emit('pausegame', null, false);
      // if (!this.data.enabled) { return; }

      // console.log("recentered");

      const camera = el.sceneEl.camera.el.object3D;
      console.log("dongkun/camera pose/" + "x: " + camera.position.x + "y: "+ camera.position.y + "z: " + camera.position.z)

      // Reset matrix.
      matrix.identity();

      // Create matrix to reset Y rotation.
      euler.set(0, -1 * camera.rotation.y, 0);
      rotationMatrix.makeRotationFromEuler(euler);

      // Create matrix to zero position.
      translationMatrix.makeTranslation(-1 * camera.position.x, 0, -1 * camera.position.z);

      // camera.applyMatrix(0,0,0);

      // Multiply and decompose back to object3D.
      matrix.multiply(rotationMatrix).multiply(translationMatrix);
      matrix.decompose(el.object3D.position, el.object3D.quaternion, el.object3D.scale);
      el.object3D.updateMatrixWorld(true);
      // el.object3D.applyMatrix(matrix)

      el.emit('recentered', null, false);
    // };
  }
});
