let printTitle = "";
let titleHTML;

function setPrintTitle(title) {
    printTitle = title;
    titleHTML.innerText = title;
    saveToStorage(KEY_PRINT_TITLE, printTitle);
}

window.addEventListener("DOMContentLoaded", e => {
    titleHTML = document.getElementById("print-title");
    setPrintTitle(loadFromStorage(KEY_PRINT_TITLE, ""))
});