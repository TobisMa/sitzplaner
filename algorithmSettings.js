let template_studentListContextMenu;
let sitWith = {};
let forbiddenNeighbours = {};
let firstRow = [];
let notLastRow = [];
let contextMenuOpen = false;

const KEY_RULES = "rules";

function updateRulesToStorage() {
    saveToLocalStorage(KEY_RULES, {
        sitWith,
        forbiddenNeighbours,
        firstRow,
        notLastRow
    });
}


function toggleFirstRow(name) {
    if (firstRow.includes(name)) {
        firstRow.splice(firstRow.indexOf(name), 1);
    }
    else {
        firstRow.push(name);
    }
}

function toggleNotLastRow(name) {
    if (notLastRow.includes(name)) {
        notLastRow.splice(notLastRow.indexOf(name), 1);
    }
    else {
        notLastRow.push(name);
    }
}


function openContextMenu(e) {
    if (contextMenuOpen) {
        return;
    }
    contextMenuOpen = true;
    let menu = template_studentListContextMenu.content.cloneNode(true);
    let containerNode = menu.querySelector("#student-contextmenu");

    let studentName;
    if (e.target.classList.contains("student-name")) {
        studentName = e.target.innerText;
    }
    else {
        studentName = e.target.querySelector(".student-name").innerText;
    }

    if (!studentName) {
        console.debug("No student name", e);
        contextMenuOpen = false;
        return;
    }

    // set event listeners
    let firstRowCb = containerNode.querySelector("#first-row");
    firstRowCb.addEventListener("change", (e) => {
        toggleFirstRow(studentName);
    })
    firstRowCb.checked = firstRow.includes(studentName);

    let notLastRowCb = containerNode.querySelector("#not-last-row");
    notLastRowCb.addEventListener("change", (e) => {
        toggleNotLastRow(studentName);
    })
    notLastRowCb.checked = notLastRow.includes(studentName);

    document.body.appendChild(menu);
    containerNode.style.left = e.clientX + "px";
    containerNode.style.top = e.clientY + "px";
}

function closeContextMenu(e) {
    if (!contextMenuOpen) {
        return;
    }
    let currentMenu = document.getElementById("student-contextmenu");
    currentMenu.parentNode.removeChild(currentMenu);
    contextMenuOpen = false;
}

function studentContextmenu(e) {
    e.preventDefault();
    e.stopPropagation();
    if (contextMenuOpen) {
        closeContextMenu(e);
    }
    openContextMenu(e);
}


window.addEventListener("keydown", (e) => {
    if (contextMenuOpen && e.key === "Escape") {
        e.preventDefault();
        closeContextMenu(e);
    }
})

window.addEventListener("click", (e) => {
    if (contextMenuOpen) {
        let menu = document.querySelector("#student-contextmenu");
        let clientRect = menu.getBoundingClientRect();
        if (clientRect.left > e.x || clientRect.right < e.x || clientRect.top > e.y || clientRect.bottom < e.y ) {
            menu.parentNode.removeChild(menu);
            contextMenuOpen = false;
        }
    }
});

window.addEventListener("contextmenu", (e) => {
    closeContextMenu(e);
});

window.addEventListener("DOMContentLoaded", (e) => {
    template_studentListContextMenu = document.getElementById("templ-student-contextmenu");
})