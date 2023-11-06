const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  fileSelected: (filePath) => ipcRenderer.send("file-selected", filePath),
  roomSelected: (roomId) => ipcRenderer.send("room-selected", roomId),
  peopleList: (callback) => ipcRenderer.on("people-list", callback),
  removeListenerPeopleList: () =>
    ipcRenderer.removeListener("people-list", () => {}),
  occupancyRequest: () => ipcRenderer.send("occupancy-requested"),
  roomsOccupancy: () => ipcRenderer.send("rooms-occupancy-requested"),
  roomsOccupancyList: (callback) =>
    ipcRenderer.on("rooms-occupancy-list", callback),
  searchItems: () => ipcRenderer.send("search-items-requested"),
  searchItemsList: (callback) => ipcRenderer.on("search-items-list", callback),
  searchItemSelected: (roomId) =>
    ipcRenderer.send("search-item-selected", roomId),
  occupancyList: (callback) => ipcRenderer.on("occupancy-list", callback),
  minimizeWin: () => ipcRenderer.send("win-minimize"),
  maximizeWin: () => ipcRenderer.send("win-maximize"),
  closeWin: () => ipcRenderer.send("win-close"),
  toMap: () => ipcRenderer.send("navigate-map"),
  toComplex: (num) => ipcRenderer.send("navigate-complex", num),
  canReceive: () => ipcRenderer.send("can-receive"),
});
