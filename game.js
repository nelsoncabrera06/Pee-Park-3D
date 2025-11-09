// GLTFLoader is loaded from CDN in index.html

// Game state
let scene, camera, renderer, dog, trees = [], score = 0, timeLeft = 30;
let gameActive = false; // Start as false until user clicks play
const keys = {};
const treePositions = new Set();
let selectedDog = null; // Store selected dog name
let gameStarted = false; // Track if game has been initialized
let cameraRotationOffset = 0; // Camera rotation offset for specific dog models
let cameraAngle = 0; // Orbital camera angle controlled by right stick
let cameraDistance = 7; // Distance from camera to dog (controlled by right stick Y)

// Gamepad state
let gamepad = null;
let gamepadIndex = null;

// Debug helpers
let debugAxes = null;
let debugHeightMarkers = [];
let debugMode = false; // Debug mode is off by default

// Initialize Three.js scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x98D8C8, 20, 100);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Create ground (park)
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3a9d23 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add some dirt paths
    for (let i = 0; i < 5; i++) {
        const pathGeometry = new THREE.PlaneGeometry(3, 40);
        const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const path = new THREE.Mesh(pathGeometry, pathMaterial);
        path.rotation.x = -Math.PI / 2;
        path.position.set(Math.random() * 40 - 20, 0.01, Math.random() * 40 - 20);
        path.receiveShadow = true;
        scene.add(path);
    }

    // Create dog
    createDog();

    // Create trees
    createTrees();

    // Create debug axes and height markers
    createDebugHelpers();

    // Event listeners
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;

        // Toggle debug mode with Shift+M
        if (e.shiftKey && e.key.toLowerCase() === 'm') {
            toggleDebugMode();
        }
    });
    window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
    window.addEventListener('resize', onWindowResize);

    // Gamepad event listeners
    window.addEventListener('gamepadconnected', (e) => {
        console.log('Gamepad connected:', e.gamepad.id);
        gamepad = e.gamepad;
        gamepadIndex = e.gamepad.index;
    });
    window.addEventListener('gamepaddisconnected', (e) => {
        console.log('Gamepad disconnected');
        if (e.gamepad.index === gamepadIndex) {
            gamepad = null;
            gamepadIndex = null;
        }
    });

    // Note: animate() and startTimer() are now called after the dog model loads in createDog()
}

// Create dog character (original version - backup)
function createDog_original_cuadrado() {
    const dogGroup = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
    const dogMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
    const body = new THREE.Mesh(bodyGeometry, dogMaterial);
    body.position.y = 1;
    body.castShadow = true;
    dogGroup.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const head = new THREE.Mesh(headGeometry, dogMaterial);
    head.position.set(0.9, 1.2, 0);
    head.castShadow = true;
    dogGroup.add(head);

    // Snout
    const snoutGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.4);
    const snout = new THREE.Mesh(snoutGeometry, new THREE.MeshLambertMaterial({ color: 0xA0522D }));
    snout.position.set(1.3, 1.1, 0);
    snout.castShadow = true;
    dogGroup.add(snout);

    // Ears
    const earGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.2);
    const leftEar = new THREE.Mesh(earGeometry, dogMaterial);
    leftEar.position.set(0.8, 1.7, -0.4);
    leftEar.castShadow = true;
    dogGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, dogMaterial);
    rightEar.position.set(0.8, 1.7, 0.4);
    rightEar.castShadow = true;
    dogGroup.add(rightEar);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(1.2, 1.3, -0.25);
    dogGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(1.2, 1.3, 0.25);
    dogGroup.add(rightEye);

    // Tail
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.8);
    const tail = new THREE.Mesh(tailGeometry, dogMaterial);
    tail.position.set(-0.9, 1.2, 0);
    tail.rotation.z = Math.PI / 4;
    tail.castShadow = true;
    dogGroup.add(tail);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8);
    const legs = [
        { x: 0.5, z: 0.4 },
        { x: 0.5, z: -0.4 },
        { x: -0.5, z: 0.4 },
        { x: -0.5, z: -0.4 }
    ];

    legs.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, dogMaterial);
        leg.position.set(pos.x, 0.4, pos.z);
        leg.castShadow = true;
        dogGroup.add(leg);
    });

    dogGroup.position.set(0, 0, 0);
    //dogGroup.rotation.y = Math.PI / 2;
    dog = dogGroup;
    scene.add(dog);
}

