let template_studentListContextMenu;
let template_sittingRulesDialog;
let template_ruleSingleStudent;

let sitWith = {};
let forbiddenNeighbours = {};
let firstRow = [];
let notLastRow = [];
let contextMenuOpen = false;

const KEY_RULES = "rules";

function updateRulesToStorage() {
    saveToStorage(KEY_RULES, {
        sitWith,
        forbiddenNeighbours,
        firstRow,
        notLastRow
    });
    buildDialogDataLists();
}

function buildDialogDataLists() {
    // update data lists
    let dialog = document.querySelector("#sitting-rules");
    if (dialog === null) {
        console.debug("Datalist build failed. No dialog");
        return;
    }
    let firstRowDl = document.querySelector("#student-in-front");
    firstRowDl.innerHTML = ""; // clear
    globalStudents.forEach(name => {
        if (firstRow.includes(name)) {
            return;
        }
        let opt = document.createElement("option");
        opt.value = name;
        opt.innerText = name;
        firstRowDl.appendChild(opt);
    })
    let notLastRowDl = document.querySelector("#student-not-in-back");
    notLastRowDl.innerHTML = ""; // clear
    globalStudents.forEach(name => {
        if (notLastRow.includes(name)) {
            return;
        }
        let opt = document.createElement("option");
        opt.value = name;
        opt.innerText = name;
        notLastRowDl.appendChild(opt);
    })
}


function toggleFirstRow(name) {
    if (firstRow.includes(name)) {
        firstRow.splice(firstRow.indexOf(name), 1);
    }
    else {
        firstRow.push(name);
    }
    updateRulesToStorage();
}

function toggleNotLastRow(name) {
    if (notLastRow.includes(name)) {
        notLastRow.splice(notLastRow.indexOf(name), 1);
    }
    else {
        notLastRow.push(name);
    }
    updateRulesToStorage();
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

    let btnRules = containerNode.querySelector("#btn-sitrules");
    btnRules.addEventListener("click", (e) => {
        closeContextMenu();
        sittingRulesDialogOpen();
    });

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


function sittingRulesDialogOpen() {
    let dialogFrag = template_sittingRulesDialog.content.cloneNode(true);
    let dialogNode = dialogFrag.querySelector("dialog");
    dialogNode.onclose = (e) => {
        document.body.removeChild(dialogNode);
    };

    // build actual content
    let studentFrontLs = dialogNode.querySelector("#students-sitting-in-front");
    firstRow.forEach(name => {
        addSingleStudentToRuleList(name, studentFrontLs, firstRow);
    });

    let studentNotLastRowLs = dialogNode.querySelector("#students-not-sitting-in-back");
    notLastRow.forEach(name => {
        addSingleStudentToRuleList(name, studentNotLastRowLs, notLastRow);
    })

    let ffront = dialogNode.querySelector("#add-student-front");
    ffront.addEventListener("submit", (e) => {
        e.preventDefault();
        let i = ffront.querySelector("input[name='student-name']");
        if (!globalStudents.includes(i.value) || firstRow.includes(i.value)) {
            return;
        }
        firstRow.push(i.value);
        addSingleStudentToRuleList(i.value, studentFrontLs, firstRow);
        updateRulesToStorage();
    })

    let fnotBack = dialogNode.querySelector("#add-student-not-in-back");
    fnotBack.addEventListener("submit", (e) => {
        e.preventDefault();
        let i = fnotBack.querySelector("input[name='student-name']");
        if (!globalStudents.includes(i.value) || notLastRow.includes(i.value)) {
            return;
        }
        notLastRow.push(i.value);
        addSingleStudentToRuleList(i.value, studentNotLastRowLs, notLastRow);
        updateRulesToStorage();
    })

    document.body.appendChild(dialogFrag);
    dialogNode.showModal();

    buildDialogDataLists();
}

function addSingleStudentToRuleList(name, list, arr) {
    let li = template_ruleSingleStudent.content.cloneNode(true);
    li.querySelector(".student-name").innerText = name;
    li.querySelector(".delete-button").addEventListener("click", (e) => {
        let children = list.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].querySelector(".student-name").innerText === name) {
                list.removeChild(children[i]);
                if (arr.indexOf(name) !== -1) {
                    arr.splice(arr.indexOf(name), 1);
                }
                updateRulesToStorage();
                return;
            }
        }
    });
    list.appendChild(li);
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
    template_sittingRulesDialog = document.getElementById("templ-rules-dialog");
    template_ruleSingleStudent = document.getElementById("templ-single-student-sit-rule-item");

    let rules = loadFromStorage(KEY_RULES, {
        sitWith: [],
        forbiddenNeighbours: [],
        firstRow: [],
        notLastRow: []
    });

    sitWith = rules.sitWith ?? [];
    forbiddenNeighbours = rules.forbiddenNeighbours ?? [];
    firstRow = rules.firstRow ?? [];
    notLastRow = rules.notLastRow ?? [];
})