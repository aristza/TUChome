// const { remote } = require("electron");
// const { BrowserWindow } = remote;
// const win = BrowserWindow.getFocusedWindow();

const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
const minimizeButton = document.getElementById("minimize-btn");
const maximizeButton = document.getElementById("maximize-btn");
const closeButton = document.getElementById("close-btn");
const suggestionItems = suggestions.querySelectorAll(".list-group-item");

let selectedSuggestionIndex = -1;

// Handle minimize, maximize, and close buttons
// minimizeButton.addEventListener("click", () => {
//   win.minimize();
// });

// maximizeButton.addEventListener("click", () => {
//   if (win.isMaximized()) {
//     win.unmaximize();
//   } else {
//     win.maximize();
//   }
// });

// closeButton.addEventListener("click", () => {
//   win.close();
// });

// Handle search bar with auto-suggestions (example)
const data = [
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Fig",
  "Grape",
  "Lemon",
  "Mango",
  "Orange",
  "Peach",
  "Pear",
  "Plum",
];

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  suggestions.innerHTML = "";

  if (value) {
    suggestions.style.display = "block";
    const filteredData = data.filter((item) =>
      item.toLowerCase().includes(value)
    );
    filteredData.forEach((item) => {
      const suggestion = document.createElement("li");
      suggestion.classList.add("list-group-item");
      suggestion.textContent = item;
      suggestions.appendChild(suggestion);

      suggestion.addEventListener("click", () => {
        searchInput.value = item;
        suggestions.innerHTML = "";
      });

      suggestion.addEventListener("mouseover", () => {
        setSelectedSuggestion(index);
      });
    });
    suggestionItems = suggestions.querySelectorAll(".list-group-item");
  } else {
    suggestions.style.display = "none";
  }
});

searchInput.addEventListener("keydown", (e) => {
  if (suggestionItems.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    setSelectedSuggestion(selectedSuggestionIndex + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setSelectedSuggestion(selectedSuggestionIndex - 1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (
      selectedSuggestionIndex >= 0 &&
      selectedSuggestionIndex < suggestionItems.length
    ) {
      searchInput.value = suggestionItems[selectedSuggestionIndex].textContent;
      suggestions.innerHTML = "";
    }
  }
});

function setSelectedSuggestion(index) {
  suggestionItems.forEach((item) => item.classList.remove("active"));
  if (index >= 0 && index < suggestionItems.length) {
    suggestionItems[index].classList.add("active");
    selectedSuggestionIndex = index;
  } else {
    selectedSuggestionIndex = -1;
  }
}

// suggestions.addEventListener("click", (e) => {
//   if (e.target.tagName === "LI") {
//     searchInput.value = e.target.textContent;
//     suggestions.innerHTML = "";
//   }
// });
