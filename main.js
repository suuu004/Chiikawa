const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('node:path');

let petWindow;
let petBounds = { x: 0, y: 0, width: 0, height: 0 };
let isIgnoringMouse = true;
let isDraggingPet = false;
let pointerTimer;

function updatePetBounds(_event, bounds) {
  if (!bounds || ![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite)) return;
  const windowBounds = petWindow.getBounds();
  petBounds = { ...bounds, x: bounds.x + windowBounds.x, y: bounds.y + windowBounds.y };
}

function setPetDragging(_event, dragging) {
  isDraggingPet = Boolean(dragging);
  if (petWindow && !petWindow.isDestroyed() && isDraggingPet) {
    isIgnoringMouse = false;
    petWindow.setIgnoreMouseEvents(false);
  }
}

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { x, y, width, height } = display.workArea;

  petWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    movable: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  petWindow.setAlwaysOnTop(true, 'floating');
  petWindow.setIgnoreMouseEvents(true, { forward: true });
  petWindow.loadFile(path.join(__dirname, 'index.html'));

  ipcMain.on('pet:bounds', updatePetBounds);
  ipcMain.on('pet:dragging', setPetDragging);

  // Let clicks pass through the transparent overlay, except while the pointer is
  // over the character so its click interaction remains available.
  pointerTimer = setInterval(() => {
    if (!petWindow || petWindow.isDestroyed()) return;
    if (isDraggingPet) return;
    const point = screen.getCursorScreenPoint();
    const insidePet = point.x >= petBounds.x && point.x <= petBounds.x + petBounds.width
      && point.y >= petBounds.y && point.y <= petBounds.y + petBounds.height;
    if (insidePet === isIgnoringMouse) {
      isIgnoringMouse = !insidePet;
      petWindow.setIgnoreMouseEvents(isIgnoringMouse, { forward: true });
    }
  }, 40);
}

app.whenReady().then(createWindow);
app.on('before-quit', () => clearInterval(pointerTimer));
app.on('window-all-closed', () => app.quit());
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
