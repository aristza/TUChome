const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  fileSelected: (filePath) => ipcRenderer.send("file-selected", filePath),
  roomSelected: (roomId) => ipcRenderer.send("room-selected", roomId),
  minimizeWin: () => ipcRenderer.send("win-minimize"),
  maximizeWin: () => ipcRenderer.send("win-maximize"),
  closeWin: () => ipcRenderer.send("win-close"),
  toMap: () => ipcRenderer.send("navigate-map"),
  toComplex: (num) => ipcRenderer.send("navigate-complex", num),
});
