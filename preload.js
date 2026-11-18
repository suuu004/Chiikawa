const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petApp', {
  reportPetBounds: (bounds) => ipcRenderer.send('pet:bounds', bounds),
  setDragging: (dragging) => ipcRenderer.send('pet:dragging', dragging)
});
