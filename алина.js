const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const intro = document.getElementById('intro');
const canvas = document.getElementById('canvas');
const msg = document.getElementById('msg');

let yesScale = 1;
let noScale = 1;
let heartActive = false; 

// Логика кнопки НЕТ
noBtn.addEventListener('click', () => {
    yesScale += 0.4;
    noScale -= 0.1;
    
    yesBtn.style.transform = `scale(${yesScale})`;
    noBtn.style.transform = `scale(${noScale})`;
    
    if (noScale < 0.6) {
        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 200;
        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;
    }
});

// Логика кнопки ДА
yesBtn.addEventListener('click', () => {
    intro.style.opacity = '0';
    setTimeout(() => {
        intro.style.display = 'none';
        canvas.style.opacity = '1';
        msg.style.opacity = '1';
        heartActive = true; 
        startHeartAnimation();
    }, 1000);
});

// --- ДВИЖОК СЕРДЦА ---
const ctx = canvas.getContext('2d');
let width, height, particles = [];
let heartPoints = [];
let mouse = { x: -1000, y: -1000, active: false };

const heartSprite = document.createElement('canvas');
heartSprite.width = 20; heartSprite.height = 20;
const sCtx = heartSprite.getContext('2d');
sCtx.fillStyle = '#ff3366';
sCtx.beginPath();
sCtx.moveTo(10, 6);
sCtx.bezierCurveTo(10, -3, 20, -3, 20, 6);
sCtx.bezierCurveTo(20, 13, 10, 18, 10, 20);
sCtx.bezierCurveTo(10, 18, 0, 13, 0, 6);
sCtx.bezierCurveTo(0, -3, 10, -3, 10, 6);
sCtx.fill();

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    calculateHeart();
    if (heartActive) {
        particles.forEach((p, i) => {
            const target = heartPoints[i % heartPoints.length];
            p.dest = { x: target.x + width / 2, y: target.y + height / 2.3 };
        });
    }
}

function calculateHeart() {
    heartPoints = [];
    const isMobile = width < 600;
    const scale = isMobile ? 11 : 16;
    for (let t = 0; t < Math.PI * 2; t += 0.04) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        heartPoints.push({ x: x * scale, y: y * scale });
    }
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.dest = { x: this.x, y: this.y };
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.friction = 0.94;
        this.size = Math.random() * 12 + 6;
        this.rotation = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.ease = 0.02 + Math.random() * 0.02;
    }
    update() {
        let dx = this.dest.x - this.x;
        let dy = this.dest.y - this.y;
        this.vx += dx * this.ease; 
        this.vy += dy * this.ease;
        this.vx *= this.friction; 
        this.vy *= this.friction;
        this.x += this.vx; 
        this.y += this.vy;

        if (mouse.active) {
            let mdx = this.x - mouse.x; 
            let mdy = this.y - mouse.y;
            let dist = Math.sqrt(mdx*mdx + mdy*mdy);
            if (dist < 80) { 
                this.vx += mdx * 0.1; 
                this.vy += mdy * 0.1; 
            }
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(heartSprite, -this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

function startHeartAnimation() {
    particles = [];
    for (let i = 0; i < 550; i++) particles.push(new Particle());
    particles.forEach((p, i) => {
        const target = heartPoints[i % heartPoints.length];
        p.dest = { x: target.x + width / 2, y: target.y + height / 2.3 };
    });
    render();
}

function explodeHeart() {
    if (!heartActive) return;
    particles.forEach(p => {
        p.vx = (Math.random() - 0.5) * 60;
        p.vy = (Math.random() - 0.5) * 60;
    });
}

function render() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
    ctx.fillRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(render);
}

window.addEventListener('mousedown', (e) => { 
    mouse.active = true; 
    if (heartActive) explodeHeart(); 
});
window.addEventListener('mouseup', () => mouse.active = false);
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('touchstart', (e) => { 
    mouse.active = true; 
    mouse.x = e.touches[0].clientX; 
    mouse.y = e.touches[0].clientY; 
    if (heartActive) explodeHeart(); 
});
window.addEventListener('touchend', () => mouse.active = false);
window.addEventListener('touchmove', (e) => {
     mouse.x = e.touches[0].clientX; 
     mouse.y = e.touches[0].clientY; 
});
window.addEventListener('resize', resize);

resize();