// Create dog character (new 3D model version)
function createDog() {
    const loader = new THREE.GLTFLoader();
    const dogPath = `dogs-3D-models/${selectedDog}/scene.gltf`;

    loader.load(dogPath, function(gltf) {
        dog = gltf.scene;

        // Enable shadows for all meshes in the model
        dog.traverse(function(node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        // Position and scale adjustments
        // Different heights for different dogs
        let heightY = 0.8; // Default height
        if (selectedDog === 'dog_big') {
            heightY = 1.15; // Height for dog_big
        } else if (selectedDog === 'dog_puppy') {
            heightY = 0.044; // 0.544 - 0.5 = 0.044
        } else if (selectedDog === 'dog_white') {
            heightY = 0.8; // Adjust as needed
        } else if (selectedDog === 'little_cartoon_dog') {
            heightY = 0.8; // Adjust as needed
        }

        dog.position.set(0, heightY, 0);

        // Different scales for different dogs
        let scale = 0.8; // Default scale
        if (selectedDog === 'dog_white') {
            scale = 0.96; // 20% bigger (0.8 * 1.2 = 0.96)
        } else if (selectedDog === 'dog_big') {
            scale = 0.68; // 15% smaller (0.8 * 0.85 = 0.68)
        }
        dog.scale.set(scale, scale, scale);

        // Rotate dog to face forward (aligned with camera)
        // Default rotation: 0 means dog faces +Z (forward)
        // Each model may have different initial orientations in their GLTF files
        let rotation = 0; // Default for most dogs

        // Model-specific rotations
        if (selectedDog === 'dog_big') {
            // dog_big model has different initial orientation in GLTF
            rotation = Math.PI / 2; // 90 degrees - dog_big faces +Z with this rotation
            cameraRotationOffset = -Math.PI / 2; // Camera needs -90 degree offset to compensate
        } else if (selectedDog === 'dog_puppy') {
            rotation = 0; // Puppy faces +Z --> perfect
            cameraRotationOffset = 0; // No offset needed
        } else if (selectedDog === 'dog_white') {
            rotation = 0; // White dog faces +Z --> perfect
            cameraRotationOffset = 0; // No offset needed
        } else if (selectedDog === 'little_cartoon_dog') {
            rotation = 0; // Cartoon dog faces +Z --> perfect
            cameraRotationOffset = 0; // No offset needed
        }

        dog.rotation.y = rotation;

        scene.add(dog);

        // Start the game loop and timer after the dog is loaded
        animate();
        startTimer();
    },
    function(xhr) {
        // Progress callback (optional)
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function(error) {
        console.error('Error loading dog model:', error);
        // Fallback to original dog if loading fails
        createDog_original_cuadrado();
        animate();
        startTimer();
    });
}

// Create debug helpers (axes and height markers)
function createDebugHelpers() {
    // Create axes helper at origin (will move with dog)
    debugAxes = new THREE.Group();

    // X axis (Red) - horizontal
    const xGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 8);
    const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const xAxis = new THREE.Mesh(xGeometry, xMaterial);
    xAxis.rotation.z = Math.PI / 2;
    xAxis.position.x = 2.5;
    debugAxes.add(xAxis);

    // Add arrow tip for X
    const xConeGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
    const xCone = new THREE.Mesh(xConeGeometry, xMaterial);
    xCone.rotation.z = -Math.PI / 2;
    xCone.position.x = 5;
    debugAxes.add(xCone);

    // Add "X" label
    createTextSprite('X', 0xff0000, 5.5, 0.3, 0);

    // Z axis (Blue) - horizontal perpendicular
    const zGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 8);
    const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const zAxis = new THREE.Mesh(zGeometry, zMaterial);
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.z = 2.5;
    debugAxes.add(zAxis);

    // Add arrow tip for Z
    const zConeGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
    const zCone = new THREE.Mesh(zConeGeometry, zMaterial);
    zCone.rotation.x = Math.PI / 2; // Fixed rotation to point towards +Z
    zCone.position.z = 5;
    debugAxes.add(zCone);

    // Add "Z" label
    createTextSprite('Z', 0x0000ff, 0, 0.3, 5.5);

    // Y axis (Green) - vertical
    const yGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 8);
    const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const yAxis = new THREE.Mesh(yGeometry, yMaterial);
    yAxis.position.y = 2.5;
    debugAxes.add(yAxis);

    // Add arrow tip for Y
    const yConeGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
    const yCone = new THREE.Mesh(yConeGeometry, yMaterial);
    yCone.position.y = 5;
    debugAxes.add(yCone);

    // Add "Y" label
    createTextSprite('Y', 0x00ff00, 0, 5.5, 0);

    debugAxes.position.set(0, 0, 0);
    debugAxes.visible = debugMode; // Start hidden
    scene.add(debugAxes);

    // Create height markers (every 1 unit on Y axis)
    for (let i = 0; i <= 5; i++) {
        const height = i * 1.0;
        const markerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.7
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(0, height, 0);
        debugHeightMarkers.push(marker);
        debugAxes.add(marker);

        // Add number labels for heights 1 and 2
        if (i === 1 || i === 2) {
            createTextSprite(i.toString(), 0xffff00, 0.3, height, 0);
        }
    }
}

