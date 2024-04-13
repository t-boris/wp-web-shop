(function ($) {
    $(document).ready(function () {

        class Star {
            constructor(x, y, size, speed, duration) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.speed = speed;
                this.duration = duration;
                this.targetX = canvas.width / 2;
                this.targetY = canvas.height / 2;
                this.startTime = performance.now();
                this.color = 'white'; // Initial color is white
                this.colorTransitionDuration = 1000; // Color transition duration in milliseconds (twice slower)
            }

            update(time) {
                const elapsed = time - this.startTime;
                const progress = Math.min(elapsed / this.duration, 1);

                this.x += (this.targetX - this.x) * this.speed;
                this.y += (this.targetY - this.y) * this.speed;

                this.size = this.size * (1 - progress * 0.5); // Size change is twice slower

                // Calculate the color based on the progress within the color transition duration
                const colorProgress = Math.min(elapsed / this.colorTransitionDuration, 1);
                const red = Math.round(255 * colorProgress);
                const green = Math.round(255 * (1 - colorProgress));
                const blue = Math.round(255 * (1 - colorProgress));
                this.color = `rgb(${red}, ${green}, ${blue})`;

                if (progress >= 1 || this.distanceToCenter() <= 100) {
                    return true;
                }

                return false;
            }

            render() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            distanceToCenter() {
                const dx = this.x - canvas.width / 2;
                const dy = this.y - canvas.height / 2;
                return Math.sqrt(dx * dx + dy * dy);
            }
        }

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('wave-canvas'), alpha: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // Clear color with alpha set to 0 for full transparency
        console.log('Renderer:', renderer);

        const canvas = document.getElementById('star-canvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return; // Stop further execution if canvas is not found
        }
        const ctx = canvas.getContext('2d');
        resizeCanvas();

        var numStrings = 6;
        var numPoints = 128;
        var strings = [];
        var originalPositions = []; // Store the original positions of the strings
        var verticalShift = 0; // Variable to control the vertical shift when music is enabled

        for (let s = 0; s < numStrings; s++) {
            var lineGeometry = new THREE.BufferGeometry();
            var positions = new Float32Array(numPoints * 3);
            for (let i = 0; i < numPoints; i++) {
                positions[i * 3] = (i / (numPoints - 1)) * window.innerWidth - window.innerWidth / 2;
                positions[i * 3 + 1] = (s - (numStrings - 1) / 2) * 40; // Increased vertical spacing between strings
                positions[i * 3 + 2] = 0;
            }
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            var thickness = (s + 1) * 1.5; // Increased thickness multiplier
            var lineMaterial = new THREE.LineBasicMaterial({color: 0x00ffff, linewidth: thickness});
            var line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
            strings.push(line);
            originalPositions.push(positions.slice()); // Store a copy of the original positions
        }
        console.log('Strings added to the scene:', strings);

        // Load the pickup OBJ file
        var loader = new THREE.OBJLoader();
        loader.load(
            themeDir + '/assets/objects/pickup-single-ring-dp0.obj',
            function (object) {
                console.log('OBJ file loaded:', object);

                if (object.children.length > 0) {
                    console.log('Object children:', object.children);

                    var child = object.children[0];
                    if (child.geometry) {
                        console.log('Child geometry:', child.geometry);

                        if (!child.geometry.boundingBox) {
                            console.log('Computing bounding box...');
                            child.geometry.computeBoundingBox();
                        }

                        console.log('Bounding box:', child.geometry.boundingBox);

                        // Scale the pickup to fit the screen and match the strings' height
                        var pickupHeight = numStrings * 40; // Adjust the scaling factor as needed
                        var size = new THREE.Vector3();
                        child.geometry.boundingBox.getSize(size);
                        var size = new THREE.Vector3();
                        child.geometry.boundingBox.getSize(size);
                        var scaleFactor = Math.min(window.innerWidth, window.innerHeight) / Math.max(size.x, size.y) * 0.275;
                        object.scale.set(scaleFactor, scaleFactor, scaleFactor);

                        // Position the pickup behind the strings and move it up by 50px
                        object.position.set(0, -26, -150);

                        // Rotate the pickup to view it from the top
                        object.rotation.x = Math.PI  / 2;
                        object.rotation.y = Math.PI / 2;


                        // Create materials
                        var stainlessSteelMaterial = new THREE.MeshStandardMaterial({
                            color: 0xC0C0C0,
                            metalness: 0.7,
                            roughness: 0.2
                        });

                        var polishedBrassMaterial = new THREE.MeshStandardMaterial({
                            color: 0xB5A642,
                            metalness: 0.8,
                            roughness: 0.1
                        });

                        // Traverse the object's children and assign materials based on their names
                        object.traverse(function (child) {
                            if (child.isMesh) {
                                if (child.name === 'Lower_Lid' || child.name === 'Upper_Case' || child.name === 'Magnet_Wire' || child.name === 'Lower_Case') {
                                    child.material = stainlessSteelMaterial;
                                } else if (child.name === 'Upper_Decor_Panel') {
                                    child.material = polishedBrassMaterial;
                                }
                            }
                        });

                        // Add directional light to the pickup
                        const pointLight = new THREE.PointLight(0xffffff, 1, 250);
                        pointLight.position.set(0, 0, 200);
                        scene.add(pointLight);

                        var areaLight = new THREE.RectAreaLight(0xffffff, 2, 1600, 1600);
                        areaLight.position.set(0, 0, 500); // Position the light above the text
                        scene.add(areaLight);

                        scene.add(object);
                        console.log('Pickup added to the scene');
                    } else {
                        console.warn('Missing geometry:', child);
                    }
                } else {
                    console.warn('No children found in the loaded object');
                }
            },
            function (xhr) {
                console.log('OBJ loading progress:', (xhr.loaded / xhr.total) * 100 + '%');
            },
            function (error) {
                console.error('Error loading OBJ file:', error);
            }
        );

        // Add ambient light to the scene
        const ambientLight = new THREE.AmbientLight(0xA2D5F2, 1);
        scene.add(ambientLight);

        const stars = [];
        const maxStars = 500;

        function createStar() {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 9 + 1;
            const speed = Math.random() * 0.005 + 0.001;
            const color = 'lightblue';
            const duration = 10000;

            if (Math.sqrt(Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2)) > 100) {
                stars.push(new Star(x, y, size, speed, duration));
            }
        }

        function animateStars(time) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];

                const expired = star.update(time);

                if (expired) {
                    stars.splice(i, 1);
                    i--;
                } else {
                    star.render();
                }
            }

            while (stars.length < maxStars) {
                createStar();
            }

            requestAnimationFrame(animateStars);
        }

        animateStars(performance.now());

        // Change camera to orthographic projection
        var aspect = window.innerWidth / window.innerHeight;
        var frustumSize = 1000;
        camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            0.1,
            1000
        );
        camera.position.set(0, 0, 500);
        camera.lookAt(0, 0, 0);

        window.addEventListener('resize', function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            resizeCanvas();
        });

        console.log('Camera position:', camera.position);
        console.log('Camera target:', camera.getWorldDirection(new THREE.Vector3()));

        var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var audioUrl = document.getElementById('wave-container').getAttribute('data-audio-url');
        var backgroundMusic = new Audio(audioUrl);
        backgroundMusic.loop = true;
        var audioSource = audioContext.createMediaElementSource(backgroundMusic);
        var analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        var dataArray = new Uint8Array(analyser.frequencyBinCount);

        var toggleSound = document.getElementById('toggle-sound');
        toggleSound.addEventListener('click', function () {
            if (backgroundMusic.paused) {
                audioContext.resume().then(function () {
                    backgroundMusic.play();
                    toggleSound.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    verticalShift = 0; // Add height to the strings when music is enabled
                });
            } else {
                backgroundMusic.pause();
                toggleSound.innerHTML = '<i class="fas fa-volume-up"></i>';
                verticalShift = 0; // Reset the vertical shift when music is disabled
            }
        });

        function animateLine() {
            requestAnimationFrame(animateLine);
            analyser.getByteFrequencyData(dataArray);
            var frequencyRange = analyser.frequencyBinCount / numStrings;
            for (let s = 0; s < numStrings; s++) {
                let positionAttribute = strings[s].geometry.attributes.position;
                var startFrequency = Math.floor(s * frequencyRange);
                var endFrequency = Math.floor((s + 1) * frequencyRange);
                var averageFrequency = 0;
                for (let f = startFrequency; f < endFrequency; f++) {
                    averageFrequency += dataArray[f];
                }
                averageFrequency /= (endFrequency - startFrequency);
                var verticalOffset = (averageFrequency - 128) * 0.2; // Calculate the vertical offset based on frequency
                for (let i = 0; i < numPoints; i++) {
                    positionAttribute.array[i * 3 + 1] = originalPositions[s][i * 3 + 1] + verticalOffset + verticalShift;
                }
                positionAttribute.needsUpdate = true;
            }
            renderer.render(scene, camera);
        }

        animateLine();

        var phraseTexts = phrases;
        console.log('Phrases:', phraseTexts);

        var currentIndex = 0;
        var fontLoader = new THREE.FontLoader();

        fontLoader.load(themeDir + '/assets/fonts/helvetiker_bold.typeface.json', function (font) {
            var currentTextMesh = null;  // Store the current text mesh

            function displayNextPhrase() {
                if (currentTextMesh) {
                    fadeOutTextMesh(currentTextMesh, 1000); // Fade out the current text mesh
                    currentTextMesh = null; // Ensure it's nullified after fade out
                } else {
                    // If there is no current text mesh to fade out, just proceed to create a new one
                    loadAndDisplayText();
                }
            }
            let spotLight = new THREE.SpotLight(0xA2D5F2, 1, 0, Math.PI / 4, 0.1); // Create a spotlight
            scene.add(spotLight);

            function loadAndDisplayText() {
                createText(phraseTexts[currentIndex], 60, function(textMesh) {
                    currentTextMesh = textMesh;
                    scene.add(currentTextMesh);
                    currentTextMesh.position.x = -currentTextMesh.geometry.boundingBox.max.x / 2;
                    currentTextMesh.position.y = 300;

                    // Position the spotlight to highlight the current phrase
                    spotLight.position.set(
                        currentTextMesh.position.x + 100,
                        currentTextMesh.position.y + 50,
                        currentTextMesh.position.z + 500,
                    );
                    spotLight.target.position.copy(currentTextMesh.position);

                    currentIndex = (currentIndex + 1) % phraseTexts.length;
                    // Set a timeout to fade out the current text after displaying it for 5 seconds
                    setTimeout(() => {
                        fadeOutTextMesh(currentTextMesh, 1000);
                    }, 5000);
                });
            }
            function fadeOutTextMesh(textMesh, duration) {
                const start = performance.now();
                const end = start + duration;

                function animateFadeOut(now) {
                    if (now < end) {
                        const opacity = 1 - ((now - start) / duration);
                        textMesh.material.opacity = opacity;
                        requestAnimationFrame(animateFadeOut);
                    } else {
                        textMesh.material.opacity = 0;
                        scene.remove(textMesh); // Remove the text mesh from the scene
                        // scene.remove(spotLight); // Remove the spotlight from the scene
                        textMesh.geometry.dispose(); // Clean up geometry
                        textMesh.material.dispose(); // Clean up material
                        displayNextPhrase(); // Schedule the next phrase
                    }
                }

                requestAnimationFrame(animateFadeOut);
            }

            // Modify createText to accept font size parameter
            function createText(text, size, onTextCreated) {
                var loader = new THREE.FontLoader();
                loader.load(themeDir + '/assets/fonts/helvetiker_bold.typeface.json', function (font) {
                    var textGeometry = new THREE.TextGeometry(text, {
                        font: font,
                        size: size,
                        height: 5,
                        curveSegments: 12,
                        bevelEnabled: true,
                        bevelThickness: 2,
                        bevelSize: 2,
                        bevelOffset: 0,
                        bevelSegments: 5
                    });
                    textGeometry.computeBoundingBox();  // Compute the bounding box to center the text
                    var textMaterial = new THREE.MeshStandardMaterial({
                        color: 0xA2D5F2,
                        metalness: 0.9,
                        roughness: 0.1,
                        transparent: true,
                        opacity: 1
                    });
                    var textMesh = new THREE.Mesh(textGeometry, textMaterial);
                    onTextCreated(textMesh);
                }, undefined, function(error) {
                    console.error('Failed to load the font:', error);
                });
            }

            var areaLight = new THREE.RectAreaLight(0xffffff, 1, 1600, 1600);
            areaLight.position.set(0, 600, 500); // Position the light above the text
            scene.add(areaLight);


            displayNextPhrase();
        });

        camera.position.z = 500;

        function animate_text() {
            requestAnimationFrame(animate_text);
            renderer.render(scene, camera);
        }

        animate_text();

        // Variables to store the mouse position and rotation angles
        var mouseX = 0;
        var mouseY = 0;
        var rotationX = 0;
        var rotationY = 0;

        // Event listener for mouse movement
        document.addEventListener('mousemove', function (event) {
            mouseX = event.clientX - window.innerWidth / 2;
            mouseY = event.clientY - window.innerHeight / 2;
        });

        // Animation loop
        function animate_3d() {
            requestAnimationFrame(animate_3d);

            // Calculate rotation angles based on mouse position
            rotationX = (mouseY / window.innerHeight) * Math.PI / 6; // +/- 30 degrees
            rotationY = (mouseX / window.innerWidth) * Math.PI / 6; // +/- 30 degrees

            // Apply rotation to the scene
            scene.rotation.x = rotationX;
            scene.rotation.y = rotationY;

            // Render the scene
            renderer.render(scene, camera);
        }

        // Start the animation loop
        animate_3d();
    });
})(jQuery);