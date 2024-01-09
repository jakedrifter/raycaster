const canvas = document.querySelector('#screen');
const ctx = canvas.getContext('2d');
canvas.width = 16 * 64;
canvas.height = 10 * 64;
let canvasScale = 1;
function scaleCanvas() {
  canvas.style.scale = Math.min((window.innerWidth / canvas.width) * canvasScale, (window.innerHeight / canvas.height) * canvasScale);
}
scaleCanvas();
window.onresize = scaleCanvas;

function toRadians(a) {
  return a * 0.017453292519943295;
}

let key = [];
let mouse = {
  vx: 0,
}
document.onkeydown = e => {
  key[e.keyCode] = true;
}
document.onkeyup = e => {
  key[e.keyCode] = false;
}
document.addEventListener("mousemove", (e) => {
  mouse.vx = e.movementX;
});
canvas.addEventListener("click", () => {
  canvas.requestPointerLock();
});

let camera = {
  posX: 1.5,
  posY: 1.5,
  angle: 0,
  dirX: 1,
  dirY: 0,
  tanDirX: 0,
  tanDirY: 0,
  fov: 60,
  width: 16 * 64,
  height: 10 * 64,
  lineScale: 4
};

let map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

var running = false;
let time = {
  last: 0,
  now: 0,
  delta: 0
}

function start() {
  running = true;
  time.last = Date.now();
  run();
}

function run() {
  requestAnimationFrame(run);
  if (running) {
    time.now = Date.now();
    time.delta = (time.now - time.last) / 1000;
    time.last = time.now;
    update();
  }
}

function update() {
  ctx.save();
  ctx.translate(canvas.width / 2 - camera.width / 2, canvas.height / 2 - camera.height / 2);
  ctx.clearRect(0, 0, camera.width, camera.height);
  ctx.fillStyle = 'skyblue';
  ctx.fillRect(0, 0, camera.width, camera.height / 2);
  ctx.fillStyle = 'darkgreen';
  ctx.fillRect(0, camera.height / 2, camera.width, camera.height / 2);
  for (let i = 0; i < camera.width / camera.lineScale; i++) {
    let rayAngle = (camera.angle - toRadians(camera.fov / 2)) + toRadians(i * (camera.fov / camera.width) * camera.lineScale);
    let rayDirX = Math.cos(rayAngle);
    let rayDirY = Math.sin(rayAngle);
    let mapX = Math.floor(camera.posX);
    let mapY = Math.floor(camera.posY);
    let sideDistX; let sideDistY;
    let deltaDistX = Math.abs(1 / rayDirX);
    let deltaDistY = Math.abs(1 / rayDirY);
    let perpWallDist;
    let stepX; let stepY;
    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (camera.posX - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - camera.posX) * deltaDistX;
    }
    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (camera.posY - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - camera.posY) * deltaDistY;
    }
    let hit = 0;
    while (!hit) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }
      if (map[mapY][mapX]) hit = map[mapY][mapX];
    }
    let fishEyeFix = Math.cos(camera.angle - rayAngle);
    if (!side) {
      perpWallDist = (sideDistX - deltaDistX) * fishEyeFix;
      ctx.fillStyle = '#ddd';
    } else {
      perpWallDist = (sideDistY - deltaDistY) * fishEyeFix;
      ctx.fillStyle = '#aaa';
    }
    let lineHeight = Math.round(camera.height / perpWallDist / 2) * 2;
    if (lineHeight > camera.height) lineHeight = camera.height;
    ctx.fillRect(i * camera.lineScale, (-lineHeight / 2) + (camera.height / 2), camera.lineScale, lineHeight);
  }
  ctx.restore();

  camera.angle += .06 * mouse.vx * time.delta;
  camera.dirX = Math.cos(camera.angle);
  camera.dirY = Math.sin(camera.angle);
  camera.tanDirX = Math.cos(camera.angle + toRadians(90));
  camera.tanDirY = Math.sin(camera.angle + toRadians(90));

  if (key[65] && !key[68]) {
    if (map[Math.floor(camera.posY)][Math.floor(camera.posX - (.3 * camera.tanDirX))] != 1) camera.posX -= .6*camera.tanDirX * time.delta;
    if (map[Math.floor(camera.posY - (.3 * camera.tanDirY))][Math.floor(camera.posX)] != 1) camera.posY -= .6*camera.tanDirY * time.delta;
  }
  if (key[68] && !key[65]) {
    if (map[Math.floor(camera.posY)][Math.floor(camera.posX + (.4 * camera.tanDirX))] != 1) camera.posX += .6*camera.tanDirX * time.delta;
    if (map[Math.floor(camera.posY + (.4 * camera.tanDirY))][Math.floor(camera.posX)] != 1) camera.posY += .6*camera.tanDirY * time.delta;
  }
  if (key[87] && !key[83]) {
    if (map[Math.floor(camera.posY)][Math.floor(camera.posX + (.3 * camera.dirX))] != 1) camera.posX += 1.2*camera.dirX * time.delta;
    if (map[Math.floor(camera.posY + (.3 * camera.dirY))][Math.floor(camera.posX)] != 1) camera.posY += 1.2*camera.dirY * time.delta;
  }
  if (key[83] && !key[87]) {
    if (map[Math.floor(camera.posY)][Math.floor(camera.posX - (.1 * camera.dirX))] != 1) camera.posX -= 1.2*camera.dirX * time.delta;
    if (map[Math.floor(camera.posY - (.1 * camera.dirY))][Math.floor(camera.posX)] != 1) camera.posY -= 1.2*camera.dirY * time.delta;
  }

  mouse.vx = 0;
}

start();