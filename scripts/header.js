const minimizeButton = document.getElementById("minimize-btn");
const maximizeButton = document.getElementById("maximize-btn");
const closeButton = document.getElementById("close-btn");

let selectedSuggestionIndex = -1;

// Handle minimize, maximize, and close buttons
minimizeButton.addEventListener("click", () => {
  window.electronAPI.minimizeWin();
});

maximizeButton.addEventListener("click", () => {
  window.electronAPI.maximizeWin();
});

closeButton.addEventListener("click", () => {
  window.electronAPI.closeWin();
});