// Toggle debug mode visibility
function toggleDebugMode() {
    debugMode = !debugMode;
    if (debugAxes) {
        debugAxes.visible = debugMode;
    }

    // Toggle debug info panel
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        debugInfo.style.display = debugMode ? 'block' : 'none';
    }

    console.log(`Debug mode: ${debugMode ? 'ON' : 'OFF'}`);
}

// Update debug info panel
function updateDebugInfo() {
    if (!debugMode || !dog || !camera) return;

    const debugInfo = document.getElementById('debugInfo');
    if (!debugInfo) return;

    // Get dog name in proper format
    const dogNames = {
        'dog_big': 'Big Dog',
        'dog_puppy': 'Puppy',
        'dog_white': 'White Dog',
        'little_cartoon_dog': 'Cartoon Dog'
    };

    const dogName = dogNames[selectedDog] || selectedDog;

    debugInfo.textContent = `DEBUG MODE
Dog: ${dogName}
Dog Position:
  X: ${dog.position.x.toFixed(2)}
  Y: ${dog.position.y.toFixed(2)}
  Z: ${dog.position.z.toFixed(2)}

Camera Position:
  X: ${camera.position.x.toFixed(2)}
  Y: ${camera.position.y.toFixed(2)}
  Z: ${camera.position.z.toFixed(2)}`;
}

// Helper function to create text sprites for labels
function createTextSprite(text, color, x, y, z) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 128;

    // Draw text
    context.font = 'Bold 80px Arial';
    context.fillStyle = '#' + color.toString(16).padStart(6, '0');
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 64, 64);

    // Create texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    // Create sprite
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, y, z);
    sprite.scale.set(0.5, 0.5, 1);

    debugAxes.add(sprite);
}

// Create trees
function createTrees() {
    for (let i = 0; i < 15; i++) {
        let x, z;
        let validPosition = false;

        // Find a position not too close to origin or other trees
        while (!validPosition) {
            x = Math.random() * 60 - 30;
            z = Math.random() * 60 - 30;
            const distFromOrigin = Math.sqrt(x * x + z * z);

            if (distFromOrigin > 5) {
                validPosition = true;
                // Check distance from other trees
                for (let pos of treePositions) {
                    const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(z - pos.z, 2));
                    if (dist < 8) {
                        validPosition = false;
                        break;
                    }
                }
            }
        }

        const tree = createTree();
        tree.position.set(x, 0, z);
        tree.userData = { x, z, peed: false };
        treePositions.add({ x, z });
        trees.push(tree);
        scene.add(tree);
    }
}

// Create individual tree
function createTree() {
    const treeGroup = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.5, 4);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Leaves (3 spheres)
    const leafGeometry = new THREE.SphereGeometry(1.5, 8, 8);
    const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });

    for (let i = 0; i < 3; i++) {
        const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
        leaves.position.y = 4 + i * 0.8;
        leaves.scale.set(1 - i * 0.15, 1 - i * 0.15, 1 - i * 0.15);
        leaves.castShadow = true;
        treeGroup.add(leaves);
    }

    return treeGroup;
}

