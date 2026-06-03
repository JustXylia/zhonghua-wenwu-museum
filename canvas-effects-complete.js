// 推广板块 - 灯笼飘动粒子效果（续）
class PromotionLanternEffect {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.lanterns = [];
        this.petals = [];
        this.init();
    }

    init() {
        resizeCanvas(this.canvas);
        this.createLanterns();
        this.createPetals();
        this.bindEvents();
        this.animate();
    }

    createLanterns() {
        const { width, height } = this.canvas;
        this.lanterns = [];

        for (let i = 0; i < 8; i++) {
            this.lanterns.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.5,
                size: Math.random() * 20 + 15,
                swingPhase: Math.random() * Math.PI * 2,
                swingSpeed: Math.random() * 0.5 + 0.3,
                color: Math.random() > 0.5 ? '#c9a962' : '#c44',
                glowIntensity: Math.random() * 0.5 + 0.5
            });
        }
    }

    createPetals() {
        const { width, height } = this.canvas;
        this.petals = [];

        for (let i = 0; i < 50; i++) {
            this.petals.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 4 + 2,
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 0.5 + 0.2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                color: Math.random() > 0.7 ? '#c9a962' : '#d4a5a5'
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            resizeCanvas(this.canvas);
            this.createLanterns();
            this.createPetals();
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!isInViewport(this.canvas)) return;

        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);

        const time = Date.now() * 0.001;

        this.drawLanterns(time);
        this.drawPetals(time);
    }

    drawLanterns(time) {
        for (const lantern of this.lanterns) {
            const swing = Math.sin(time * lantern.swingSpeed + lantern.swingPhase) * 15;
            const x = lantern.x + swing;
            const y = lantern.y + Math.sin(time * 0.5 + lantern.swingPhase) * 5;

            // 绘制灯笼光晕
            const glowRadius = lantern.size * 3;
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
            gradient.addColorStop(0, lantern.color + Math.floor(lantern.glowIntensity * 40).toString(16).padStart(2, '0'));
            gradient.addColorStop(0.5, lantern.color + '20');
            gradient.addColorStop(1, lantern.color + '00');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
            this.ctx.fill();

            // 绘制灯笼主体
            this.ctx.fillStyle = lantern.color;
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, lantern.size * 0.8, lantern.size, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // 绘制灯笼顶部和底部
            this.ctx.fillStyle = '#8b4513';
            this.ctx.fillRect(x - lantern.size * 0.3, y - lantern.size - 3, lantern.size * 0.6, 6);
            this.ctx.fillRect(x - lantern.size * 0.3, y + lantern.size - 3, lantern.size * 0.6, 6);
        }
    }

    drawPetals(time) {
        const { width, height } = this.canvas;

        for (const petal of this.petals) {
            petal.x += petal.speedX + Math.sin(time + petal.y * 0.01) * 0.5;
            petal.y += petal.speedY;
            petal.rotation += petal.rotationSpeed;

            if (petal.y > height + 20) {
                petal.y = -20;
                petal.x = Math.random() * width;
            }
            if (petal.x < -20) petal.x = width + 20;
            if (petal.x > width + 20) petal.x = -20;

            this.ctx.save();
            this.ctx.translate(petal.x, petal.y);
            this.ctx.rotate(petal.rotation);
            this.ctx.fillStyle = petal.color;
            this.ctx.globalAlpha = 0.6;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
}

// ============================================
// 初始化所有Canvas效果
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 首页穿越效果
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
        new HeroTransitionEffect('hero-canvas');
    }

    // 器之灵粒子效果
    const vesselsCanvas = document.getElementById('vessels-canvas');
    if (vesselsCanvas) {
        new VesselParticleEffect('vessels-canvas');
    }

    // 石之韵石屑剥落效果
    const stoneCanvas = document.getElementById('stone-canvas');
    if (stoneCanvas) {
        new StonePeelEffect('stone-canvas');
    }

    // 史之痕光影卷轴效果
    const historyCanvas = document.getElementById('history-canvas');
    if (historyCanvas) {
        new HistoryScrollEffect('history-canvas');
    }

    // 文物修复科技效果
    const restorationCanvas = document.getElementById('restoration-canvas');
    if (restorationCanvas) {
        new RestorationTechEffect('restoration-canvas');
    }

    // 推广灯笼效果
    const promotionCanvas = document.getElementById('promotion-canvas');
    if (promotionCanvas) {
        new PromotionLanternEffect('promotion-canvas');
    }

    // 导航栏滚动效果
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
