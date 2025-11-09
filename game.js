// GLTFLoader is loaded from CDN in index.html

// Game state
let scene, camera, renderer, dog, trees = [], score = 0, timeLeft = 30;
let gameActive = true;
const keys = {};
const treePositions = new Set();

// Initialize Three.js scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x98D8C8, 20, 100);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 12);
    //camera.position.set(20, 80, -12); // probando otras posiciones
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

    // Event listeners
    window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
    window.addEventListener('resize', onWindowResize);

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

    loader.load('little_cartoon_dog/scene.gltf', function(gltf) {
        dog = gltf.scene;

        // Enable shadows for all meshes in the model
        dog.traverse(function(node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        // Position and scale adjustments
        dog.position.set(0, 0.8, 0); // Y=0.8 to lift the dog above ground
        dog.scale.set(0.8, 0.8, 0.8); // Adjust scale if needed

        // No rotation needed - model naturally faces +X, camera will be positioned in +X
        dog.rotation.y = 0;

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

// Update dog movement
function updateDog() {
    if (!gameActive) return;

    const moveSpeed = 0.15;
    const rotationSpeed = 0.05;
    let moved = false;

    // Movement (adjusted for dog facing +X axis)
    if (keys['w'] || keys['arrowup']) {
        dog.position.x += Math.sin(dog.rotation.y) * moveSpeed;
        dog.position.z += Math.cos(dog.rotation.y) * moveSpeed;
        moved = true;
    }
    if (keys['s'] || keys['arrowdown']) {
        dog.position.x -= Math.sin(dog.rotation.y) * moveSpeed;
        dog.position.z -= Math.cos(dog.rotation.y) * moveSpeed;
        moved = true;
    }
    if (keys['a'] || keys['arrowleft']) {
        dog.rotation.y += rotationSpeed;
    }
    if (keys['d'] || keys['arrowright']) {
        dog.rotation.y -= rotationSpeed;
    }

    // Boundary limits
    dog.position.x = Math.max(-45, Math.min(45, dog.position.x));
    dog.position.z = Math.max(-45, Math.min(45, dog.position.z));

    // Check if near tree
    checkNearTree();

    // Pee action
    if (keys[' ']) {
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

    // Update camera to follow dog (positioned behind dog in +X direction)
    camera.position.x = dog.position.x - Math.sin(dog.rotation.y) * 12;
    camera.position.z = dog.position.z - Math.cos(dog.rotation.y) * 12;
    camera.position.y = 8;
    camera.lookAt(dog.position);
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

// Start game
init();