// Poll gamepad state
function pollGamepad() {
    if (gamepadIndex !== null) {
        // Need to call getGamepads() every frame to get updated state
        const gamepads = navigator.getGamepads();
        gamepad = gamepads[gamepadIndex];
    }
    return gamepad;
}

// Get gamepad input with deadzone
function getGamepadAxis(axisIndex, deadzone = 0.15) {
    const gp = pollGamepad();
    if (!gp || !gp.axes[axisIndex]) return 0;

    const value = gp.axes[axisIndex];
    // Apply deadzone to avoid drift
    return Math.abs(value) > deadzone ? value : 0;
}

// Check if gamepad button is pressed
function isGamepadButtonPressed(buttonIndex) {
    const gp = pollGamepad();
    if (!gp || !gp.buttons[buttonIndex]) return false;

    return gp.buttons[buttonIndex].pressed;
}

// Update dog movement
function updateDog() {
    if (!gameActive) return;

    const moveSpeed = 0.15;
    const rotationSpeed = 0.05;
    let moved = false;

    // Calculate effective rotation once (applies camera offset for models like dog_big)
    const effectiveRotation = dog.rotation.y + cameraRotationOffset;

    // Read gamepad inputs
    const leftStickX = getGamepadAxis(0); // Left stick horizontal (dog rotation)
    const leftStickY = getGamepadAxis(1); // Left stick vertical (forward/back)
    const rightStickX = getGamepadAxis(2); // Right stick horizontal (camera orbit)
    const rightStickY = getGamepadAxis(3); // Right stick vertical (camera zoom)

    // Movement - forward/backward (keyboard W/S or left stick Y)
    if (keys['w'] || keys['arrowup'] || leftStickY < 0) {
        const speed = leftStickY < 0 ? moveSpeed * Math.abs(leftStickY) : moveSpeed;
        dog.position.x += Math.sin(effectiveRotation) * speed;
        dog.position.z += Math.cos(effectiveRotation) * speed;
        moved = true;
    }
    if (keys['s'] || keys['arrowdown'] || leftStickY > 0) {
        const speed = leftStickY > 0 ? moveSpeed * Math.abs(leftStickY) : moveSpeed;
        dog.position.x -= Math.sin(effectiveRotation) * speed;
        dog.position.z -= Math.cos(effectiveRotation) * speed;
        moved = true;
    }

    // Dog rotation - left/right (keyboard A/D or left stick X)
    if (keys['a'] || keys['arrowleft'] || leftStickX < 0) {
        const speed = leftStickX < 0 ? rotationSpeed * Math.abs(leftStickX) : rotationSpeed;
        dog.rotation.y += speed;
    }
    if (keys['d'] || keys['arrowright'] || leftStickX > 0) {
        const speed = leftStickX > 0 ? rotationSpeed * Math.abs(leftStickX) : rotationSpeed;
        dog.rotation.y -= speed;
    }

    // Camera orbit - controlled by right stick X
    const cameraRotationSpeed = 0.03;
    if (rightStickX !== 0) {
        cameraAngle -= rightStickX * cameraRotationSpeed;
    }

    // Camera zoom - controlled by right stick Y (up = closer, down = farther)
    const cameraZoomSpeed = 0.2;
    if (rightStickY !== 0) {
        cameraDistance += rightStickY * cameraZoomSpeed;
        // Clamp distance between 5 and 25 units
        cameraDistance = Math.max(5, Math.min(25, cameraDistance));
    }

    // Reset camera - R3 button (right stick click)
    if (isGamepadButtonPressed(11)) { // Button 11 is R3 on most gamepads
        cameraAngle = 0;
        cameraDistance = 7;
    }

    // Boundary limits
    dog.position.x = Math.max(-45, Math.min(45, dog.position.x));
    dog.position.z = Math.max(-45, Math.min(45, dog.position.z));

    // Check if near tree
    checkNearTree();

    // Pee action (keyboard Space or gamepad button A/Cross)
    if (keys[' '] || isGamepadButtonPressed(0)) {
        const nearTree = getNearestTree();
        if (nearTree && !nearTree.userData.peed) {
            const dist = Math.sqrt(
                Math.pow(dog.position.x - nearTree.userData.x, 2) +
                Math.pow(dog.position.z - nearTree.userData.z, 2)
            );
            if (dist < 3) {
                peeOnTree(nearTree);
            }
        }
    }

    // Update camera to follow dog (positioned behind dog with orbital angle and zoom)
    const totalCameraRotation = effectiveRotation + cameraAngle;
    camera.position.x = dog.position.x - Math.sin(totalCameraRotation) * cameraDistance;
    camera.position.z = dog.position.z - Math.cos(totalCameraRotation) * cameraDistance;

    // Camera height varies with distance (closer = lower, farther = higher)
    // At distance 7 (default), height is 5
    // At distance 5 (closest), height is ~3.57
    // At distance 25 (farthest), height is ~17.86
    camera.position.y = (cameraDistance / 7) * 5;

    camera.lookAt(dog.position);

    // Update debug axes to follow dog (X and Z centered on dog, Y stays at ground level)
    if (debugAxes) {
        debugAxes.position.x = dog.position.x;
        debugAxes.position.z = dog.position.z;
        debugAxes.position.y = 0; // Always at ground level
    }

    // Update debug info panel
    updateDebugInfo();
}

