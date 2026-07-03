/**
 * Primary Core Game Loop Application System Driver Initialization Manifest
 */
class GameEngine {
    constructor() {
        this.score = 0;
        this.combo = 1.0;
        this.comboTimer = 0;
        this.highScore = localStorage.getItem('neon_high_score') || 0;
        this.gameSpeed = 130; // Milliseconds per core logic tick
        this.isRunning = false;
        this.isPaused = false;
        
        this.ui = new UIController();
        this.initThreeJS();
        
        this.particles = new ParticleSystem(this.scene);
        this.food = new FoodSystem(this.scene);
        this.snake = new SnakeSystem(this.scene);
        
        this.initInputSystems();
        this.bindUIActions();
        
        $('#highscore-val').text(String(this.highScore).padStart(4, '0'));
        this.ui.showScreen(this.ui.mainMenu);
        
        this.clock = new THREE.Clock();
        this.tickTimer = 0;
        this.animate();
    }

    initThreeJS() {
        this.canvas = document.getElementById('webgl-canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x030308);
        this.scene.fog = new THREE.FogExp2(0x030308, 0.045);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 14, 12);
        this.camera.lookAt(0, 0, 0);

        // Grid Matrix Environmental Lighting Rig Architecture
        let ambientLight = new THREE.AmbientLight(0x0b0d19, 1.5);
        this.scene.add(ambientLight);

        let dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 20, 7);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Build grid neon layout lines safely
        let gridHelper = new THREE.GridHelper(20, 20, 0x00f3ff, 0x1e293b);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }

    initInputSystems() {
        $(window).on('keydown', (e) => {
            if (!this.isRunning || this.isPaused) return;
            AudioController.init();
            switch(e.which) {
                case 37: case 65: this.snake.setDirection(-1, 0); break; // Left / A
                case 38: case 87: this.snake.setDirection(0, -1); break; // Up / W
                case 39: case 68: this.snake.setDirection(1, 0); break;  // Right / D
                case 40: case 83: this.snake.setDirection(0, 1); break;  // Down / S
            }
        });

        // Smart Adaptive Mobile Touch Swipe Handling Core
        let tsX, tsY;
        $(window).on('touchstart', (e) => {
            tsX = e.touches[0].clientX;
            tsY = e.touches[0].clientY;
        });
        $(window).on('touchend', (e) => {
            if (!tsX || !tsY) return;
            let tdX = e.changedTouches[0].clientX - tsX;
            let tdY = e.changedTouches[0].clientY - tsY;
            if (Math.abs(tdX) > Math.abs(tdY)) {
                if (Math.abs(tdX) > 30) this.snake.setDirection(tdX > 0 ? 1 : -1, 0);
            } else {
                if (Math.abs(tdY) > 30) this.snake.setDirection(0, tdY > 0 ? 1 : -1);
            }
        });
    }

    bindUIActions() {
        $('.btn-diff').on('click', function() {
            $('.btn-diff').removeClass('active');
            $(this).addClass('active');
        });

        $('#btn-start').on('click', () => {
            AudioController.init();
            this.gameSpeed = parseInt($('.btn-diff.active').data('speed'));
            this.snake.stepDuration = this.gameSpeed / 1000;
            this.startGame();
        });

        $('#btn-pause').on('click', () => this.togglePause());
        $('#btn-resume').on('click', () => this.togglePause());
        $('#btn-restart').on('click', () => this.startGame());
        $('#btn-quit').on('click', () => location.reload());

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    startGame() {
        this.score = 0;
        this.combo = 1.0;
        this.ui.updateScore(this.score, this.combo);
        this.snake.reset();
        this.food.randomizePosition(this.snake.segments);
        this.isRunning = true;
        this.isPaused = false;
        this.ui.hideAllScreens();
    }

    togglePause() {
        if (!this.isRunning) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) this.ui.showScreen(this.ui.pauseMenu);
        else this.ui.hideAllScreens();
    }

    gameOver() {
        this.isRunning = false;
        AudioController.playExplode();
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('neon_high_score', this.highScore);
            $('#highscore-val').text(String(this.highScore).padStart(4, '0'));
        }
        $('#final-score').text(this.score);
        $('#final-combo').text(`x${this.combo.toFixed(1)}`);
        this.ui.showScreen(this.ui.gameOverMenu);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        let dt = this.clock.getDelta();

        if (this.isRunning && !this.isPaused) {
            this.tickTimer += dt * 1000;
            if (this.tickTimer >= this.gameSpeed) {
                this.tickTimer = 0;
                
                // Process Next Simulation Step Matrix Calculation
                let head = this.snake.segments[0];
                let isEating = (head.x + this.snake.direction.x === this.food.position.x && 
                                head.z + this.snake.direction.z === this.food.position.z);

                if (isEating) {
                    this.score += Math.round(10 * this.combo);
                    this.combo = Math.min(5.0, this.combo + 0.2);
                    this.comboTimer = 3.0; // Reset active frame dynamic lifecycle tracking window duration
                    AudioController.playEat();
                    this.particles.spawnExplosion(this.food.mesh.position, this.food.material.color.getHex());
                    this.food.randomizePosition(this.snake.segments);
                }

                if (!this.snake.step(isEating)) {
                    this.gameOver();
                }
            }

            // Decay combo multiplier over time frame updates dynamically
            if (this.comboTimer > 0) {
                this.comboTimer -= dt;
                if (this.comboTimer <= 0) {
                    this.combo = 1.0;
                    this.ui.updateScore(this.score, this.combo);
                }
            }
        }

        // System Animation Updates
        this.food.animate();
        this.particles.update(dt);

        // Smoothly interpolate camera rig coordinates to follow snake head tracking vector
        if (this.snake.meshes[0]) {
            let targetCamPos = new THREE.Vector3(
                this.snake.meshes[0].position.x,
                14,
                this.snake.meshes[0].position.z + 11
            );
            this.camera.position.lerp(targetCamPos, 0.05);
            this.camera.lookAt(this.snake.meshes[0].position);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Global System Instance Execution Launch Entry
$(document).ready(() => {
    new GameEngine();
});