<!DOCTYPE html>
<html>
<head>
    <style>
        #animation-container {
            width: 100%;
            height: 100vh;
            background-color: #f0f0f0; /* Temporary background color for debugging */
            border: 1px solid #000; /* Temporary border for debugging */
        }
        #info {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: rgba(255, 255, 255, 0.8);
            padding: 10px;
            display: none;
        }
    </style>
</head>
<body>
<div id="animation-container"></div>
<div id="info"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.7.1/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/RGBELoader.js"></script>

<script>
    let isRotating = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };

    const createScene = () => {
        const scene = new THREE.Scene();
        const loader = new THREE.TextureLoader();

        loader.load(
            '<?php echo get_template_directory_uri(); ?>/assets/images/background.png',
            (texture) => {
                scene.background = texture;
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded'); // optional: show progress
            },
            (error) => {
                console.error('An error occurred:', error); // optional: show an error if something goes wrong
            }
        );

        // createStarField(scene); // Add star field to the scene

        return scene;
    };

    // const createScene = () => {
    //     const scene = new THREE.Scene();
    //     scene.background = new THREE.Color(0x000000); // Set background color to black
    //     createStarField(scene); // Add star field to the scene
    //     return scene;
    // }

    const createCamera = () => new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const createRenderer = () => {
        const renderer = new THREE.WebGLRenderer();
        return renderer;
    }

    const setupContainer = (renderer) => {
        const container = document.getElementById('animation-container');
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
        return container;
    }

    const scaleObject = (object, scale) => object.scale.set(scale, scale, scale);

    const addLights = (object, scene) => {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        // directionalLight.position.set(1, 1, 1);
        // scene.add(directionalLight);

        const spotLight = new THREE.SpotLight(0xffffff, 2);
        spotLight.position.set(0, 10, 0);
        spotLight.target = object;
        spotLight.angle = Math.PI / 8;
        spotLight.penumbra = 0.9;
        spotLight.decay = 2;
        spotLight.distance = 40;
        scene.add(spotLight);
        scene.add(spotLight.target);
    }

    const setupCamera = (camera, object) => {
        camera.position.set(3, 5, 5);
        camera.lookAt(object.position);
        camera.position.z = 5;
    }

    const animate = (renderer, scene, camera) => {
        requestAnimationFrame(() => animate(renderer, scene, camera));
        renderer.render(scene, camera);
    }

    const createStarField = (scene) => {
        const starCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const dispersion = 10;

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            let x, y, z;

            do {
                x = Math.random() * 600 - 300;
                y = Math.random() * 600 - 300;
                z = Math.random() * 600 - 300;
            } while (Math.abs(x - positions[i3-3]) < dispersion && Math.abs(y - positions[i3-2]) < dispersion && Math.abs(z - positions[i3-1]) < dispersion)

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            sizeAttenuation: true
        });

        const starField = new THREE.Points(geometry, material);
        scene.add(starField);
    }

    const createStainlessSteelMaterial = () => {
        return new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            roughness: 0.3,
            metalness: 0.7
        });
    }

    const createPolishedAluminumMaterial = () => {
        return new THREE.MeshStandardMaterial({
            color: 0x89CFF0,
            roughness: 0.1,
            metalness: 0.9
        });
    }

    const createPolishedBrassMaterial = () => {
        return new THREE.MeshStandardMaterial({
            color: 0xB5A642,
            roughness: 0.1,
            metalness: 0.8
        });
    }

    const applyMaterial = (object, name, material) => {
        object.traverse((child) => {
            console.log('Child:', child.name)
            if (child instanceof THREE.Mesh && child.name === name) {
                console.log('Applying material to', name);
                child.material = material;
            }
        });
    }

    const onSuccess = function (object) {
        const scene = createScene();
        const camera = createCamera();
        const renderer = createRenderer();

        // Apply material to the object
        const ssMaterial = createStainlessSteelMaterial();
        const paMaterial = createPolishedAluminumMaterial();
        const pbMaterial = createPolishedBrassMaterial();
        applyMaterial(object, 'Lower_Lid', ssMaterial);
        applyMaterial(object, 'Lower_Case', ssMaterial);
        applyMaterial(object, 'Upper_Case', ssMaterial);
        applyMaterial(object, 'Magnet_Wire', ssMaterial);
        applyMaterial(object, 'Upper_Decor_Panel', paMaterial);
        applyMaterial(object, 'Logo', pbMaterial);

        setupContainer(renderer);
        scaleObject(object, 2);
        addLights(object, scene);
        setupCamera(camera, object);
        scene.add(object); // Add the loaded object to the scene
        renderer.setClearColor(0xf0f0f0);



        animate(renderer, scene, camera); // Start the animation loop

        const container = setupContainer(renderer);
        container.addEventListener('mousedown', onMouseDown);
        container.addEventListener('mouseup', onMouseUp);
        container.addEventListener('mousemove', (event) => onMouseMove(event, object));

    }

    const onProgress = function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }

    const onError = function (error) {
        console.error('An error happened while loading the OBJ file:', error);
    }

    const rotateObject = (event, object) => {
        if (!isRotating) return;

        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                0,
                toRadians(deltaMove.x * 0.5),
                0,
                // toRadians(deltaMove.y * 0.5),
                // toRadians(deltaMove.x * 0.5),
                // 0,
                'XYZ'
            ));

        object.quaternion.multiplyQuaternions(deltaRotationQuaternion, object.quaternion);

        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    const toRadians = (angle) => angle * (Math.PI / 180);

    const onMouseDown = (event) => {
        isRotating = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    const onMouseUp = () => {
        isRotating = false;
    }

    const onMouseMove = (event, object) => {
        if (!isRotating) return;
        rotateObject(event, object);
    }

    const loader = new THREE.OBJLoader();
    loader.load('<?php echo get_template_directory_uri(); ?>/assets/objects/pickup.obj', onSuccess, onProgress, onError);
</script>
