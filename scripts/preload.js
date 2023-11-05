const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  fileSelected: (filePath) => ipcRenderer.send("file-selected", filePath),
  roomSelected: (roomId) => ipcRenderer.send("room-selected", roomId),
  peopleList: (callback) => ipcRenderer.on("people-list", callback),
  removeListenerPeopleList: () =>
    ipcRenderer.removeListener("people-list", () => {}),
  occupancyRequest: () => ipcRenderer.send("occupancy-requested"),
  occupancyList: (callback) => ipcRenderer.on("occupancy-list", callback),
  minimizeWin: () => ipcRenderer.send("win-minimize"),
  maximizeWin: () => ipcRenderer.send("win-maximize"),
  closeWin: () => ipcRenderer.send("win-close"),
  toMap: () => ipcRenderer.send("navigate-map"),
  toComplex: (num) => ipcRenderer.send("navigate-complex", num),
});
