//Based on the Anime.js example

window.human = false;

var canvasEl = document.querySelector('.fireworks');
var ctx = canvasEl.getContext('2d');
var numberOfParticules = 50;
var pointerX = 0;
var pointerY = 0;
var tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
var colors = ['#370617', '#6A040F', '#9D0208', '#D00000', '#DC2F02', '#E85D04', '#F48C06', '#FAA307', '#FFBA08'];

function setCanvasSize() {
    canvasEl.width = window.innerWidth * 1;
    canvasEl.height = window.innerHeight * 1;
    canvasEl.style.width = window.innerWidth + 'px';
    canvasEl.style.height = window.innerHeight + 'px';
}

function updateCoords(e) {
    pointerX = e.clientX || e.touches[0].clientX;
    pointerY = e.clientY || e.touches[0].clientY;
}

function setParticuleDirection(p) {
    var angle = anime.random(0, 360) * Math.PI / 180;
    var value = anime.random(25, 300);
    var radius = [-1, 1][anime.random(0, 1)] * value;
    return {
        x: p.x + radius * Math.cos(angle),
        y: p.y + radius * Math.sin(angle)
    }
}

function createParticule(x, y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = colors[anime.random(0, colors.length - 1)];
    p.radius = anime.random(16, 32);
    p.endPos = setParticuleDirection(p);
    p.draw = function () {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
        ctx.fillStyle = p.color;
        ctx.fill();
    }
    return p;
}

function createCircle(x, y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = '#FFF';
    p.radius = 0.1;
    p.alpha = .5;
    p.lineWidth = 6;
    p.draw = function () {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
        ctx.lineWidth = p.lineWidth;
        ctx.strokeStyle = p.color;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    return p;
}

function createRocket(x, y) {
    var p = {};
    p.width = 2;
    p.height = 6;
    p.x = x - p.width / 2;
    p.y = window.innerHeight + 10;
    p.color = '#F1FAEE';
    p.endx = x;
    p.endy = y;
    p.alpha = 1;
    p.draw = function () {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.rect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    return p;
}

function renderParticule(anim) {
    for (var i = 0; i < anim.animatables.length; i++) {
        anim.animatables[i].target.draw();
    }
}

function animateParticules(x, y) {
    var circle = createCircle(x, y);
    var particules = [];
    var rocket = createRocket(x, y);
    var rocketLife = anime.random(800, 1200);
    var rocketDelay = rocketLife;
    for (var i = 0; i < numberOfParticules; i++) {
        particules.push(createParticule(x, y));
    }
    anime.timeline().add({
        targets: rocket,
        x: function (p) {
            return p.endx;
        },
        y: function (p) {
            return p.endy;
        },
        easing: 'cubicBezier(0.05, 0.30, 0.75, 1.025)',
        alpha: {
            value: 0,
            easing: 'linear',
            duration: rocketLife,
        },
        update: renderParticule,
        duration: rocketLife,
    });
    anime.timeline().add({
        targets: particules,
        x: function (p) {
            return p.endPos.x;
        },
        y: function (p) {
            return p.endPos.y;
        },
        radius: 0.1,
        duration: anime.random(1200, 1800),
        easing: 'easeOutExpo',
        update: renderParticule
    }, rocketDelay)
    anime.timeline().add({
        targets: circle,
        radius: anime.random(80, 160),
        lineWidth: 0,
        alpha: {
            value: 0,
            easing: 'linear',
            duration: anime.random(600, 800),
        },
        duration: anime.random(1200, 1800),
        easing: 'easeOutExpo',
        update: renderParticule,
        offset: 0,
    }, rocketDelay);
}

var render = anime({
    duration: Infinity,
    update: function () {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
});

document.addEventListener(tap, function (e) {
    window.human = true;
    render.play();
    updateCoords(e);
    animateParticules(pointerX, pointerY);
}, false);


function autoClick() {
    if (window.human) return;
    animateParticules(
        anime.random(window.innerWidth / 2 - window.innerWidth / 3, window.innerWidth / 2 + window.innerWidth / 3),
        anime.random(window.innerHeight / 2 - window.innerHeight / 3, window.innerHeight / 2 + window.innerHeight / 6)
    );
    anime({
        duration: anime.random(100, 600)
    }).finished.then(autoClick);
}

autoClick();
setCanvasSize();
window.addEventListener('resize', setCanvasSize, false);