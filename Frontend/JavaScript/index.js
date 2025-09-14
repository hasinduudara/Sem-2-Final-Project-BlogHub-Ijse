let scene, camera, renderer, particles, particleMesh;
let mouseX = 0,
  mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// Initialize the 3D scene
function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 10;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("webgl-canvas"),
    alpha: true, // Allow transparency
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Particles
  const particleCount = 1000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  // Changed particle colors to shades of gray/white for black & white theme
  const color1 = new THREE.Color(0xffffff); // White
  const color2 = new THREE.Color(0xcccccc); // Light Gray
  const color3 = new THREE.Color(0x999999); // Medium Gray

  for (let i = 0; i < particleCount; i++) {
    // Position particles randomly in a sphere
    const r = 5 + Math.random() * 5; // Radius
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1); // Random distribution on sphere
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Assign random colors
    const randColor = Math.random();
    if (randColor < 0.33) {
      color1.toArray(colors, i * 3);
    } else if (randColor < 0.66) {
      color2.toArray(colors, i * 3);
    } else {
      color3.toArray(colors, i * 3);
    }
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  particleMesh = new THREE.Points(geometry, material);
  scene.add(particleMesh);

  // Lines connecting nearby particles (representing a "hub")
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x888888, // Grayish lines for black & white theme
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
  });
  const lineGeometry = new THREE.BufferGeometry();
  const maxConnections = 20; // Max lines to draw
  const maxPointsPerLine = 2; // Each line has 2 points
  const linePositions = new Float32Array(
    particleCount * maxConnections * maxPointsPerLine * 3
  );
  let lineIndex = 0;

  const tempVertex = new THREE.Vector3();
  const distances = [];

  for (let i = 0; i < particleCount; i++) {
    tempVertex.fromArray(positions, i * 3);
    distances.length = 0; // Clear distances for current particle

    for (let j = 0; j < particleCount; j++) {
      if (i === j) continue;
      const otherVertex = new THREE.Vector3().fromArray(positions, j * 3);
      const dist = tempVertex.distanceTo(otherVertex);
      if (dist < 2) {
        // Connect particles within a certain distance
        distances.push({ dist: dist, index: j });
      }
    }

    distances.sort((a, b) => a.dist - b.dist);

    for (let k = 0; k < Math.min(distances.length, 3); k++) {
      // Connect to up to 3 closest particles
      const targetIndex = distances[k].index;

      linePositions[lineIndex * 6] = positions[i * 3];
      linePositions[lineIndex * 6 + 1] = positions[i * 3 + 1];
      linePositions[lineIndex * 6 + 2] = positions[i * 3 + 2];

      linePositions[lineIndex * 6 + 3] = positions[targetIndex * 3];
      linePositions[lineIndex * 6 + 4] = positions[targetIndex * 3 + 1];
      linePositions[lineIndex * 6 + 5] = positions[targetIndex * 3 + 2];
      lineIndex++;
    }
  }

  lineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions.slice(0, lineIndex * 6), 3)
  );
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // Event Listeners
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onDocumentMouseMove, false);
  document.addEventListener("touchstart", onDocumentTouchStart, false);
  document.addEventListener("touchmove", onDocumentTouchMove, false);
}

// Handle window resize
function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse movement for camera
function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 0.005;
  mouseY = (event.clientY - windowHalfY) * 0.005;
}

// Handle touch start for camera
function onDocumentTouchStart(event) {
  if (event.touches.length === 1) {
    mouseX = (event.touches[0].pageX - windowHalfX) * 0.005;
    mouseY = (event.touches[0].pageY - windowHalfY) * 0.005;
  }
}

// Handle touch move for camera
function onDocumentTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = (event.touches[0].pageX - windowHalfX) * 0.005;
    mouseY = (event.touches[0].pageY - windowHalfY) * 0.005;
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate particles slowly
  particleMesh.rotation.x += 0.0005;
  particleMesh.rotation.y += 0.001;

  // Move camera slightly based on mouse/touch
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

// Start the animation on window load.
window.onload = function () {
  init();
  animate();
};