// Check if dog is near a tree
function checkNearTree() {
    const nearTree = getNearestTree();
    const peeIndicator = document.getElementById('peeIndicator');

    if (nearTree && !nearTree.userData.peed) {
        const dist = Math.sqrt(
            Math.pow(dog.position.x - nearTree.userData.x, 2) +
            Math.pow(dog.position.z - nearTree.userData.z, 2)
        );
        if (dist < 3) {
            peeIndicator.style.display = 'block';
            return;
        }
    }
    peeIndicator.style.display = 'none';
}

// Get nearest tree
function getNearestTree() {
    let nearest = null;
    let minDist = Infinity;

    trees.forEach(tree => {
        const dist = Math.sqrt(
            Math.pow(dog.position.x - tree.userData.x, 2) +
            Math.pow(dog.position.z - tree.userData.z, 2)
        );
        if (dist < minDist) {
            minDist = dist;
            nearest = tree;
        }
    });

    return nearest;
}

// Pee on tree
function peeOnTree(tree) {
    if (tree.userData.peed) return;

    tree.userData.peed = true;
    score += 10;
    updateScore();

    // Visual feedback - make tree slightly yellow
    tree.children.forEach(child => {
        if (child.geometry.type === 'CylinderGeometry') {
            child.material.color.setHex(0xA0873D);
        }
    });

    // Add yellow puddle
    const puddleGeometry = new THREE.CircleGeometry(0.5, 16);
    const puddleMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFFF00,
        transparent: true,
        opacity: 0.6
    });
    const puddle = new THREE.Mesh(puddleGeometry, puddleMaterial);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(tree.userData.x, 0.02, tree.userData.z);
    scene.add(puddle);

    // Hide indicator
    document.getElementById('peeIndicator').style.display = 'none';
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = `Puntos: ${score}`;
}

// Start timer
function startTimer() {
    const timerInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(timerInterval);
            return;
        }

        timeLeft--;
        document.getElementById('timer').textContent = `Tiempo: ${timeLeft}s`;

        if (timeLeft <= 0) {
            endGame();
            clearInterval(timerInterval);
        }
    }, 1000);
}

// End game
function endGame() {
    gameActive = false;
    document.getElementById('finalScore').textContent = `Puntos: ${score}`;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updateDog();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Dog selection menu logic
document.addEventListener('DOMContentLoaded', function() {
    const dogOptions = document.querySelectorAll('.dog-option');
    const startButton = document.getElementById('startButton');
    const dogMenu = document.getElementById('dogSelectionMenu');

    // Handle dog selection
    dogOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            dogOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            this.classList.add('selected');
            // Store selected dog
            selectedDog = this.getAttribute('data-dog');
            // Enable start button
            startButton.disabled = false;
            startButton.textContent = '¡Jugar!';
        });
    });

    // Handle start button click
    startButton.addEventListener('click', startGame);

    // Handle Enter key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && selectedDog && !gameStarted) {
            startGame();
        }
    });
});

// Start the game
function startGame() {
    if (!selectedDog || gameStarted) return;

    gameStarted = true;
    gameActive = true;

    // Hide menu
    document.getElementById('dogSelectionMenu').style.display = 'none';

    // Show game UI
    document.getElementById('ui').style.display = 'block';
    document.getElementById('instructions').style.display = 'block';

    // Initialize and start the game
    init();
}
