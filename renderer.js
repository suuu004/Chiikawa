const stage = document.querySelector('#stage');
const pet = document.querySelector('#pet');
const bubble = document.querySelector('#bubble');
const rabbitResource = document.querySelector('#rabbit-resource');

let x = 8;
let y = 0;
let direction = 1;
let pausedUntil = 0;
let lastTime = 0;
let lastBoundsReport = 0;
let bubbleTimer;
let pointerStart;
let pointerOffset = { x: 0, y: 0 };
let movedDuringPress = false;
const speed = 75; // CSS pixels per second
const dragThreshold = 5;
const gifDurationMs = 3000;
let gifSequence = [];
let gifIndex = 0;
let gifTimer;

function syncRabbitResource() {
  pet.classList.toggle('has-resource', rabbitResource.complete && rabbitResource.naturalWidth > 0);
}

rabbitResource.addEventListener('load', () => {
  syncRabbitResource();
  clearTimeout(gifTimer);
  if (gifSequence.length > 1) {
    gifTimer = setTimeout(() => {
      gifIndex = (gifIndex + 1) % gifSequence.length;
      rabbitResource.src = `./assets/${gifSequence[gifIndex]}`;
    }, gifDurationMs);
  }
});
rabbitResource.addEventListener('error', syncRabbitResource);

window.petApp.getGifSequence().then((files) => {
  gifSequence = files;
  if (gifSequence.length > 0) rabbitResource.src = `./assets/${gifSequence[0]}`;
  else syncRabbitResource();
}).catch(() => syncRabbitResource());

function reportPetBounds(time) {
  if (time - lastBoundsReport < 50) return;
  lastBoundsReport = time;
  const rect = pet.getBoundingClientRect();
  window.petApp.reportPetBounds({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
}

function animate(time) {
  if (lastTime && time >= pausedUntil && !pointerStart) {
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    const maxX = Math.max(0, stage.clientWidth - pet.offsetWidth);
    x += direction * speed * delta;
    if (x >= maxX) { x = maxX; direction = -1; }
    if (x <= 0) { x = 0; direction = 1; }
    pet.style.left = `${x}px`;
    pet.style.transform = `scaleX(${direction})`;
  }
  lastTime = time;
  reportPetBounds(time);
  requestAnimationFrame(animate);
}

function showBubble(message) {
  bubble.textContent = message;
  bubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 1300);
}

function greet() {
  pausedUntil = performance.now() + 900;
  pet.classList.remove('walking', 'dragging');
  pet.classList.add('idle');
  showBubble('ヤハ！');
  setTimeout(() => {
    pet.classList.remove('idle');
    pet.classList.add('walking');
  }, 900);
}

pet.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  pointerStart = { x: event.clientX, y: event.clientY };
  const rect = pet.getBoundingClientRect();
  pointerOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  movedDuringPress = false;
  pet.setPointerCapture(event.pointerId);
  pet.classList.remove('walking');
  pet.classList.add('idle', 'dragging');
  window.petApp.setDragging(true);
});

pet.addEventListener('pointermove', (event) => {
  if (!pointerStart) return;
  const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
  if (distance > dragThreshold) movedDuringPress = true;

  const maxX = Math.max(0, stage.clientWidth - pet.offsetWidth);
  const maxY = Math.max(0, stage.clientHeight - pet.offsetHeight);
  const nextX = Math.max(0, Math.min(maxX, event.clientX - pointerOffset.x));
  const nextY = Math.max(0, Math.min(maxY, event.clientY - pointerOffset.y));
  if (nextX !== x) direction = nextX > x ? 1 : -1;
  x = nextX;
  y = nextY;
  pet.style.left = `${x}px`;
  pet.style.top = `${y}px`;
  pet.style.transform = `scaleX(${direction})`;
});

function finishPointer(event) {
  if (!pointerStart) return;
  const shouldGreet = !movedDuringPress;
  pointerStart = null;
  pet.classList.remove('dragging');
  window.petApp.setDragging(false);
  if (shouldGreet) greet();
  else {
    pet.classList.remove('idle');
    pet.classList.add('walking');
  }
  if (pet.hasPointerCapture(event.pointerId)) pet.releasePointerCapture(event.pointerId);
}

pet.addEventListener('pointerup', finishPointer);
pet.addEventListener('pointercancel', finishPointer);
pet.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') greet();
});

// Start near the bottom edge. After dragging, the chosen vertical position is kept.
requestAnimationFrame(() => {
  y = Math.max(0, stage.clientHeight - pet.offsetHeight - 8);
  pet.style.top = `${y}px`;
  pet.classList.add('walking');
  requestAnimationFrame(animate);
});
