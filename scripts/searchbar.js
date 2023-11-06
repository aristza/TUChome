const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
const suggestionItems = suggestions.querySelectorAll(".list-group-item");

// Handle search bar with auto-suggestions (example)
var data = [];

window.electronAPI.searchItems();
window.electronAPI.searchItemsList((event, data2) => (data = data2));

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
        window.electronAPI.searchItemSelected(parseInt(item));
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

// searchInput.addEventListener("keydown", (e) => {
//   if (suggestionItems.length === 0) return;

//   if (e.key === "ArrowDown") {
//     e.preventDefault();
//     setSelectedSuggestion(selectedSuggestionIndex + 1);
//   } else if (e.key === "ArrowUp") {
//     e.preventDefault();
//     setSelectedSuggestion(selectedSuggestionIndex - 1);
//   } else if (e.key === "Enter") {
//     e.preventDefault();
//     if (
//       selectedSuggestionIndex >= 0 &&
//       selectedSuggestionIndex < suggestionItems.length
//     ) {
//       searchInput.value = suggestionItems[selectedSuggestionIndex].textContent;
//       suggestions.innerHTML = "";
//     }
//   }
// });

// function setSelectedSuggestion(index) {
//   suggestionItems.forEach((item) => item.classList.remove("active"));
//   if (index >= 0 && index < suggestionItems.length) {
//     suggestionItems[index].classList.add("active");
//     selectedSuggestionIndex = index;
//   } else {
//     selectedSuggestionIndex = -1;
//   }
// }
